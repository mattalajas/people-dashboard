export const bands = [
  "Below",
  "Developing",
  "Strong",
  "Exceeding",
  "Exceptional",
] as const;

export type Band = (typeof bands)[number];

export type Axis = "Craft" | "Culture";

export type SessionState = "open" | "closed";

export type RatingChange = {
  axis: Axis;
  previous: Band;
  new: Band;
  reason: string;
  session: string;
};

export type PersonLine = {
  id: string;
  craftRating: Band;
  cultureRating: Band;
  craftJustification: string;
  cultureJustification: string;
  selfReview: {
    craft: string;
    culture: string;
    whatsNext: string;
  };
  ratingChanges: RatingChange[];
};

export type SpreadBand = {
  band: Band;
  count: number;
};

export type GroupCard = {
  name: string;
  session: SessionState;
  spread: SpreadBand[] | null;
  flagged: boolean;
  aiSummary: string | null;
  personLines: PersonLine[];
};

export type DepartmentView = {
  department: GroupCard;
  groups: GroupCard[];
};
