from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from calibration.model import Band, Group, Person, RatingChange, SelfReview, SessionState


def data_dir() -> Path:
    return Path(__file__).resolve().parents[2] / "db"


def load_collection(name: str) -> list[dict[str, Any]]:
    path = data_dir() / f"{name}.json"
    with path.open(encoding="utf-8") as handle:
        loaded = json.load(handle)
    if not isinstance(loaded, list):
        raise TypeError(f"{name} must be a list of documents")
    documents: list[dict[str, Any]] = []
    for document in loaded:
        if not isinstance(document, dict):
            raise TypeError(f"{name} documents must be objects")
        documents.append(document)
    return documents


def engineering_cycle() -> Group:
    return _cycle("cycle-2026")


def division_cycle() -> Group:
    return _cycle("cycle-division")


def _cycle(cycle_id: str) -> Group:
    cycles = load_collection("cycles")
    cycle = next(item for item in cycles if item["_id"] == cycle_id)
    groups = load_collection("groups")
    names = _names()
    session_managers = {
        str(group["name"]): names[str(group["manager_id"])]
        for group in groups
        if isinstance(group.get("manager_id"), str) and str(group.get("manager_id")) in names
    }
    return _group(str(cycle["root_group_id"]), groups, _people(session_managers), _summaries(), names)


def _names() -> dict[str, str]:
    names: dict[str, str] = {}
    for user in load_collection("users"):
        name = user.get("Name")
        if isinstance(name, str):
            names[str(user["_id"])] = name
    return names


def _people(session_managers: dict[str, str]) -> dict[str, Person]:
    reviews = _index(load_collection("user_reviews"), "user_id")
    assessments = _index(load_collection("manager_reviews"), "user_id")
    people: dict[str, Person] = {}
    for user_id, assessment in assessments.items():
        review = reviews[user_id]
        craft = str(assessment["Craft_score"])
        culture = str(assessment["Culture_score"])
        history = assessment["Calibration_history"]
        if not isinstance(history, list):
            raise TypeError("Calibration_history must be a list")
        people[user_id] = Person(
            id=user_id,
            craft_rating=Band(craft),
            culture_rating=Band(culture),
            craft_justification=str(assessment["Craft_score_justification"]),
            culture_justification=str(assessment["Culture_score_justification"]),
            self_review=SelfReview(
                craft=str(review["Craft_review"]),
                culture=str(review["Culture_review"]),
                whats_next=str(review["Whats_next_review"]),
            ),
            rating_changes=_rating_changes(history, craft, culture, session_managers),
        )
    return people


def _rating_changes(
    history: list[Any],
    craft: str,
    culture: str,
    session_managers: dict[str, str],
) -> tuple[RatingChange, ...]:
    if not history:
        return ()
    following = [
        {
            "Craft_score": str(entry["Craft_score"]),
            "Culture_score": str(entry["Culture_score"]),
        }
        for entry in history[1:]
    ]
    following.append({"Craft_score": craft, "Culture_score": culture})
    changes: list[RatingChange] = []
    for entry, nxt in zip(history, following, strict=True):
        previous_craft = str(entry["Craft_score"])
        previous_culture = str(entry["Culture_score"])
        craft_changed = previous_craft != nxt["Craft_score"]
        culture_changed = previous_culture != nxt["Culture_score"]
        if craft_changed == culture_changed:
            raise ValueError("a rating change records one axis")
        session = str(entry["Session"])
        changes.append(
            RatingChange(
                previous_craft=Band(previous_craft),
                previous_culture=Band(previous_culture),
                reason=str(entry["Justification"]),
                session=session,
                changed_at=str(entry["Timestamps"]),
                changed_by=session_managers[session],
            )
        )
    return tuple(changes)


def _summaries() -> dict[str, str | None]:
    summaries: dict[str, str | None] = {}
    for calibration in load_collection("calibrations"):
        review = calibration["Ai_review"]
        summaries[str(calibration["manager_id"])] = review if isinstance(review, str) else None
    return summaries


def _group(
    group_id: str,
    groups: list[dict[str, Any]],
    people: dict[str, Person],
    summaries: dict[str, str | None],
    names: dict[str, str],
) -> Group:
    document = next(group for group in groups if group["_id"] == group_id)
    member_ids = document["member_ids"]
    if not isinstance(member_ids, list):
        raise TypeError("member_ids must be a list")
    children = [group for group in groups if group["parent_id"] == group_id]
    manager_id = document.get("manager_id")
    summary = summaries.get(str(manager_id)) if isinstance(manager_id, str) else None
    manager_name = names.get(str(manager_id)) if isinstance(manager_id, str) else None
    return Group(
        name=str(document["name"]),
        session=SessionState(str(document["session"])),
        people=tuple(people[str(member_id)] for member_id in member_ids),
        children=tuple(
            _group(str(child["_id"]), groups, people, summaries, names) for child in children
        ),
        ai_summary=summary,
        manager_name=manager_name,
    )


def _index(documents: list[dict[str, Any]], key: str) -> dict[str, dict[str, Any]]:
    return {str(document[key]): document for document in documents}
