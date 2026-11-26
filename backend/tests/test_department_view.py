import json
import threading
import urllib.error
import urllib.request

from calibration.api import serve
from calibration.store import division_cycle, engineering_cycle
from calibration.model import Band, Group, Person, SelfReview, SessionState
from calibration.view import department_view_json


def test_engineering_is_open_and_has_no_person_lines() -> None:
    view = department_view_json(engineering_cycle())
    department = view["department"]

    assert department["name"] == "Engineering"
    assert department["session"] == "open"
    assert department["personLines"] == []
    assert department["flagged"] is False
    assert department["exceedingShare"] == 33
    assert department["aiSummary"] is None
    assert department["spread"] == [
        {"band": "Below", "count": 1},
        {"band": "Developing", "count": 3},
        {"band": "Strong", "count": 4},
        {"band": "Exceeding", "count": 3},
        {"band": "Exceptional", "count": 1},
    ]


def test_platform_histogram_counts_both_ratings_for_eight_people() -> None:
    view = department_view_json(engineering_cycle())
    platform = view["groups"][0]

    assert platform["name"] == "Platform"
    assert platform["managerName"] == "Avery Cole"
    assert platform["session"] == "closed"
    assert platform["spread"] == [
        {"band": "Below", "count": 2},
        {"band": "Developing", "count": 3},
        {"band": "Strong", "count": 4},
        {"band": "Exceeding", "count": 5},
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
            "previousCraft": "Developing",
            "previousCulture": "Strong",
            "reason": "Scope grew",
            "session": "Platform",
            "changedAt": "2026-03-01T08:00:00Z",
            "changedBy": "Avery Cole",
        }
    ]
    assert "new" not in first["ratingChanges"][0]
    assert second["cultureRating"] == "Strong"
    assert second["ratingChanges"] == [
        {
            "previousCraft": "Exceeding",
            "previousCulture": "Below",
            "reason": "Steadier collaboration",
            "session": "Platform",
            "changedAt": "2026-03-01T08:00:00Z",
            "changedBy": "Avery Cole",
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


def test_engineering_histogram_is_only_the_hidden_teams() -> None:
    view = department_view_json(engineering_cycle())
    by_name = {group["name"]: group for group in view["groups"]}
    department = view["department"]

    assert department["personLines"] == []
    assert department["flagged"] is False
    assert department["spread"] is not None
    assert sum(band["count"] for band in department["spread"]) == 12
    assert sum(band["count"] for band in by_name["Platform"]["spread"]) == 16
    assert by_name["Platform"]["exceedingShare"] == 44
    assert sum(band["count"] for band in by_name["Infra"]["spread"]) == 12
    assert by_name["Infra"]["exceedingShare"] == 17
    assert by_name["Design"]["exceedingShare"] == 50
    assert by_name["Research"]["exceedingShare"] == 17
    assert by_name["Design"]["spread"] is None
    assert by_name["Research"]["spread"] is None


def test_engineering_session_change_appears_on_the_design_person_line() -> None:
    view = department_view_json(engineering_cycle())
    design = next(group for group in view["groups"] if group["name"] == "Design")
    line = next(person for person in design["personLines"] if person["id"] == "design-1")

    assert line["craftRating"] == "Exceeding"
    assert line["cultureRating"] == "Exceeding"
    assert line["ratingChanges"] == [
        {
            "previousCraft": "Exceeding",
            "previousCulture": "Strong",
            "reason": "The critique holds up across Engineering",
            "session": "Engineering",
            "changedAt": "2026-03-01T08:30:00Z",
            "changedBy": "Jordan Hale",
        }
    ]
    assert view["department"]["personLines"] == []


def test_a_department_still_under_five_draws_no_histogram_and_rolls_onward() -> None:
    division = department_view_json(division_cycle())
    department = division["department"]
    by_name = {group["name"]: group for group in division["groups"]}

    assert department["name"] == "Division"
    assert department["personLines"] == []
    assert department["spread"] == [
        {"band": "Below", "count": 0},
        {"band": "Developing", "count": 4},
        {"band": "Strong", "count": 8},
        {"band": "Exceeding", "count": 0},
        {"band": "Exceptional", "count": 0},
    ]
    assert by_name["Product"]["spread"] is None
    assert by_name["Product"]["exceedingShare"] == 0
    assert by_name["Product"]["personLines"] == []
    assert by_name["Support"]["spread"] is None

    product = department_view_json(next(group for group in division_cycle().children if group.name == "Product"))
    product_groups = {group["name"]: group for group in product["groups"]}
    assert product["department"]["spread"] is None
    assert product["department"]["personLines"] == []
    assert product_groups["North"]["spread"] is None
    assert len(product_groups["North"]["personLines"]) == 2
    assert product_groups["South"]["spread"] is None
    assert len(product_groups["South"]["personLines"]) == 2

    engineering = department_view_json(engineering_cycle())["department"]
    assert engineering["spread"] is not None
    assert sum(band["count"] for band in engineering["spread"]) == 12


def test_platform_is_flagged_and_infra_is_not() -> None:
    view = department_view_json(engineering_cycle())
    by_name = {group["name"]: group for group in view["groups"]}

    platform = by_name["Platform"]
    infra = by_name["Infra"]
    assert platform["flagged"] is True
    assert platform["aiSummary"] == (
        "More than 40% of the ratings are Exceeding or Exceptional. "
        "The written evidence cites setting the technical direction, "
        "redefining the platform approach, and leading the incident response."
    )
    assert infra["flagged"] is False
    assert infra["aiSummary"] is None
    assert infra["spread"] == [
        {"band": "Below", "count": 0},
        {"band": "Developing", "count": 4},
        {"band": "Strong", "count": 6},
        {"band": "Exceeding", "count": 2},
        {"band": "Exceptional", "count": 0},
    ]
    assert len(infra["personLines"]) == 6
    assert "name" not in infra["personLines"][0]


def test_hidden_groups_stay_visible_and_only_design_is_flagged() -> None:
    view = department_view_json(engineering_cycle())
    by_name = {group["name"]: group for group in view["groups"]}
    design = by_name["Design"]
    research = by_name["Research"]

    assert design["session"] == "closed"
    assert design["spread"] is None
    assert design["flagged"] is True
    assert len(design["personLines"]) == 3
    assert design["aiSummary"] == (
        "More than 40% of the ratings are Exceeding or Exceptional. "
        "The written evidence cites raising the visual bar and holding the critique standard."
    )
    assert research["session"] == "closed"
    assert research["spread"] is None
    assert research["flagged"] is False
    assert research["aiSummary"] is None
    assert len(research["personLines"]) == 3
    assert "name" not in research["personLines"][0]


def test_exactly_forty_percent_is_not_a_flag_and_more_than_forty_percent_is() -> None:
    even = _rated(
        "even",
        (
            (Band.EXCEEDING, Band.EXCEEDING),
            (Band.EXCEPTIONAL, Band.EXCEPTIONAL),
            (Band.STRONG, Band.STRONG),
            (Band.STRONG, Band.DEVELOPING),
            (Band.DEVELOPING, Band.BELOW),
        ),
    )
    over = _rated(
        "over",
        (
            (Band.EXCEEDING, Band.EXCEEDING),
            (Band.EXCEPTIONAL, Band.EXCEPTIONAL),
            (Band.EXCEEDING, Band.STRONG),
            (Band.STRONG, Band.DEVELOPING),
            (Band.DEVELOPING, Band.BELOW),
        ),
    )

    even_view = department_view_json(
        Group(
            name="Engineering",
            session=SessionState.OPEN,
            children=(
                Group(
                    name="Boundary",
                    session=SessionState.CLOSED,
                    people=even,
                    ai_summary="This text does not decide the flag.",
                ),
            ),
        )
    )
    over_view = department_view_json(
        Group(
            name="Engineering",
            session=SessionState.OPEN,
            children=(
                Group(
                    name="Boundary",
                    session=SessionState.CLOSED,
                    people=over,
                    ai_summary="Too many ratings sit at the top of the scale.",
                ),
            ),
        )
    )

    assert even_view["groups"][0]["spread"] is not None
    assert even_view["groups"][0]["flagged"] is False
    assert even_view["groups"][0]["aiSummary"] is None
    assert over_view["groups"][0]["flagged"] is True
    assert over_view["groups"][0]["aiSummary"] == "Too many ratings sit at the top of the scale."


def _rated(prefix: str, pairs: tuple[tuple[Band, Band], ...]) -> tuple[Person, ...]:
    return tuple(
        Person(
            id=f"{prefix}-{index}",
            craft_rating=craft,
            culture_rating=culture,
            craft_justification="Craft note",
            culture_justification="Culture note",
            self_review=SelfReview(craft="Own craft", culture="Own culture", whats_next="Next"),
        )
        for index, (craft, culture) in enumerate(pairs)
    )


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
