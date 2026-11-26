import { useState } from "react";
import type { DepartmentView, GroupCard, PersonLine, SpreadBand } from "./types";

type DepartmentPageProps = {
  view: DepartmentView;
};

export function DepartmentPage({ view }: DepartmentPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <main className="page">
      <p className="eyebrow">Calibration</p>
      <div className="groups">
        <GroupSection
          group={view.department}
          title="h1"
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        {view.groups.map((group) => (
          <GroupSection
            key={group.name}
            group={group}
            title="h2"
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        ))}
      </div>
    </main>
  );
}

type GroupSectionProps = {
  group: GroupCard;
  title: "h1" | "h2";
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

function GroupSection({ group, title: Title, selectedId, onSelect }: GroupSectionProps) {
  return (
    <section className="group" aria-label={group.name}>
      <div className="group-heading">
        <Title>{group.name}</Title>
        <p className={group.session === "open" ? "session open" : "session closed"}>
          {group.session === "open" ? "Open" : "Closed"}
        </p>
      </div>
      {group.flagged ? <p className="flag">Flagged</p> : null}
      {group.aiSummary ? (
        <section className="ai-summary" aria-label={`${group.name} AI summary`}>
          <h3>AI summary</h3>
          <p>{group.aiSummary}</p>
        </section>
      ) : null}
      {group.spread ? <Spread name={group.name} bands={group.spread} /> : null}
      {group.personLines.length > 0 ? (
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
  );
}

function Spread({ name, bands }: { name: string; bands: SpreadBand[] }) {
  const peak = Math.max(...bands.map((band) => band.count), 1);
  return (
    <ul className="spread" aria-label={`${name} spread`}>
      {bands.map((band) => (
        <li key={band.band}>
          <span className="band">{band.band}</span>
          <span className="bar-track" aria-hidden="true">
            <span className="bar" style={{ width: `${(band.count / peak) * 100}%` }} />
          </span>
          <span className="count">{band.count}</span>
        </li>
      ))}
    </ul>
  );
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
  return (
    <article className="person-line" aria-label="Person line">
      <dl>
        <div>
          <dt>Craft rating</dt>
          <dd>{line.craftRating}</dd>
        </div>
        <div>
          <dt>Culture rating</dt>
          <dd>{line.cultureRating}</dd>
        </div>
        <div>
          <dt>Craft justification</dt>
          <dd>{line.craftJustification}</dd>
        </div>
        <div>
          <dt>Culture justification</dt>
          <dd>{line.cultureJustification}</dd>
        </div>
      </dl>
      <section className="self-review" aria-label="Self review">
        <h3>Self review</h3>
        <dl>
          <div>
            <dt>Craft</dt>
            <dd>{line.selfReview.craft}</dd>
          </div>
          <div>
            <dt>Culture</dt>
            <dd>{line.selfReview.culture}</dd>
          </div>
          <div>
            <dt>What's next</dt>
            <dd>{line.selfReview.whatsNext}</dd>
          </div>
        </dl>
      </section>
      <button
        type="button"
        aria-expanded={selected}
        onClick={() => onSelect(selected ? null : line.id)}
      >
        {selected ? "Hide rating changes" : "Show rating changes"}
      </button>
      {selected ? <RatingChanges line={line} /> : null}
    </article>
  );
}

function RatingChanges({ line }: { line: PersonLine }) {
  return (
    <section className="rating-changes" aria-label="Rating changes">
      {line.ratingChanges.map((change) => (
        <article key={`${change.axis}-${change.previous}-${change.new}-${change.reason}`}>
          <dl>
            <div>
              <dt>Axis</dt>
              <dd>{change.axis}</dd>
            </div>
            <div>
              <dt>Previous</dt>
              <dd>{change.previous}</dd>
            </div>
            <div>
              <dt>New</dt>
              <dd>{change.new}</dd>
            </div>
            <div>
              <dt>Reason</dt>
              <dd>{change.reason}</dd>
            </div>
            <div>
              <dt>Session</dt>
              <dd>{change.session}</dd>
            </div>
          </dl>
        </article>
      ))}
    </section>
  );
}
