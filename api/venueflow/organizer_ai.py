"""Server-side OpenAI extraction for organizer-provided floor plans."""

import base64
import binascii
import json
import math
import os
import urllib.error
import urllib.request


MAX_IMAGE_BYTES = 10 * 1024 * 1024


class FloorPlanAnalysisError(Exception):
    """A safe, user-displayable floor-plan analysis failure."""


def _decode_image(data_url):
    if not isinstance(data_url, str) or "," not in data_url:
        raise FloorPlanAnalysisError("Choose a PNG or JPG floor plan first.")
    header, encoded = data_url.split(",", 1)
    mime_type = header.removeprefix("data:").removesuffix(";base64")
    if mime_type not in {"image/png", "image/jpeg"} or not header.endswith(";base64"):
        raise FloorPlanAnalysisError("Choose a PNG or JPG floor plan.")
    try:
        image = base64.b64decode(encoded, validate=True)
    except (binascii.Error, ValueError):
        raise FloorPlanAnalysisError("The selected floor plan could not be read.") from None
    if not image or len(image) > MAX_IMAGE_BYTES:
        raise FloorPlanAnalysisError("Floor plans must be smaller than 10 MB.")
    is_png = image.startswith(b"\x89PNG\r\n\x1a\n")
    is_jpeg = image.startswith(b"\xff\xd8\xff")
    if (mime_type == "image/png" and not is_png) or (mime_type == "image/jpeg" and not is_jpeg):
        raise FloorPlanAnalysisError("The image content does not match its PNG/JPG file type.")
    return mime_type, encoded


def extract_destinations(data_url):
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise FloorPlanAnalysisError(
            "AI suggestions are not configured yet. Set OPENAI_API_KEY on the server, then restart the app."
        )
    mime_type, encoded = _decode_image(data_url)
    schema = {
        "type": "object",
        "properties": {
            "destinations": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "category": {"type": "string"},
                        "description": {"type": "string"},
                        "plan_x": {"type": "number"},
                        "plan_y": {"type": "number"},
                        "confidence": {"type": "number"},
                    },
                    "required": ["name", "category", "description", "plan_x", "plan_y", "confidence"],
                    "additionalProperties": False,
                },
            },
            "path_points": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "index": {"type": "integer"},
                        "name": {"type": "string"},
                        "plan_x": {"type": "number"},
                        "plan_y": {"type": "number"},
                        "confidence": {"type": "number"},
                    },
                    "required": ["index", "name", "plan_x", "plan_y", "confidence"],
                    "additionalProperties": False,
                },
            },
            "path_edges": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "from_index": {"type": "integer"},
                        "to_index": {"type": "integer"},
                        "rationale": {"type": "string"},
                        "confidence": {"type": "number"},
                    },
                    "required": ["from_index", "to_index", "rationale", "confidence"],
                    "additionalProperties": False,
                },
            },
        },
        "required": ["destinations", "path_points", "path_edges"],
        "additionalProperties": False,
    }
    payload = {
        "model": os.environ.get("OPENAI_MODEL", "gpt-4.1-mini"),
        "input": [{
            "role": "user",
            "content": [
                {
                    "type": "input_text",
                    "text": (
                        "Inspect this venue floor plan and list only destinations or named/useful components "
                        "that are visibly labeled or clearly identifiable (for example entrances, stages, "
                        "food, restrooms, registration, or rooms). Treat every separate table with a visible "
                        "team label (such as Team 1, Team 2) as its own destination. Preserve the team label "
                        "exactly, set category to 'team table', and describe it as that team's developer "
                        "workspace. Never merge adjacent team tables. Also propose a small walkable network "
                        "only along corridors or passages clearly visible in the image; do not draw through "
                        "walls or infer hidden links. Label path points in order with integer indexes starting "
                        "at zero, and have each edge refer to those indexes. If no walkable route is clear, "
                        "return empty path_points and path_edges. These are approximate proposals that need "
                        "organizer verification. "
                        "For each item, estimate the center as normalized coordinates across the full image: "
                        "plan_x and plan_y from 0 to 1, origin at top left. Lower confidence when unsure. "
                        "Use a concise category and description. Return an empty list if nothing is identifiable."
                    ),
                },
                {"type": "input_image", "image_url": f"data:{mime_type};base64,{encoded}", "detail": "high"},
            ],
        }],
        "text": {
            "format": {
                "type": "json_schema",
                "name": "floor_plan_destinations",
                "strict": True,
                "schema": schema,
            }
        },
    }
    request = urllib.request.Request(
        "https://api.openai.com/v1/responses",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            result = json.loads(response.read())
    except urllib.error.HTTPError as error:
        if error.code in (401, 403):
            raise FloorPlanAnalysisError("OpenAI rejected the configured API key or project access (401/403).") from None
        if error.code == 429:
            raise FloorPlanAnalysisError("OpenAI rate limit or credit limit reached. Check the API project limits.") from None
        raise FloorPlanAnalysisError(f"OpenAI could not analyze this plan (HTTP {error.code}). Try again shortly.") from None
    except (urllib.error.URLError, TimeoutError):
        raise FloorPlanAnalysisError("Could not reach OpenAI. Check the server's network connection and try again.") from None
    except (json.JSONDecodeError, OSError):
        raise FloorPlanAnalysisError("OpenAI returned an unreadable response. Please try again.") from None

    output_text = "".join(
        item.get("text", "")
        for output in result.get("output", [])
        if output.get("type") == "message"
        for item in output.get("content", [])
        if item.get("type") == "output_text"
    )
    try:
        analysis = json.loads(output_text)
        destinations = analysis["destinations"]
        raw_path_points = analysis["path_points"]
        raw_path_edges = analysis["path_edges"]
    except (json.JSONDecodeError, KeyError, TypeError):
        raise FloorPlanAnalysisError("OpenAI did not return a usable plan analysis. Please try again.") from None
    if not all(isinstance(items, list) for items in (destinations, raw_path_points, raw_path_edges)):
        raise FloorPlanAnalysisError("OpenAI did not return a usable plan analysis. Please try again.")
    clean = []
    for item in destinations[:100]:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name", "")).strip()[:200]
        if not name:
            continue
        try:
            plan_x = float(item["plan_x"])
            plan_y = float(item["plan_y"])
            confidence = float(item["confidence"])
        except (KeyError, TypeError, ValueError, OverflowError):
            continue
        if not all(map(math.isfinite, (plan_x, plan_y, confidence))):
            continue
        clean.append({
            "name": name,
            "category": str(item.get("category", "facility")).strip()[:60] or "facility",
            "description": str(item.get("description", "")).strip()[:1000],
            "plan_x": min(1, max(0, plan_x)),
            "plan_y": min(1, max(0, plan_y)),
            "confidence": min(1, max(0, confidence)),
        })
    path_points = []
    point_indexes = set()
    for item in raw_path_points[:100]:
        if not isinstance(item, dict):
            continue
        try:
            index = int(item["index"])
            plan_x, plan_y = float(item["plan_x"]), float(item["plan_y"])
            confidence = float(item["confidence"])
        except (KeyError, TypeError, ValueError, OverflowError):
            continue
        if index < 0 or index > 99 or index in point_indexes or not all(map(math.isfinite, (plan_x, plan_y, confidence))):
            continue
        point_indexes.add(index)
        path_points.append({
            "index": index,
            "name": str(item.get("name", "Path point")).strip()[:100] or "Path point",
            "plan_x": min(1, max(0, plan_x)),
            "plan_y": min(1, max(0, plan_y)),
            "confidence": min(1, max(0, confidence)),
        })
    path_edges = []
    seen_edges = set()
    for item in raw_path_edges[:300]:
        if not isinstance(item, dict):
            continue
        try:
            from_index, to_index = int(item["from_index"]), int(item["to_index"])
            confidence = float(item["confidence"])
        except (KeyError, TypeError, ValueError, OverflowError):
            continue
        key = tuple(sorted((from_index, to_index)))
        if (from_index == to_index or from_index not in point_indexes or to_index not in point_indexes
                or key in seen_edges or not math.isfinite(confidence)):
            continue
        seen_edges.add(key)
        path_edges.append({
            "from_index": from_index,
            "to_index": to_index,
            "rationale": str(item.get("rationale", "Visible connection"))[:300],
            "confidence": min(1, max(0, confidence)),
        })
    return {"destinations": clean, "path_points": path_points, "path_edges": path_edges}
