from __future__ import annotations

from calibration.model import Axis, Band, Group, Person, RatingChange, SelfReview, SessionState


def engineering_cycle() -> Group:
    return Group(
        name="Engineering",
        session=SessionState.OPEN,
        children=(
            Group(
                name="Platform",
                session=SessionState.CLOSED,
                people=_platform_people(),
            ),
        ),
    )


def _person(
    person_id: str,
    craft: Band,
    culture: Band,
    craft_justification: str,
    culture_justification: str,
    rating_changes: tuple[RatingChange, ...] = (),
) -> Person:
    return Person(
        id=person_id,
        craft_rating=craft,
        culture_rating=culture,
        craft_justification=craft_justification,
        culture_justification=culture_justification,
        self_review=SelfReview(
            craft=f"{craft_justification} in their own words",
            culture=f"{culture_justification} in their own words",
            whats_next=f"Next step after {craft_justification}",
        ),
        rating_changes=rating_changes,
    )


def _platform_people() -> tuple[Person, ...]:
    return (
        _person(
            "person-1",
            Band.STRONG,
            Band.STRONG,
            "Took on the rollout",
            "Steadied the team rituals",
            (
                RatingChange(
                    axis=Axis.CRAFT,
                    previous=Band.DEVELOPING,
                    new=Band.STRONG,
                    reason="Scope grew",
                    session="Platform",
                ),
            ),
        ),
        _person(
            "person-2",
            Band.EXCEEDING,
            Band.STRONG,
            "Set the technical direction",
            "Made reviews useful",
            (
                RatingChange(
                    axis=Axis.CULTURE,
                    previous=Band.BELOW,
                    new=Band.STRONG,
                    reason="Steadier collaboration",
                    session="Platform",
                ),
            ),
        ),
        _person(
            "person-3",
            Band.BELOW,
            Band.DEVELOPING,
            "Missed the design bar",
            "Still learning how to disagree",
        ),
        _person(
            "person-4",
            Band.DEVELOPING,
            Band.DEVELOPING,
            "Delivered with guidance",
            "Warm, still inconsistent",
        ),
        _person(
            "person-5",
            Band.STRONG,
            Band.EXCEEDING,
            "Shipped the migration",
            "Raised the critique quality",
        ),
        _person(
            "person-6",
            Band.EXCEPTIONAL,
            Band.STRONG,
            "Redefined the platform approach",
            "Reliable partner to other teams",
        ),
        _person(
            "person-7",
            Band.STRONG,
            Band.BELOW,
            "Solid feature work",
            "Avoided hard conversations",
        ),
        _person(
            "person-8",
            Band.EXCEEDING,
            Band.EXCEPTIONAL,
            "Led the incident response",
            "Reset how the team gives feedback",
        ),
    )
