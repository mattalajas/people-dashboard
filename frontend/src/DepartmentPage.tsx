import { useState } from "react";
import { bands, type Band, type DepartmentView, type GroupCard, type PersonLine, type RatingChange, type SpreadBand } from "./types";

type AppliedHistory = {
  personId: string;
  changedAt: string;
  reason: string;
  previousCraft: Band;
  previousCulture: Band;
};

type DepartmentPageProps = {
  view: DepartmentView;
};

export function DepartmentPage({ view }: DepartmentPageProps) {
  const [openHistories, setOpenHistories] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState(view.groups[0]?.name ?? null);
  const [applied, setApplied] = useState<AppliedHistory[]>([]);
  const team = view.groups.find((group) => group.name === selectedTeam) ?? null;

  function toggleHistory(id: string) {
    setOpenHistories((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function toggleApplied(next: AppliedHistory) {
    setApplied((current) =>
      current.some((item) => sameHistory(item, next))
        ? current.filter((item) => !sameHistory(item, next))
        : [...current.filter((item) => item.personId !== next.personId), next],
    );
  }

  return (
    <main className="page">
      <p className="eyebrow">Calibration</p>
      <div className="board">
        <GroupSection
          group={view.department}
          title="h1"
          variant="department"
          childGroups={view.groups}
          openHistories={openHistories}
          onToggleHistory={toggleHistory}
          onClearHistories={() => setOpenHistories([])}
          applied={applied}
          onToggleApplied={toggleApplied}
        />
        <div className="teams">
          <div className="team-switcher" role="group" aria-label={`${view.department.name} teams`}>
            {view.groups.map((group) => (
              <button
                key={group.name}
                type="button"
                className="team-button"
                aria-pressed={group.name === selectedTeam}
                onClick={() => {
                  setSelectedTeam(group.name);
                  setOpenHistories([]);
                  setApplied([]);
                }}
              >
                {group.name}
              </button>
            ))}
          </div>
          {team ? (
            <GroupSection
              key={team.name}
              group={team}
              title="h2"
              variant="team"
              openHistories={openHistories}
              onToggleHistory={toggleHistory}
              onClearHistories={() => setOpenHistories([])}
              applied={applied}
              onToggleApplied={toggleApplied}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}

type GroupSectionProps = {
  group: GroupCard;
  title: "h1" | "h2";
  variant: "department" | "team";
  childGroups?: GroupCard[];
  openHistories: string[];
  onToggleHistory: (id: string) => void;
  onClearHistories: () => void;
  applied: AppliedHistory[];
  onToggleApplied: (history: AppliedHistory) => void;
};

function GroupSection({
  group,
  title: Title,
  variant,
  childGroups = [],
  openHistories,
  onToggleHistory,
  onClearHistories,
  applied,
  onToggleApplied,
}: GroupSectionProps) {
  const [reviewsOpen, setReviewsOpen] = useState(true);
  const people = group.personLines.length;
  const sessionLabel = group.session === "open" ? "Open" : "Closed";
  const note = variant === "team" ? historyNote(group, applied) : null;

  return (
    <section className="group" aria-label={group.name}>
      <div className="group-heading">
        <div>
          <div className="title-row">
            <Title>{group.name}</Title>
            {variant === "team" && group.managerName ? (
              <p className="manager-name">{group.managerName}</p>
            ) : null}
          </div>
          <p className="group-meta">
            <span>
              {variant === "department"
                ? "Calibration"
                : `${people} ${people === 1 ? "person" : "people"}`}
            </span>
            {note ? <span className="results-note">{note}</span> : null}
          </p>
        </div>
        <div className="group-status">
          <p className={group.session === "open" ? "session open" : "session closed"}>{sessionLabel}</p>
          {variant === "team" && group.flagged ? <p className="flag-pill">Flagged</p> : null}
        </div>
      </div>
      <div className="group-body">
          {variant === "department" ? (
            <DepartmentSummary name={group.name} groups={childGroups} applied={applied} />
          ) : (
            <>
              {group.spread ? (
                <Spread
                  name={group.name}
                  bands={displayedSpread(group, applied)}
                  exceedingShare={displayedExceeding(group, applied)}
                />
              ) : null}
              {group.aiSummary ? (
                <section className="ai-summary" aria-label={`${group.name} AI summary`}>
                  <h3>AI summary</h3>
                  <p>{group.aiSummary}</p>
                </section>
              ) : null}
              {group.personLines.length > 0 ? (
                <section className="reviews" aria-label={`${group.name} reviews`}>
                  <button
                    type="button"
                    className="reviews-toggle"
                    aria-expanded={reviewsOpen}
                    onClick={() => {
                      if (reviewsOpen) {
                        onClearHistories();
                      }
                      setReviewsOpen((value) => !value);
                    }}
                  >
                    <span>Reviews</span>
                    <span aria-hidden="true">{reviewsOpen ? "▾" : "▸"}</span>
                  </button>
                  {reviewsOpen ? (
                    <ul className="person-lines" aria-label={`${group.name} person lines`}>
                      {group.personLines.map((line, index) => (
                        <li key={line.id}>
                          <PersonLineCard
                            line={line}
                            employeeLabel={employeeName(index)}
                            historyOpen={openHistories.includes(line.id)}
                            onToggleHistory={onToggleHistory}
                            applied={applied}
                            onToggleApplied={onToggleApplied}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ) : null}
            </>
          )}
      </div>
    </section>
  );
}

function DepartmentSummary({
  name,
  groups,
  applied,
}: {
  name: string;
  groups: GroupCard[];
  applied: AppliedHistory[];
}) {
  const flagged = groups.filter((group) => group.flagged && group.exceedingShare !== null);
  return (
    <div className="department-summary">
      <ul className="summary" aria-label={`${name} groups`}>
        {groups.map((group) => (
          <li key={group.name}>
            <span className="band">{group.name}</span>
            <ThresholdTrack
              percent={displayedExceeding(group, applied) ?? 0}
              flagged={group.flagged}
            />
            <span className="count">{displayedExceeding(group, applied) ?? 0}%</span>
          </li>
        ))}
      </ul>
      <div className="discussion-pills">
        {flagged.map((group) => (
          <p key={group.name} className="discussion-pill">
            {group.name} flagged for discussion
          </p>
        ))}
      </div>
      <p className="chart-note">Share rated Exceeding or above. The line marks 40%.</p>
    </div>
  );
}

function Spread({
  name,
  bands,
  exceedingShare,
}: {
  name: string;
  bands: SpreadBand[];
  exceedingShare: number | null;
}) {
  const total = bands.reduce((sum, band) => sum + band.count, 0);
  const ordered = [...bands].reverse();
  return (
    <div className="chart">
      <ul className="spread" aria-label={`${name} spread`}>
        {ordered.map((band) => {
          const share = sharePercent(band.count, total);
          return (
            <li key={band.band}>
              <span className="band">{band.band}</span>
              <span className="bar-track" aria-hidden="true">
                <span className="bar" style={{ width: `${share}%` }} />
              </span>
              <span className="count">
                {band.count} · {share}%
              </span>
            </li>
          );
        })}
      </ul>
      <div className="exceeding-row">
        <span className="band exceeding-label">Exceeding+</span>
        <ThresholdTrack percent={exceedingShare ?? 0} flagged />
        <span className="count">{exceedingShare ?? 0}%</span>
      </div>
      <p className="chart-note">The line marks the 40% flag threshold.</p>
    </div>
  );
}

function ThresholdTrack({ percent, flagged }: { percent: number; flagged: boolean }) {
  return (
    <span className="bar-track threshold-track" aria-hidden="true">
      <span className={flagged ? "bar exceeding" : "bar"} style={{ width: `${percent}%` }} />
      <span className="threshold-mark" />
    </span>
  );
}

function sharePercent(count: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return Math.floor((count * 100 + Math.floor(total / 2)) / total);
}

function PersonLineCard({
  line,
  employeeLabel,
  historyOpen,
  onToggleHistory,
  applied,
  onToggleApplied,
}: {
  line: PersonLine;
  employeeLabel: string;
  historyOpen: boolean;
  onToggleHistory: (id: string) => void;
  applied: AppliedHistory[];
  onToggleApplied: (history: AppliedHistory) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <article className="person-line" aria-label="Person line">
      <div className="review-header">
        <div className="review-identity">
          <p className="employee-label">{employeeLabel}</p>
          <p className="review-ratings">
            <span>
              Craft: <span className={bandClass(line.craftRating)}>{line.craftRating}</span>
            </span>
            <span>
              Culture: <span className={bandClass(line.cultureRating)}>{line.cultureRating}</span>
            </span>
          </p>
        </div>
        <div className="review-actions">
          {line.ratingChanges.length > 0 ? (
            <p className="history-note">This history has been changed</p>
          ) : null}
          <button
            type="button"
            className="review-toggle"
            aria-expanded={open}
            onClick={() => {
              if (open && historyOpen) {
                onToggleHistory(line.id);
              }
              setOpen((value) => !value);
            }}
          >
            {open ? "Hide review" : "Show review"}
          </button>
        </div>
      </div>
      {open ? (
        <div className="review-body">
          <h3>Manager review</h3>
          <section className="manager-review" aria-label="Manager review">
            <div className="rated">
              <p>
                <span className="field-label">Craft rating:</span> {line.craftRating}
              </p>
              <p>
                <span className="field-label">Justification:</span> {line.craftJustification}
              </p>
            </div>
            <div className="rated">
              <p>
                <span className="field-label">Culture rating:</span> {line.cultureRating}
              </p>
              <p>
                <span className="field-label">Justification:</span> {line.cultureJustification}
              </p>
            </div>
          </section>
          <section className="self-review" aria-label="Self review">
            <h3>Self review</h3>
            <p>
              <span className="field-label">Craft:</span> {line.selfReview.craft}
            </p>
            <p>
              <span className="field-label">Culture:</span> {line.selfReview.culture}
            </p>
            <p>
              <span className="field-label">What's next:</span> {line.selfReview.whatsNext}
            </p>
          </section>
          {line.ratingChanges.length > 0 ? (
            <section className="history-block" aria-label="Rating history">
              <button
                type="button"
                className="history-toggle"
                aria-expanded={historyOpen}
                onClick={() => onToggleHistory(line.id)}
              >
                {historyOpen ? "Hide rating changes" : "Show rating changes"}
              </button>
              {historyOpen ? (
                <RatingChanges line={line} applied={applied} onToggleApplied={onToggleApplied} />
              ) : null}
            </section>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function bandClass(band: Band): string {
  return `band-value band-${band.toLowerCase()}`;
}

function formatChangedAt(value: string): string {
  const date = new Date(value);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}, ${hour}:${minute}`;
}

function RatingChanges({
  line,
  applied,
  onToggleApplied,
}: {
  line: PersonLine;
  applied: AppliedHistory[];
  onToggleApplied: (history: AppliedHistory) => void;
}) {
  return (
    <section className="rating-changes" aria-label="Rating changes">
      {line.ratingChanges.map((change) => {
        const active = isApplied(line.id, change, applied);
        return (
          <article key={`${change.session}-${change.changedAt}-${change.reason}`}>
            <div className="change-header">
              <p className="change-meta">
                {change.changedBy} · {formatChangedAt(change.changedAt)}
              </p>
              <button
                type="button"
                className="apply-history"
                aria-pressed={active}
                onClick={() =>
                  onToggleApplied({
                    personId: line.id,
                    changedAt: change.changedAt,
                    reason: change.reason,
                    previousCraft: change.previousCraft,
                    previousCulture: change.previousCulture,
                  })
                }
              >
                {active ? "Show current results" : "Show previous results"}
              </button>
            </div>
            <p>
              <span className="field-label">Craft rating:</span> {change.previousCraft}
            </p>
            <p>
              <span className="field-label">Culture rating:</span> {change.previousCulture}
            </p>
            <p>
              <span className="field-label">Justification:</span> {change.reason}
            </p>
          </article>
        );
      })}
    </section>
  );
}

function sameHistory(left: AppliedHistory, right: AppliedHistory): boolean {
  return left.personId === right.personId && left.changedAt === right.changedAt && left.reason === right.reason;
}

function isApplied(personId: string, change: RatingChange, applied: AppliedHistory[]): boolean {
  return applied.some(
    (item) => item.personId === personId && item.changedAt === change.changedAt && item.reason === change.reason,
  );
}

function appliedFor(group: GroupCard, applied: AppliedHistory[]): AppliedHistory[] {
  return applied.filter((item) => group.personLines.some((line) => line.id === item.personId));
}

function employeeName(index: number): string {
  return `Employee ${String.fromCharCode(65 + index)}`;
}

function historyNote(group: GroupCard, applied: AppliedHistory[]): string | null {
  const names = group.personLines.flatMap((line, index) =>
    applied.some((item) => item.personId === line.id) ? [employeeName(index)] : [],
  );
  if (names.length === 0) {
    return null;
  }
  const listed = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return `Showing results before the ${names.length === 1 ? "change" : "changes"} for ${listed}.`;
}

function displayedSpread(group: GroupCard, applied: AppliedHistory[]): SpreadBand[] {
  if (!group.spread) {
    return [];
  }
  const relevant = appliedFor(group, applied);
  if (relevant.length === 0) {
    return group.spread;
  }
  const counts = new Map(group.spread.map((band) => [band.band, band.count]));
  for (const item of relevant) {
    const line = group.personLines.find((person) => person.id === item.personId);
    if (!line) {
      continue;
    }
    moveCount(counts, line.craftRating, -1);
    moveCount(counts, line.cultureRating, -1);
    moveCount(counts, item.previousCraft, 1);
    moveCount(counts, item.previousCulture, 1);
  }
  return bands.map((band) => ({ band, count: counts.get(band) ?? 0 }));
}

function displayedExceeding(group: GroupCard, applied: AppliedHistory[]): number | null {
  if (appliedFor(group, applied).length === 0) {
    return group.exceedingShare;
  }
  if (group.spread) {
    return shareOf(displayedSpread(group, applied));
  }
  return shareFromLines(group.personLines, applied);
}

function shareOf(spread: SpreadBand[]): number | null {
  const total = spread.reduce((sum, band) => sum + band.count, 0);
  if (total === 0) {
    return null;
  }
  const high = spread
    .filter((band) => band.band === "Exceeding" || band.band === "Exceptional")
    .reduce((sum, band) => sum + band.count, 0);
  return sharePercent(high, total);
}

function shareFromLines(lines: PersonLine[], applied: AppliedHistory[]): number | null {
  if (lines.length === 0) {
    return null;
  }
  let high = 0;
  for (const line of lines) {
    const override = applied.find((item) => item.personId === line.id);
    const craft = override ? override.previousCraft : line.craftRating;
    const culture = override ? override.previousCulture : line.cultureRating;
    if (craft === "Exceeding" || craft === "Exceptional") {
      high += 1;
    }
    if (culture === "Exceeding" || culture === "Exceptional") {
      high += 1;
    }
  }
  return sharePercent(high, lines.length * 2);
}

function moveCount(counts: Map<Band, number>, band: Band, delta: number) {
  counts.set(band, (counts.get(band) ?? 0) + delta);
}
