import type { DepartmentView, PersonLine, SpreadBand } from "./types";

function line(
  id: string,
  craftRating: PersonLine["craftRating"],
  cultureRating: PersonLine["cultureRating"],
  craftJustification: string,
  cultureJustification: string,
  ratingChanges: PersonLine["ratingChanges"] = [],
): PersonLine {
  return {
    id,
    craftRating,
    cultureRating,
    craftJustification,
    cultureJustification,
    selfReview: {
      craft: `${craftJustification} in their own words`,
      culture: `${cultureJustification} in their own words`,
      whatsNext: `Next step after ${craftJustification}`,
    },
    ratingChanges,
  };
}

const platformSpread: SpreadBand[] = [
  { band: "Below", count: 2 },
  { band: "Developing", count: 3 },
  { band: "Strong", count: 6 },
  { band: "Exceeding", count: 3 },
  { band: "Exceptional", count: 2 },
];

export const departmentView: DepartmentView = {
  department: {
    name: "Engineering",
    session: "open",
    spread: null,
    personLines: [],
  },
  groups: [
    {
      name: "Platform",
      session: "closed",
      spread: platformSpread,
      personLines: [
        line(
          "person-1",
          "Strong",
          "Strong",
          "Took on the rollout",
          "Steadied the team rituals",
          [
            {
              axis: "Craft",
              previous: "Developing",
              new: "Strong",
              reason: "Scope grew",
              session: "Platform",
            },
          ],
        ),
        line(
          "person-2",
          "Exceeding",
          "Strong",
          "Set the technical direction",
          "Made reviews useful",
          [
            {
              axis: "Culture",
              previous: "Below",
              new: "Strong",
              reason: "Steadier collaboration",
              session: "Platform",
            },
          ],
        ),
        line(
          "person-3",
          "Below",
          "Developing",
          "Missed the design bar",
          "Still learning how to disagree",
        ),
        line(
          "person-4",
          "Developing",
          "Developing",
          "Delivered with guidance",
          "Warm, still inconsistent",
        ),
        line(
          "person-5",
          "Strong",
          "Exceeding",
          "Shipped the migration",
          "Raised the critique quality",
        ),
        line(
          "person-6",
          "Exceptional",
          "Strong",
          "Redefined the platform approach",
          "Reliable partner to other teams",
        ),
        line(
          "person-7",
          "Strong",
          "Below",
          "Solid feature work",
          "Avoided hard conversations",
        ),
        line(
          "person-8",
          "Exceeding",
          "Exceptional",
          "Led the incident response",
          "Reset how the team gives feedback",
        ),
      ],
    },
  ],
};
