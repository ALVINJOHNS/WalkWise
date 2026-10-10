from fastapi import APIRouter, HTTPException

router = APIRouter()


def not_implemented(domain: str) -> None:
    raise HTTPException(status_code=501, detail={"error": "not_implemented", "domain": domain})


@router.get("/venues")
def venues() -> None:
    not_implemented("venues")


@router.get("/venues/{venue_id}")
def venue_detail(venue_id: str) -> None:
    not_implemented("venues")


@router.get("/events")
def events() -> None:
    not_implemented("events")


@router.get("/events/{event_id}")
def event_detail(event_id: str) -> None:
    not_implemented("events")


@router.post("/route")
def route_request() -> None:
    not_implemented("routing")
