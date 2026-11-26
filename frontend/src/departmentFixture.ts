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

const platformSummary =
  "More than 40% of the ratings are Exceeding or Exceptional. The written evidence cites setting the technical direction, redefining the platform approach, and leading the incident response.";

const designSummary =
  "More than 40% of the ratings are Exceeding or Exceptional. The written evidence cites raising the visual bar and holding the critique standard.";

const platformSpread: SpreadBand[] = [
  { band: "Below", count: 2 },
  { band: "Developing", count: 3 },
  { band: "Strong", count: 4 },
  { band: "Exceeding", count: 5 },
  { band: "Exceptional", count: 2 },
];

const infraSpread: SpreadBand[] = [
  { band: "Below", count: 0 },
  { band: "Developing", count: 4 },
  { band: "Strong", count: 6 },
  { band: "Exceeding", count: 2 },
  { band: "Exceptional", count: 0 },
];

const engineeringSpread: SpreadBand[] = [
  { band: "Below", count: 1 },
  { band: "Developing", count: 3 },
  { band: "Strong", count: 4 },
  { band: "Exceeding", count: 3 },
  { band: "Exceptional", count: 1 },
];

export const departmentView: DepartmentView = {
  department: {
    name: "Engineering",
    session: "open",
    spread: engineeringSpread,
    flagged: false,
    aiSummary: null,
    personLines: [],
  },
  groups: [
    {
      name: "Platform",
      session: "closed",
      spread: platformSpread,
      flagged: true,
      aiSummary: platformSummary,
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
          "Exceeding",
          "Exceeding",
          "Shipped the migration",
          "Raised the critique quality",
        ),
        line(
          "person-6",
          "Exceptional",
          "Exceeding",
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
    {
      name: "Infra",
      session: "closed",
      spread: infraSpread,
      flagged: false,
      aiSummary: null,
      personLines: [
        line("infra-1", "Strong", "Strong", "Kept the build green", "Answered the on-call pages"),
        line("infra-2", "Strong", "Developing", "Documented the deploy path", "Shared the on-call load"),
        line("infra-3", "Developing", "Strong", "Mapped the service owners", "Brought incidents to a close"),
        line("infra-4", "Exceeding", "Strong", "Shortened the incident timeline", "Stayed calm in the channel"),
        line("infra-5", "Strong", "Exceeding", "Paired across the services", "Made the handoff clear"),
        line("infra-6", "Developing", "Developing", "Clarified the ownership map", "Asked for help sooner"),
      ],
    },
    {
      name: "Design",
      session: "closed",
      spread: null,
      flagged: true,
      aiSummary: designSummary,
      personLines: [
        line("design-1", "Exceeding", "Exceeding", "Raised the visual bar", "Held the critique standard", [
          {
            axis: "Culture",
            previous: "Strong",
            new: "Exceeding",
            reason: "The critique holds up across Engineering",
            session: "Engineering",
          },
        ]),
        line("design-2", "Exceptional", "Strong", "Redrew the core flows", "Set the tone of the critique"),
        line("design-3", "Strong", "Developing", "Shipped the component kit", "Still learning to invite dissent"),
      ],
    },
    {
      name: "Research",
      session: "closed",
      spread: null,
      flagged: false,
      aiSummary: null,
      personLines: [
        line("research-1", "Exceeding", "Strong", "Found the failed assumption", "Wrote up the disagreement"),
        line("research-2", "Developing", "Developing", "Wrote the study notes", "Kept the interviews kind"),
        line("research-3", "Strong", "Below", "Repeated the measurement", "Skipped the hard question"),
      ],
    },
  ],
};

const divisionSpread: SpreadBand[] = [
  { band: "Below", count: 0 },
  { band: "Developing", count: 4 },
  { band: "Strong", count: 8 },
  { band: "Exceeding", count: 0 },
  { band: "Exceptional", count: 0 },
];

export const divisionView: DepartmentView = {
  department: {
    name: "Division",
    session: "open",
    spread: divisionSpread,
    flagged: false,
    aiSummary: null,
    personLines: [],
  },
  groups: [
    {
      name: "Product",
      session: "closed",
      spread: null,
      flagged: false,
      aiSummary: null,
      personLines: [],
    },
    {
      name: "Support",
      session: "closed",
      spread: null,
      flagged: false,
      aiSummary: null,
      personLines: [
        line("support-1", "Developing", "Developing", "Answered the queue", "Kept the notes current"),
        line("support-2", "Developing", "Developing", "Routed the request", "Followed up the next day"),
      ],
    },
  ],
};

export const productView: DepartmentView = {
  department: {
    name: "Product",
    session: "closed",
    spread: null,
    flagged: false,
    aiSummary: null,
    personLines: [],
  },
  groups: [
    {
      name: "North",
      session: "closed",
      spread: null,
      flagged: false,
      aiSummary: null,
      personLines: [
        line("north-1", "Strong", "Strong", "Shipped the shared kit", "Kept the critiques kind"),
        line("north-2", "Strong", "Strong", "Closed the handoff gaps", "Wrote the decision down"),
      ],
    },
    {
      name: "South",
      session: "closed",
      spread: null,
      flagged: false,
      aiSummary: null,
      personLines: [
        line("south-1", "Strong", "Strong", "Held the release date", "Asked before changing course"),
        line("south-2", "Strong", "Strong", "Simplified the settings", "Shared credit for the launch"),
      ],
    },
  ],
};
