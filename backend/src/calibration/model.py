from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class Band(Enum):
    BELOW = "Below"
    DEVELOPING = "Developing"
    STRONG = "Strong"
    EXCEEDING = "Exceeding"
    EXCEPTIONAL = "Exceptional"


class Axis(Enum):
    CRAFT = "Craft"
    CULTURE = "Culture"


class SessionState(Enum):
    OPEN = "open"
    CLOSED = "closed"


@dataclass(frozen=True)
class RatingChange:
    axis: Axis
    previous: Band
    new: Band
    reason: str
    session: str


@dataclass(frozen=True)
class SelfReview:
    craft: str
    culture: str
    whats_next: str


@dataclass(frozen=True)
class Person:
    id: str
    craft_rating: Band
    culture_rating: Band
    craft_justification: str
    culture_justification: str
    self_review: SelfReview
    rating_changes: tuple[RatingChange, ...] = ()


@dataclass(frozen=True)
class Group:
    name: str
    session: SessionState
    people: tuple[Person, ...] = ()
    children: tuple[Group, ...] = ()
