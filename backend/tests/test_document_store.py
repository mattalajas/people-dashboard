from calibration.store import engineering_cycle, load_collection
from calibration.view import department_view_json


def test_documents_follow_the_proposed_collections() -> None:
    users = load_collection("users")
    user_reviews = load_collection("user_reviews")
    manager_reviews = load_collection("manager_reviews")
    calibrations = load_collection("calibrations")

    person = next(user for user in users if user["_id"] == "person-1")
    assert set(person) == {"_id", "manager_id", "Team", "Department"}
    assert person["manager_id"] == "manager-platform"
    assert person["Team"] == "Platform"
    assert person["Department"] == "Engineering"

    review = next(item for item in user_reviews if item["user_id"] == "person-1")
    assert set(review) == {
        "_id",
        "user_id",
        "Craft_review",
        "Culture_review",
        "Whats_next_review",
        "Timestamps",
    }
    assert review["Craft_review"] == "Took on the rollout in their own words"

    assessment = next(item for item in manager_reviews if item["user_id"] == "person-1")
    assert set(assessment) == {
        "_id",
        "user_id",
        "manager_id",
        "Craft_score",
        "Culture_score",
        "Craft_score_justification",
        "Culture_score_justification",
        "Locked",
        "Timestamps",
        "Calibration_history",
    }
    assert assessment["Locked"] is True
    history = assessment["Calibration_history"]
    assert set(history[0]) == {
        "Craft_score",
        "Culture_score",
        "Justification",
        "Timestamps",
        "Session",
    }
    assert history[0]["Craft_score"] == "Developing"
    assert history[0]["Culture_score"] == "Strong"
    assert history[0]["Justification"] == "Scope grew"
    assert history[0]["Session"] == "Platform"

    platform = next(item for item in calibrations if item["_id"] == "calibration-platform")
    engineering = next(item for item in calibrations if item["_id"] == "calibration-engineering")
    assert set(platform) == {"_id", "manager_id", "group_reviews", "Ai_review"}
    assert platform["manager_id"] == "manager-platform"
    assert platform["Ai_review"] == (
        "More than 40% of the ratings are Exceeding or Exceptional. "
        "The written evidence cites setting the technical direction, "
        "redefining the platform approach, and leading the incident response."
    )
    assert len(platform["group_reviews"]) == 8
    assert set(platform["group_reviews"][0]) == {"User_review_id", "Manager_review_id"}
    assert engineering["group_reviews"] == []
    assert engineering["Ai_review"] is None


def test_group_documents_hold_the_session_tree() -> None:
    groups = load_collection("groups")
    engineering = next(group for group in groups if group["name"] == "Engineering")
    platform = next(group for group in groups if group["name"] == "Platform")

    assert engineering["session"] == "open"
    assert engineering["parent_id"] is None
    assert engineering["member_ids"] == []
    assert platform["parent_id"] == engineering["_id"]
    assert platform["session"] == "closed"
    assert platform["member_ids"] == [f"person-{index}" for index in range(1, 9)]


def test_managers_stay_off_the_person_lines() -> None:
    view = department_view_json(engineering_cycle())
    shown = [line["id"] for line in view["groups"][0]["personLines"]]

    assert "manager-platform" not in shown
    assert "manager-engineering" not in shown
    assert shown == [f"person-{index}" for index in range(1, 9)]
