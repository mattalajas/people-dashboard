export const bands = [
  "Below",
  "Developing",
  "Strong",
  "Exceeding",
  "Exceptional",
] as const;

export type Band = (typeof bands)[number];

export type SessionState = "open" | "closed";

export type RatingChange = {
  previousCraft: Band;
  previousCulture: Band;
  reason: string;
  session: string;
  changedAt: string;
  changedBy: string;
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
  exceedingShare: number | null;
  flagged: boolean;
  aiSummary: string | null;
  managerName: string | null;
  personLines: PersonLine[];
};

export type DepartmentView = {
  department: GroupCard;
  groups: GroupCard[];
};
