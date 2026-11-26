import { useState } from "react";
import type { Band, DepartmentView, GroupCard, PersonLine, SpreadBand } from "./types";

type DepartmentPageProps = {
  view: DepartmentView;
};

export function DepartmentPage({ view }: DepartmentPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState(view.groups[0]?.name ?? null);
  const team = view.groups.find((group) => group.name === selectedTeam) ?? null;

  return (
    <main className="page">
      <p className="eyebrow">Calibration</p>
      <div className="board">
        <GroupSection
          group={view.department}
          title="h1"
          variant="department"
          childGroups={view.groups}
          selectedId={selectedId}
          onSelect={setSelectedId}
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
                  setSelectedId(null);
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
              selectedId={selectedId}
              onSelect={setSelectedId}
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
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

function GroupSection({
  group,
  title: Title,
  variant,
  childGroups = [],
  selectedId,
  onSelect,
}: GroupSectionProps) {
  const [reviewsOpen, setReviewsOpen] = useState(true);
  const people = group.personLines.length;
  const sessionLabel = group.session === "open" ? "Open" : "Closed";

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
            {variant === "department"
              ? "Calibration"
              : `${people} ${people === 1 ? "person" : "people"}`}
          </p>
        </div>
        <div className="group-status">
          <p className={group.session === "open" ? "session open" : "session closed"}>{sessionLabel}</p>
          {variant === "team" && group.flagged ? <p className="flag-pill">Flagged</p> : null}
        </div>
      </div>
      <div className="group-body">
          {variant === "department" ? (
            <DepartmentSummary name={group.name} groups={childGroups} />
          ) : (
            <>
              {group.spread ? (
                <Spread name={group.name} bands={group.spread} exceedingShare={group.exceedingShare} />
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
                        onSelect(null);
                      }
                      setReviewsOpen((value) => !value);
                    }}
                  >
                    <span>Reviews</span>
                    <span aria-hidden="true">{reviewsOpen ? "▾" : "▸"}</span>
                  </button>
                  {reviewsOpen ? (
                    <ul className="person-lines" aria-label={`${group.name} person lines`}>
                      {group.personLines.map((line) => (
                        <li key={line.id}>
                          <PersonLineCard
                            line={line}
                            selected={selectedId === line.id}
                            onSelect={onSelect}
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

function DepartmentSummary({ name, groups }: { name: string; groups: GroupCard[] }) {
  const flagged = groups.filter((group) => group.flagged && group.exceedingShare !== null);
  return (
    <div className="department-summary">
      <ul className="summary" aria-label={`${name} groups`}>
        {groups.map((group) => (
          <li key={group.name}>
            <span className="band">{group.name}</span>
            <ThresholdTrack
              percent={group.exceedingShare ?? 0}
              flagged={group.flagged}
            />
            <span className="count">{group.exceedingShare ?? 0}%</span>
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
  selected,
  onSelect,
}: {
  line: PersonLine;
  selected: boolean;
  onSelect: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <article className="person-line" aria-label="Person line">
      <div className="review-header">
        {open ? (
          <h3>Manager review</h3>
        ) : (
          <p className="review-ratings">
            <span>
              Craft: <span className={bandClass(line.craftRating)}>{line.craftRating}</span>
            </span>
            <span>
              Culture: <span className={bandClass(line.cultureRating)}>{line.cultureRating}</span>
            </span>
          </p>
        )}
        <button
          type="button"
          className="review-toggle"
          aria-expanded={open}
          onClick={() => {
            if (open && selected) {
              onSelect(null);
            }
            setOpen((value) => !value);
          }}
        >
          {open ? "Hide review" : "Show review"}
        </button>
      </div>
      {open ? (
        <div className="review-body">
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
            <button
              type="button"
              className="history-toggle"
              aria-expanded={selected}
              onClick={() => onSelect(selected ? null : line.id)}
            >
              {selected ? "Hide rating changes" : "Show rating changes"}
            </button>
          ) : null}
          {selected && line.ratingChanges.length > 0 ? <RatingChanges line={line} /> : null}
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

function RatingChanges({ line }: { line: PersonLine }) {
  return (
    <section className="rating-changes" aria-label="Rating changes">
      {line.ratingChanges.map((change) => (
        <article key={`${change.session}-${change.changedAt}-${change.reason}`}>
          <p className="change-meta">
            {change.changedBy} · {formatChangedAt(change.changedAt)}
          </p>
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
      ))}
    </section>
  );
}
