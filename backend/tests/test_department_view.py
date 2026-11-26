import json
import threading
import urllib.error
import urllib.request

from calibration.api import serve
from calibration.fixture import engineering_cycle
from calibration.model import Band, Group, Person, SelfReview, SessionState
from calibration.view import department_view_json


def test_engineering_is_open_and_draws_no_histogram() -> None:
    view = department_view_json(engineering_cycle())
    department = view["department"]

    assert department["name"] == "Engineering"
    assert department["session"] == "open"
    assert department["spread"] is None
    assert department["personLines"] == []


def test_platform_histogram_counts_both_ratings_for_eight_people() -> None:
    view = department_view_json(engineering_cycle())
    platform = view["groups"][0]

    assert platform["name"] == "Platform"
    assert platform["session"] == "closed"
    assert platform["spread"] == [
        {"band": "Below", "count": 2},
        {"band": "Developing", "count": 3},
        {"band": "Strong", "count": 6},
        {"band": "Exceeding", "count": 3},
        {"band": "Exceptional", "count": 2},
    ]
    assert len(platform["personLines"]) == 8


def test_person_lines_have_no_name_and_keep_current_ratings() -> None:
    view = department_view_json(engineering_cycle())
    lines = view["groups"][0]["personLines"]

    assert [line["id"] for line in lines] == [f"person-{index}" for index in range(1, 9)]
    for line in lines:
        assert "name" not in line
        assert set(line) == {
            "id",
            "craftRating",
            "cultureRating",
            "craftJustification",
            "cultureJustification",
            "selfReview",
            "ratingChanges",
        }

    first, second = lines[0], lines[1]
    assert first["craftRating"] == "Strong"
    assert first["ratingChanges"] == [
        {
            "axis": "Craft",
            "previous": "Developing",
            "new": "Strong",
            "reason": "Scope grew",
            "session": "Platform",
        }
    ]
    assert second["cultureRating"] == "Strong"
    assert second["ratingChanges"] == [
        {
            "axis": "Culture",
            "previous": "Below",
            "new": "Strong",
            "reason": "Steadier collaboration",
            "session": "Platform",
        }
    ]
    assert lines[2]["ratingChanges"] == []
    assert lines[2]["craftJustification"] == "Missed the design bar"
    assert lines[2]["selfReview"]["whatsNext"] == "Next step after Missed the design bar"


def test_api_serves_the_department_and_refuses_writes() -> None:
    server = serve("127.0.0.1", 0)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    port = server.server_address[1]
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/api/department") as response:
            payload = json.load(response)
            assert response.status == 200
            assert response.headers["Content-Type"] == "application/json"
        assert payload["department"]["name"] == "Engineering"
        assert payload["groups"][0]["name"] == "Platform"

        request = urllib.request.Request(
            f"http://127.0.0.1:{port}/api/department",
            data=b"{}",
            method="POST",
        )
        try:
            urllib.request.urlopen(request)
        except urllib.error.HTTPError as error:
            assert error.code == 405
        else:
            raise AssertionError("POST should be refused")

        missing = urllib.request.Request(f"http://127.0.0.1:{port}/api/other")
        try:
            urllib.request.urlopen(missing)
        except urllib.error.HTTPError as error:
            assert error.code == 404
        else:
            raise AssertionError("Unknown paths should be missing")
    finally:
        server.shutdown()
        thread.join(timeout=2)


def _people(prefix: str, count: int) -> tuple[Person, ...]:
    return tuple(
        Person(
            id=f"{prefix}-{index}",
            craft_rating=Band.STRONG,
            culture_rating=Band.DEVELOPING,
            craft_justification="Craft note",
            culture_justification="Culture note",
            self_review=SelfReview(craft="Own craft", culture="Own culture", whats_next="Next"),
        )
        for index in range(count)
    )


def test_hidden_spreads_roll_into_the_parent_and_shown_ones_do_not() -> None:
    department = Group(
        name="Engineering",
        session=SessionState.OPEN,
        children=(
            Group(name="Platform", session=SessionState.CLOSED, people=_people("platform", 8)),
            Group(name="Design", session=SessionState.CLOSED, people=_people("design", 3)),
            Group(name="Research", session=SessionState.CLOSED, people=_people("research", 3)),
        ),
    )

    view = department_view_json(department)
    by_name = {group["name"]: group for group in view["groups"]}

    assert by_name["Platform"]["spread"] is not None
    assert by_name["Design"]["spread"] is None
    assert by_name["Research"]["spread"] is None
    assert len(by_name["Design"]["personLines"]) == 3
    spread = view["department"]["spread"]
    assert spread is not None
    assert sum(band["count"] for band in spread) == 12
    assert view["department"]["personLines"] == []
