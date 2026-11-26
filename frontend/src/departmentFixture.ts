import type { DepartmentView, PersonLine, SpreadBand } from "./types";

function line(
  id: string,
  craftRating: PersonLine["craftRating"],
  cultureRating: PersonLine["cultureRating"],
  craftJustification: string,
  cultureJustification: string,
  selfReview: PersonLine["selfReview"],
  ratingChanges: PersonLine["ratingChanges"] = [],
): PersonLine {
  return {
    id,
    craftRating,
    cultureRating,
    craftJustification,
    cultureJustification,
    selfReview,
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
  { band: "Strong", count: 3 },
  { band: "Exceeding", count: 6 },
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
    exceedingShare: 33,
    flagged: false,
    aiSummary: null,
    managerName: "Jordan Hale",
    personLines: [],
  },
  groups: [
    {
      name: "Platform",
      session: "closed",
      spread: platformSpread,
      exceedingShare: 50,
      flagged: true,
      aiSummary: platformSummary,
      managerName: "Avery Cole",
      personLines: [
        line(
          "person-1",
          "Exceeding",
          "Strong",
          "Took on the rollout after the migration date slipped. They carried the cutover through the last two weekends and kept the existing clients online.",
          "Steadied the team rituals by putting the weekly review back on the calendar and making sure a decision was written down before people left the room.",
          {
            craft: "I took the rollout when the migration date slipped, and I stayed with the cutover so the existing clients never saw a break.",
            culture: "I put the weekly review back on the calendar and started writing the decision in the channel before we wrapped.",
            whatsNext: "I want to hand the next cutover to someone else and stay on as the backup, not the only person who knows the steps.",
          },
          [
            {
              previousCraft: "Developing",
              previousCulture: "Strong",
              reason: "Scope grew once the rollout covered the legacy clients as well as the new path. The work I had at Developing is now the standard the rest of the group is following.",
              session: "Platform",
              changedAt: "2026-03-01T08:00:00Z",
              changedBy: "Avery Cole",
            },
          ],
        ),
        line(
          "person-2",
          "Exceeding",
          "Strong",
          "Set the technical direction for the platform rewrite, and the rest of the group is building against that plan instead of inventing a new one in each review.",
          "Made reviews useful by cutting the status round and asking people to bring a decision rather than a slide.",
          {
            craft: "I wrote the plan for the platform rewrite and kept us on it when each review tried to reopen the shape.",
            culture: "I cut the status round out of our reviews so we spend the time on the decision in front of us.",
            whatsNext: "I need to write the plan down well enough that the group can run it when I am in an incident.",
          },
          [
            {
              previousCraft: "Strong",
              previousCulture: "Strong",
              reason: "The technical direction holds up under the questions from Infra and Design. I am moving craft from Strong to Exceeding on that evidence.",
              session: "Platform",
              changedAt: "2026-03-01T08:00:00Z",
              changedBy: "Avery Cole",
            },
          ],
        ),
        line(
          "person-3",
          "Below",
          "Developing",
          "Missed the design bar on the settings work. The flows shipped, but reviewers had to redraw them before a customer could follow them.",
          "Still learning how to disagree in the room. They raise the concern afterwards, which means the group has already moved on.",
          {
            craft: "I shipped the settings flows, and I can see now that people could not get through them without help.",
            culture: "I still wait until after the meeting to say what I think, and by then the decision is already made.",
            whatsNext: "I will bring one sketch to critique before I build, and I will say the concern in the room.",
          },
        ),
        line(
          "person-4",
          "Developing",
          "Developing",
          "Delivered with guidance on the billing change. The work landed, and they still needed a senior engineer in the design before they could start.",
          "Warm, still inconsistent in how they show up for other people's reviews. Some weeks they unblock the room, and some weeks they stay quiet until the decision is made.",
          {
            craft: "I got the billing change out, and I needed a lot of help deciding the shape before I could write it.",
            culture: "I want to be useful in other people's reviews, and I still disappear in some of them.",
            whatsNext: "I will take the next small change from the written brief alone and bring the design back before I ask for a pairing session.",
          },
        ),
        line(
          "person-5",
          "Exceeding",
          "Exceeding",
          "Shipped the migration of the account service with a rollback the on-call team actually used. It was the cleanest cutover this group has run.",
          "Raised the critique quality in design review. People bring sharper questions because they know this person will ask the one that matters.",
          {
            craft: "I shipped the account migration with a rollback we had already rehearsed, and the on-call team used it once without paging me.",
            culture: "I try to ask the question that changes the design, not the one that only shows I read the doc.",
            whatsNext: "I want to teach the rollback rehearsal to the rest of the group so it is not only my habit.",
          },
        ),
        line(
          "person-6",
          "Exceptional",
          "Exceeding",
          "Redefined the platform approach away from a shared library and toward a small set of owned services. Other teams are already building on that shape.",
          "Reliable partner to other teams during the incident weeks. Infra and Support both named them as the person who made the handoff usable.",
          {
            craft: "I moved us off the shared library and onto a few services we actually own, and other teams have started building on that.",
            culture: "During the incident weeks I wrote the handoff so Infra and Support could continue without sitting with me.",
            whatsNext: "I will spend the next cycle making the service boundaries obvious to someone who was not in the original reviews.",
          },
        ),
        line(
          "person-7",
          "Strong",
          "Below",
          "Solid feature work on the reporting views. The code is careful, the tests are there, and the scope stayed inside what was asked.",
          "Avoided hard conversations about the slipped date. The team heard about the risk from someone else.",
          {
            craft: "I built the reporting views to the brief, with tests, and I did not widen the scope.",
            culture: "I knew the date was slipping and I did not say it in the room. Someone else had to.",
            whatsNext: "When a date is at risk I will say so in the planning meeting, with what I would cut.",
          },
        ),
        line(
          "person-8",
          "Exceeding",
          "Exceptional",
          "Led the incident response for the authentication outage and kept a single timeline the whole department could follow. The recovery steps are now the runbook.",
          "Reset how the team gives feedback. Reviews are shorter, and people leave with a decision instead of a list of opinions.",
          {
            craft: "I ran the authentication incident and kept one timeline so people were not reconstructing it from the channel.",
            culture: "I have been pushing reviews to end with a decision. They are shorter, and I think they are better.",
            whatsNext: "I will turn the incident timeline into a habit for the whole group, not only the pages I happen to be on.",
          },
        ),
      ],
    },
    {
      name: "Infra",
      session: "closed",
      spread: infraSpread,
      exceedingShare: 17,
      flagged: false,
      aiSummary: null,
      managerName: "Riley Shah",
      personLines: [
        line(
          "infra-1",
          "Strong",
          "Strong",
          "Kept the build green through the quarter by fixing the flaky integration suite instead of rerunning it. The main branch is something people trust again.",
          "Answered the on-call pages, including the weekend ones, and wrote down what they did so the next person was not starting from a blank channel.",
          {
            craft: "I fixed the flaky integration suite instead of rerunning it, and the main branch has stayed green.",
            culture: "I answered the pages, including on the weekend, and I wrote down what I did before I closed them.",
            whatsNext: "I want someone else to be able to trust the suite without asking me which tests are the noisy ones.",
          },
        ),
        line(
          "infra-2",
          "Strong",
          "Developing",
          "Documented the deploy path so a new engineer can ship without sitting beside them. The doc matches what the pipeline actually does.",
          "Shared the on-call load for two rotations and then dropped the third. The team is still uneven, and this is the part that needs to settle.",
          {
            craft: "I wrote the deploy path down so a new person can ship without sitting with me, and I checked it against the pipeline.",
            culture: "I took two on-call rotations and I missed the third. I know the load is still uneven.",
            whatsNext: "I will take the next full rotation and update the doc when the pipeline changes, not after someone gets stuck.",
          },
        ),
        line(
          "infra-3",
          "Developing",
          "Strong",
          "Mapped the service owners after the outage showed us we did not know who to call. The map is up, and a few of the names are still wrong.",
          "Brought incidents to a close instead of leaving them in a long channel. People know an incident is over because this person says so.",
          {
            craft: "I made the service-owner map after the outage, and I still have a few names I am not sure about.",
            culture: "I have started closing incidents out loud so the channel does not just fade.",
            whatsNext: "I will sit with each owner and correct the map before the next page, not after it.",
          },
        ),
        line(
          "infra-4",
          "Exceeding",
          "Strong",
          "Shortened the incident timeline from a drifting thread into a single page with owners and times. That page is the standard the rest of Infra is now copying.",
          "Stayed calm in the channel when the pages were coming in faster than we could read them. The tone of the response followed theirs.",
          {
            craft: "I turned the incident thread into one page with owners and times, and people are using that page on pages I am not even on.",
            culture: "I try to keep my messages short when the channel is already loud, because the tone spreads.",
            whatsNext: "I will teach the timeline page to the rest of the rotation so it does not depend on me being the one who is paged.",
          },
          [
            {
              previousCraft: "Strong",
              previousCulture: "Strong",
              reason: "The shorter incident timeline holds up across the last three pages, not just the one we looked at in the room. I am moving craft from Strong to Exceeding.",
              session: "Infra",
              changedAt: "2026-03-01T08:15:00Z",
              changedBy: "Riley Shah",
            },
          ],
        ),
        line(
          "infra-5",
          "Strong",
          "Exceeding",
          "Paired across the services during the authentication work so Platform was not debugging our side alone. The fixes landed in both codebases.",
          "Made the handoff clear between Infra and Support. The next team can see what was tried and what is still open.",
          {
            craft: "I paired with Platform on the authentication work so they were not guessing at our side, and the fixes landed in both codebases.",
            culture: "I write the handoff so Support can see what we already tried and what is still open.",
            whatsNext: "I want the handoff note to be the default at the end of a page, including the pages I do not run.",
          },
        ),
        line(
          "infra-6",
          "Developing",
          "Developing",
          "Clarified the ownership map for the two services nobody wanted. The map is a start, and they still need help deciding what to do with the gaps.",
          "Asked for help sooner than they did last cycle, which is the change I wanted to see. They still wait too long when the page is already noisy.",
          {
            craft: "I wrote down who owns the two services nobody wanted, and I still do not know what to do with the gaps.",
            culture: "I asked for help earlier than I used to, and I still wait too long once the channel is already loud.",
            whatsNext: "On the next page I will ask for a second person in the first ten minutes, not after I have been stuck.",
          },
        ),
      ],
    },
    {
      name: "Design",
      session: "closed",
      spread: null,
      exceedingShare: 50,
      flagged: true,
      aiSummary: designSummary,
      managerName: "Morgan Ellis",
      personLines: [
        line(
          "design-1",
          "Exceeding",
          "Exceeding",
          "Raised the visual bar on the core product screens. The critique is no longer about taste; this work is the reference the rest of Engineering is measured against.",
          "Held the critique standard when it would have been easier to let a weak flow through. People prepare differently because they know the bar will be applied.",
          {
            craft: "I pushed the core screens until they were the reference, not just a direction we liked in the room.",
            culture: "I held the critique even when it would have been easier to let a weak flow through.",
            whatsNext: "I want the bar written down so a critique can hold it when I am not the one in the room.",
          },
          [
            {
              previousCraft: "Exceeding",
              previousCulture: "Strong",
              reason: "The critique holds up across Engineering, not only inside Design. I am moving culture from Strong to Exceeding on that.",
              session: "Engineering",
              changedAt: "2026-03-01T08:30:00Z",
              changedBy: "Jordan Hale",
            },
          ],
        ),
        line(
          "design-2",
          "Exceptional",
          "Strong",
          "Redrew the core flows after the research readout, and the new paths are ones a customer can finish without a guide. This is the strongest design work in the department.",
          "Set the tone of the critique by going first and being specific. The room is kinder and sharper because of how they start.",
          {
            craft: "I redrew the core flows after the research readout so a customer can finish them without a guide.",
            culture: "I go first in critique and I try to be specific, because the rest of the room follows that tone.",
            whatsNext: "I will pair with the people who have not led a critique yet, so the tone does not depend on me starting.",
          },
        ),
        line(
          "design-3",
          "Strong",
          "Developing",
          "Shipped the component kit, and the product teams are actually using it. The documentation is good enough that people do not have to ask for a walkthrough.",
          "Still learning to invite dissent in critique. They defend the work before they have heard the concern.",
          {
            craft: "I shipped the component kit, and teams are using it without asking me for a walkthrough.",
            culture: "I still defend the work before I have really heard the concern. I know I do it.",
            whatsNext: "In the next critique I will write the concern down before I answer it.",
          },
        ),
      ],
    },
    {
      name: "Research",
      session: "closed",
      spread: null,
      exceedingShare: 17,
      flagged: false,
      aiSummary: null,
      managerName: "Quinn Adler",
      personLines: [
        line(
          "research-1",
          "Exceeding",
          "Strong",
          "Found the failed assumption behind the onboarding funnel and brought the evidence in before the build was locked. That saved a quarter of work.",
          "Wrote up the disagreement with the product plan in a way the team could act on. The note was direct, and it named what would have to change.",
          {
            craft: "I found the assumption in onboarding that was wrong and brought the evidence in before we locked the build.",
            culture: "I wrote the disagreement down so the team could act on it, and I named what would have to change.",
            whatsNext: "I will bring the next finding a week earlier, while there is still time to change the plan and not only the copy.",
          },
        ),
        line(
          "research-2",
          "Developing",
          "Developing",
          "Wrote the study notes, and they are faithful to what people said. The synthesis is still thin, which is why this stays at Developing.",
          "Kept the interviews kind. Participants were comfortable, and the harder follow-up questions were often left for later.",
          {
            craft: "I wrote the notes faithfully, and I know the synthesis is still too thin to guide a decision.",
            culture: "I kept the interviews kind, and I left some of the harder questions for later.",
            whatsNext: "I will add the follow-up question in the interview, not in the notes afterwards.",
          },
        ),
        line(
          "research-3",
          "Strong",
          "Below",
          "Repeated the measurement when the first sample was too small, and the second pass is the one the team should trust.",
          "Skipped the hard question once the participant pushed back. We still do not know why people abandon the second step.",
          {
            craft: "I reran the measurement when the first sample was too small, and the second pass is the one I trust.",
            culture: "When a participant pushed back I let the hard question go, and we still do not know why people leave at the second step.",
            whatsNext: "I will ask that question again, and I will stay with it if the participant is uncomfortable.",
          },
        ),
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
    exceedingShare: 0,
    flagged: false,
    aiSummary: null,
    managerName: "Casey Nguyen",
    personLines: [],
  },
  groups: [
    {
      name: "Product",
      session: "closed",
      spread: null,
      exceedingShare: 0,
      flagged: false,
      aiSummary: null,
      managerName: "Parker Singh",
      personLines: [],
    },
    {
      name: "Support",
      session: "closed",
      spread: null,
      exceedingShare: 0,
      flagged: false,
      aiSummary: null,
      managerName: "Alex Romero",
      personLines: [
        line(
          "support-1",
          "Developing",
          "Developing",
          "Answered the queue steadily, and the harder tickets still sit until someone else picks them up. The pace is there; the judgement is still forming.",
          "Kept the notes current on the tickets they closed. A colleague can see what was tried.",
          {
            craft: "I keep up with the queue, and I still pass the harder tickets on because I am not sure what to do with them.",
            culture: "I write down what I tried before I close a ticket, so the next person is not starting over.",
            whatsNext: "I will keep one harder ticket a week and ask for a review of how I handled it.",
          },
        ),
        line(
          "support-2",
          "Developing",
          "Developing",
          "Routed the request to the right team more often than not. A few still bounce because the first read was too fast.",
          "Followed up the next day on the tickets they had promised to check. Customers are not left wondering.",
          {
            craft: "I usually send a request to the right team, and a few bounce because I read them too quickly.",
            culture: "If I say I will check a ticket tomorrow, I do. I do not want a customer waiting on a promise.",
            whatsNext: "I will slow down on the first read so fewer tickets bounce back to the queue.",
          },
        ),
      ],
    },
  ],
};

export const productView: DepartmentView = {
  department: {
    name: "Product",
    session: "closed",
    spread: null,
    exceedingShare: 0,
    flagged: false,
    aiSummary: null,
    managerName: "Parker Singh",
    personLines: [],
  },
  groups: [
    {
      name: "North",
      session: "closed",
      spread: null,
      exceedingShare: 0,
      flagged: false,
      aiSummary: null,
      managerName: "Drew Okonkwo",
      personLines: [
        line(
          "north-1",
          "Strong",
          "Strong",
          "Shipped the shared kit on the date the two squads had planned, and the handoff notes were already in the repo.",
          "Kept the critiques kind without letting weak work pass. People leave the room knowing what to change.",
          {
            craft: "I shipped the shared kit on the date we had planned, with the handoff notes already in the repo.",
            culture: "I try to keep critique kind and still say what has to change before we leave.",
            whatsNext: "I will have the other squad lead the next critique so the kit is not only mine to defend.",
          },
        ),
        line(
          "north-2",
          "Strong",
          "Strong",
          "Closed the handoff gaps between design and engineering that had been open since last cycle. The checklist is now part of how this squad starts a build.",
          "Wrote the decision down in the channel where the work happens, not in a doc nobody opens.",
          {
            craft: "I closed the handoff gaps that had been open since last cycle, and the checklist is how we start a build now.",
            culture: "I write the decision in the channel, because that is where people will actually see it.",
            whatsNext: "I will check that the checklist is being used on work I am not on, not only on mine.",
          },
        ),
      ],
    },
    {
      name: "South",
      session: "closed",
      spread: null,
      exceedingShare: 0,
      flagged: false,
      aiSummary: null,
      managerName: "Samira Patel",
      personLines: [
        line(
          "south-1",
          "Strong",
          "Strong",
          "Held the release date by cutting scope in the open instead of quietly slipping. The team knew what was out and why.",
          "Asked before changing course on the settings redesign. That kept the rest of the squad from building against a plan that had already moved.",
          {
            craft: "I held the date by cutting scope in the open, and the team knew what was out.",
            culture: "I asked before I changed course, so people were not building against a plan I had already left.",
            whatsNext: "I will write the cut list down at the start of the cycle, not only when the date is close.",
          },
        ),
        line(
          "south-2",
          "Strong",
          "Strong",
          "Simplified the settings screens so a new customer can finish them without the help center. The reduction is the craft, and it is solid.",
          "Shared credit for the launch with the people who did the unglamorous parts. The write-up named them.",
          {
            craft: "I simplified the settings screens until a new customer could finish them without the help center.",
            culture: "I named the people who did the unglamorous parts in the launch write-up, because it was not only my work.",
            whatsNext: "I will sit with support and see which settings still generate tickets.",
          },
        ),
      ],
    },
  ],
};
