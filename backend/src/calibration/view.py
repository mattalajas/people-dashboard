from __future__ import annotations

from typing import Any

from calibration.model import Band, Group, Person

MINIMUM_SHOWN_SPREAD = 5
_HIGH_BANDS = frozenset({Band.EXCEEDING, Band.EXCEPTIONAL})


def spread_people(group: Group) -> tuple[Person, ...]:
    rolled: list[Person] = []
    for child in group.children:
        child_people = spread_people(child)
        if len(child_people) < MINIMUM_SHOWN_SPREAD:
            rolled.extend(child_people)
    return tuple(group.people) + tuple(rolled)


def department_view_json(department: Group) -> dict[str, Any]:
    return {
        "department": _group_json(department),
        "groups": [_group_json(child) for child in department.children],
    }


def _group_json(group: Group) -> dict[str, Any]:
    people = spread_people(group)
    flagged = _flagged(people)
    return {
        "name": group.name,
        "session": group.session.value,
        "spread": _spread_json(people),
        "flagged": flagged,
        "aiSummary": group.ai_summary if flagged else None,
        "personLines": [_person_line_json(person) for person in group.people],
    }


def _flagged(people: tuple[Person, ...]) -> bool:
    if not people:
        return False
    high = 0
    for person in people:
        if person.craft_rating in _HIGH_BANDS:
            high += 1
        if person.culture_rating in _HIGH_BANDS:
            high += 1
    return high * 5 > len(people) * 4


def _spread_json(people: tuple[Person, ...]) -> list[dict[str, Any]] | None:
    if len(people) < MINIMUM_SHOWN_SPREAD:
        return None
    counts = {band: 0 for band in Band}
    for person in people:
        counts[person.craft_rating] += 1
        counts[person.culture_rating] += 1
    return [{"band": band.value, "count": counts[band]} for band in Band]


def _person_line_json(person: Person) -> dict[str, Any]:
    return {
        "id": person.id,
        "craftRating": person.craft_rating.value,
        "cultureRating": person.culture_rating.value,
        "craftJustification": person.craft_justification,
        "cultureJustification": person.culture_justification,
        "selfReview": {
            "craft": person.self_review.craft,
            "culture": person.self_review.culture,
            "whatsNext": person.self_review.whats_next,
        },
        "ratingChanges": [
            {
                "axis": change.axis.value,
                "previous": change.previous.value,
                "new": change.new.value,
                "reason": change.reason,
                "session": change.session,
            }
            for change in person.rating_changes
        ],
    }
