"""Server-side OpenAI extraction for organizer-provided floor plans."""

import base64
import binascii
import json
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
            }
        },
        "required": ["destinations"],
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
                        "food, restrooms, registration, or rooms). Do not invent labels or infer paths. "
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
        destinations = json.loads(output_text)["destinations"]
    except (json.JSONDecodeError, KeyError, TypeError):
        raise FloorPlanAnalysisError("OpenAI did not return a usable destination list. Please try again.") from None
    if not isinstance(destinations, list):
        raise FloorPlanAnalysisError("OpenAI did not return a usable destination list. Please try again.")
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
        clean.append({
            "name": name,
            "category": str(item.get("category", "facility")).strip()[:60] or "facility",
            "description": str(item.get("description", "")).strip()[:1000],
            "plan_x": min(1, max(0, plan_x)),
            "plan_y": min(1, max(0, plan_y)),
            "confidence": min(1, max(0, confidence)),
        })
    return clean
