import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { DepartmentPage } from "./DepartmentPage";
import { departmentView, divisionView, productView } from "./departmentFixture";

function renderPage() {
  return render(<DepartmentPage view={departmentView} />);
}

function personLine(justification: string) {
  const match = screen.getAllByText(justification, { exact: false })[0]?.closest("article");
  if (!match) {
    throw new Error(`No person line contains ${justification}`);
  }
  return match;
}

describe("department page", () => {
  it("shows Engineering open, Platform closed, and no way to change a rating", () => {
    renderPage();

    const engineering = screen.getByRole("region", { name: "Engineering" });
    expect(within(engineering).getByRole("heading", { name: "Engineering" })).toBeInTheDocument();
    expect(within(engineering).getByText("Open")).toBeInTheDocument();
    expect(within(engineering).queryByText("Flagged")).not.toBeInTheDocument();
    expect(within(engineering).queryByRole("region", { name: "Engineering AI summary" })).not.toBeInTheDocument();
    expect(within(engineering).queryByRole("list", { name: "Engineering person lines" })).not.toBeInTheDocument();
    expect(within(engineering).queryByRole("list", { name: "Engineering spread" })).not.toBeInTheDocument();
    const summary = within(engineering).getByRole("list", { name: "Engineering groups" });
    expect(within(summary).getByText("Platform").parentElement).toHaveTextContent("50%");
    expect(within(summary).getByText("Design").parentElement).toHaveTextContent("50%");
    expect(within(engineering).getByText("Platform flagged for discussion")).toBeInTheDocument();
    expect(within(engineering).getByText("Design flagged for discussion")).toBeInTheDocument();
    expect(within(engineering).queryByRole("region", { name: /Assistant/ })).not.toBeInTheDocument();

    const platform = screen.getByRole("region", { name: "Platform" });
    expect(within(platform).getByRole("heading", { name: "Platform" })).toBeInTheDocument();
    expect(within(platform).getByText("Avery Cole")).toBeInTheDocument();
    expect(within(platform).getByText("Closed")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Infra" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Infra" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Platform" })).toHaveAttribute("aria-pressed", "true");

    expect(document.querySelector("input, textarea, select, [contenteditable='true']")).toBeNull();
    expect(screen.queryByText("person-1")).not.toBeInTheDocument();
  });

  it("shows Platform's five-band histogram from both ratings", () => {
    renderPage();

    const platform = screen.getByRole("region", { name: "Platform" });
    expect(within(platform).queryByText("Spread not shown because this team has fewer than 5 people.")).not.toBeInTheDocument();
    const spread = within(platform).getByRole("list", { name: "Platform spread" });
    const bands = within(spread).getAllByRole("listitem");
    expect(bands.map((band) => band.textContent?.replace(/\s+/g, ""))).toEqual([
      "Exceptional2·13%",
      "Exceeding6·38%",
      "Strong3·19%",
      "Developing3·19%",
      "Below2·13%",
    ]);
    expect(within(platform).getByText("Exceeding+")).toBeInTheDocument();
    expect(within(platform).getByText("50%")).toBeInTheDocument();
    expect(within(platform).getByText("The line marks the 40% flag threshold.")).toBeInTheDocument();
  });

  it("labels each person line Employee A onward and keeps the ratings visible", async () => {
    const user = userEvent.setup();
    renderPage();

    const platform = screen.getByRole("region", { name: "Platform" });
    const lines = within(platform).getAllByRole("article", { name: "Person line" });
    expect(lines).toHaveLength(8);
    expect(within(lines[0]).getByText("Employee A")).toBeInTheDocument();
    expect(within(lines[1]).getByText("Employee B")).toBeInTheDocument();
    expect(within(lines[7]).getByText("Employee H")).toBeInTheDocument();
    expect(within(lines[0]).getByText("This history has been changed")).toBeInTheDocument();
    expect(within(lines[2]).queryByText("This history has been changed")).not.toBeInTheDocument();
    expect(within(platform).queryByText("Took on the rollout")).not.toBeInTheDocument();

    await user.click(within(platform).getAllByRole("button", { name: "Show review" })[0]);
    const line = personLine("Took on the rollout");
    const manager = within(line).getByRole("region", { name: "Manager review" });
    expect(within(line).getByRole("heading", { name: "Manager review" })).toBeInTheDocument();
    expect(line.querySelector(".review-ratings")).toHaveTextContent("Craft:");
    expect(line.querySelector(".review-ratings")).toHaveTextContent("Culture:");
    expect(manager).toHaveTextContent("Craft rating: Exceeding");
    expect(manager).toHaveTextContent("Justification: Took on the rollout");
    expect(manager).toHaveTextContent("Culture rating: Strong");
    expect(manager).toHaveTextContent("Justification: Steadied the team rituals");

    const selfReview = within(line).getByRole("region", { name: "Self review" });
    expect(within(selfReview).getByText(/I took the rollout when the migration date slipped/)).toBeInTheDocument();
    expect(within(selfReview).getByText(/I put the weekly review back on the calendar/)).toBeInTheDocument();
    expect(within(selfReview).getByText(/hand the next cutover to someone else/)).toBeInTheDocument();
    expect(within(line).queryByText("Scope grew")).not.toBeInTheDocument();
  });

  it("keeps every opened rating history visible, and keeps the current ratings", async () => {
    const user = userEvent.setup();
    renderPage();

    const platform = screen.getByRole("region", { name: "Platform" });
    await user.click(within(platform).getAllByRole("button", { name: "Show review" })[0]);
    const first = personLine("Took on the rollout");
    expect(
      within(first).getByRole("region", { name: "Self review" }).querySelector("button"),
    ).toBeNull();
    await user.click(within(first).getByRole("button", { name: "Show rating changes" }));

    const firstHistory = within(first).getByRole("region", { name: "Rating changes" });
    await user.click(within(firstHistory).getByRole("button", { name: "Show previous results" }));
    const spread = within(platform).getByRole("list", { name: "Platform spread" });
    expect(within(spread).getByText("Developing").parentElement).toHaveTextContent("4 · 25%");
    expect(within(spread).getByText("Strong").parentElement).toHaveTextContent("3 · 19%");
    const people = within(platform).getByText("8 people").closest("p");
    expect(people).toHaveTextContent("Showing results before the change for Employee A.");
    expect(within(platform).getByText("44%")).toBeInTheDocument();
    await user.click(within(firstHistory).getByRole("button", { name: "Show current results" }));
    expect(within(spread).getByText("Developing").parentElement).toHaveTextContent("3 · 19%");
    expect(within(spread).getByText("Strong").parentElement).toHaveTextContent("3 · 19%");
    expect(people).not.toHaveTextContent("Showing results before the change for Employee A.");
    expect(within(firstHistory).getByText("Avery Cole · 1 Mar 2026, 08:00")).toBeInTheDocument();
    expect(firstHistory).toHaveTextContent("Craft rating: Developing");
    expect(firstHistory).toHaveTextContent("Culture rating: Strong");
    expect(firstHistory).toHaveTextContent("Justification: Scope grew");
    expect(within(firstHistory).queryByText("Platform")).not.toBeInTheDocument();
    expect(within(firstHistory).queryByText("New")).not.toBeInTheDocument();
    expect(within(firstHistory).queryByText("Steadier collaboration")).not.toBeInTheDocument();

    const craftRating = within(first).getByRole("region", { name: "Manager review" });
    expect(craftRating).toHaveTextContent("Craft rating: Exceeding");
    expect(craftRating).not.toHaveTextContent("Developing");

    await user.click(within(platform).getAllByRole("button", { name: "Show review" })[0]);
    const second = personLine("Set the technical direction");
    await user.click(within(second).getByRole("button", { name: "Show rating changes" }));

    expect(screen.getByText(/Scope grew/)).toBeInTheDocument();
    const secondHistory = within(second).getByRole("region", { name: "Rating changes" });
    expect(secondHistory).toHaveTextContent("Craft rating: Strong");
    expect(secondHistory).toHaveTextContent("Culture rating: Strong");
    expect(secondHistory).toHaveTextContent("Justification: The technical direction holds up");
    expect(within(secondHistory).queryByText("Platform")).not.toBeInTheDocument();
    expect(within(secondHistory).getByText("Avery Cole · 1 Mar 2026, 08:00")).toBeInTheDocument();

    const cultureRating = within(second).getByRole("region", { name: "Manager review" });
    expect(cultureRating).toHaveTextContent("Culture rating: Strong");
    expect(cultureRating).not.toHaveTextContent("Below");

    await user.click(within(first).getByRole("button", { name: "Hide rating changes" }));
    await user.click(within(second).getByRole("button", { name: "Hide rating changes" }));
    await user.click(within(platform).getAllByRole("button", { name: "Show review" })[0]);
    const untouched = personLine("Missed the design bar");
    expect(within(untouched).queryByRole("button", { name: "Show rating changes" })).not.toBeInTheDocument();
    expect(within(untouched).queryByRole("region", { name: "Rating changes" })).not.toBeInTheDocument();
    expect(screen.queryByText("Scope grew")).not.toBeInTheDocument();
    expect(screen.queryByText("The technical direction holds up")).not.toBeInTheDocument();
  });

  it("compounds previous results from every open history onto the spread", async () => {
    const user = userEvent.setup();
    renderPage();

    const platform = screen.getByRole("region", { name: "Platform" });
    const lines = within(platform).getAllByRole("article", { name: "Person line" });
    await user.click(within(lines[0]).getByRole("button", { name: "Show review" }));
    await user.click(within(lines[1]).getByRole("button", { name: "Show review" }));
    await user.click(within(lines[0]).getByRole("button", { name: "Show rating changes" }));
    await user.click(within(lines[1]).getByRole("button", { name: "Show rating changes" }));
    expect(within(lines[0]).getByText(/Scope grew/)).toBeInTheDocument();
    expect(within(lines[1]).getByText(/The technical direction holds up/)).toBeInTheDocument();

    await user.click(within(lines[0]).getByRole("button", { name: "Show previous results" }));
    await user.click(within(lines[1]).getByRole("button", { name: "Show previous results" }));

    const spread = within(platform).getByRole("list", { name: "Platform spread" });
    expect(within(spread).getByText("Below").parentElement).toHaveTextContent("2 · 13%");
    expect(within(spread).getByText("Developing").parentElement).toHaveTextContent("4 · 25%");
    expect(within(spread).getByText("Strong").parentElement).toHaveTextContent("4 · 25%");
    expect(within(spread).getByText("Exceeding").parentElement).toHaveTextContent("4 · 25%");
    expect(within(platform).getByText("38%")).toBeInTheDocument();
    expect(within(platform).getByText("8 people").closest("p")).toHaveTextContent(
      "Showing results before the changes for Employee A and Employee B.",
    );
    expect(within(lines[0]).getByText(/Scope grew/)).toBeInTheDocument();
    expect(within(lines[1]).getByText(/The technical direction holds up/)).toBeInTheDocument();

    const summary = within(screen.getByRole("region", { name: "Engineering" })).getByRole("list", {
      name: "Engineering groups",
    });
    expect(within(summary).getByText("Platform").parentElement).toHaveTextContent("38%");
  });

  it("shows Platform flagged with an AI summary, and Infra with neither", async () => {
    const user = userEvent.setup();
    renderPage();

    const platform = screen.getByRole("region", { name: "Platform" });
    expect(within(platform).getByText("Flagged")).toBeInTheDocument();
    expect(within(platform).getByRole("region", { name: "Platform AI summary" })).toHaveTextContent(
      "setting the technical direction",
    );

    await user.click(screen.getByRole("button", { name: "Infra" }));
    expect(screen.queryByRole("region", { name: "Platform" })).not.toBeInTheDocument();
    const infra = screen.getByRole("region", { name: "Infra" });
    expect(within(infra).getByText("Riley Shah")).toBeInTheDocument();
    expect(within(infra).getByText("Closed")).toBeInTheDocument();
    expect(within(infra).getByRole("list", { name: "Infra spread" })).toBeInTheDocument();
    expect(within(infra).getAllByRole("article", { name: "Person line" })).toHaveLength(6);
    expect(within(infra).queryByText("Flagged")).not.toBeInTheDocument();
    expect(within(infra).queryByRole("region", { name: "Infra AI summary" })).not.toBeInTheDocument();
    expect(within(infra).getByText("Exceeding+")).toBeInTheDocument();
    expect(within(infra).getByText("17%")).toBeInTheDocument();
  });

  it("moves Infra's Exceeding+ when a Strong rating was raised to Exceeding", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Infra" }));
    const infra = screen.getByRole("region", { name: "Infra" });
    const line = within(infra).getByText("Employee D").closest("article");
    expect(line).not.toBeNull();
    const person = line as HTMLElement;
    expect(within(person).getByText("This history has been changed")).toBeInTheDocument();

    await user.click(within(person).getByRole("button", { name: "Show review" }));
    await user.click(within(person).getByRole("button", { name: "Show rating changes" }));
    const history = within(person).getByRole("region", { name: "Rating changes" });
    expect(history).toHaveTextContent("Craft rating: Strong");
    expect(history).toHaveTextContent("Culture rating: Strong");
    expect(history).toHaveTextContent("Justification: The shorter incident timeline holds up");
    expect(within(history).getByText("Riley Shah · 1 Mar 2026, 08:15")).toBeInTheDocument();

    const summary = within(screen.getByRole("region", { name: "Engineering" })).getByRole("list", {
      name: "Engineering groups",
    });
    const infraSummary = within(summary).getByText("Infra").parentElement;
    expect(infraSummary).toHaveTextContent("17%");

    await user.click(within(history).getByRole("button", { name: "Show previous results" }));
    const spread = within(infra).getByRole("list", { name: "Infra spread" });
    expect(within(spread).getByText("Strong").parentElement).toHaveTextContent("7 · 58%");
    expect(within(spread).getByText("Exceeding").parentElement).toHaveTextContent("1 · 8%");
    expect(within(infra).getByText("8%")).toBeInTheDocument();
    expect(within(infra).queryByText("17%")).not.toBeInTheDocument();
    expect(infraSummary).toHaveTextContent("8%");
    expect(infraSummary).not.toHaveTextContent("17%");
    expect(within(infra).getByText("6 people").closest("p")).toHaveTextContent(
      "Showing results before the change for Employee D.",
    );
    expect(within(person).getByRole("region", { name: "Manager review" })).toHaveTextContent(
      "Craft rating: Exceeding",
    );
  });

  it("shows Design and Research without histograms, and only Design is flagged", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Design" }));
    const design = screen.getByRole("region", { name: "Design" });
    expect(within(design).getByRole("heading", { name: "Design" })).toBeInTheDocument();
    expect(within(design).getByText("Closed")).toBeInTheDocument();
    expect(within(design).queryByRole("list", { name: "Design spread" })).not.toBeInTheDocument();
    expect(within(design).getByText("Spread not shown because this team has fewer than 5 people.")).toBeInTheDocument();
    expect(within(design).getByText("Flagged")).toBeInTheDocument();
    expect(within(design).getByRole("region", { name: "Design AI summary" })).toHaveTextContent(
      "raising the visual bar",
    );
    expect(within(design).getAllByRole("article", { name: "Person line" })).toHaveLength(3);
    expect(within(design).queryByRole("list", { name: "Design spread" })).not.toBeInTheDocument();
    expect(within(design).queryByText("Exceeding+")).not.toBeInTheDocument();
    expect(screen.queryByText("design-1")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Research" }));
    expect(screen.queryByRole("region", { name: "Design" })).not.toBeInTheDocument();
    const research = screen.getByRole("region", { name: "Research" });
    expect(within(research).getByRole("heading", { name: "Research" })).toBeInTheDocument();
    expect(within(research).getByText("Closed")).toBeInTheDocument();
    expect(within(research).queryByRole("list", { name: "Research spread" })).not.toBeInTheDocument();
    expect(within(research).getByText("Spread not shown because this team has fewer than 5 people.")).toBeInTheDocument();
    expect(within(research).queryByText("Flagged")).not.toBeInTheDocument();
    expect(within(research).queryByRole("region", { name: "Research AI summary" })).not.toBeInTheDocument();
    expect(within(research).getAllByRole("article", { name: "Person line" })).toHaveLength(3);
    expect(within(research).queryByText("Exceeding+")).not.toBeInTheDocument();
  });

  it("shows an Engineering session change on Design's person line", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Design" }));
    const design = screen.getByRole("region", { name: "Design" });
    await user.click(within(design).getAllByRole("button", { name: "Show review" })[0]);
    const line = within(design).getByText(/Raised the visual bar/).closest("article");
    expect(line).not.toBeNull();
    const person = line as HTMLElement;
    expect(within(person).getByRole("region", { name: "Manager review" })).toHaveTextContent(
      "Culture rating: Exceeding",
    );
    expect(within(person).queryByText("The critique holds up across Engineering")).not.toBeInTheDocument();

    await user.click(within(person).getByRole("button", { name: "Show rating changes" }));

    const history = within(person).getByRole("region", { name: "Rating changes" });
    expect(within(history).getByText("Jordan Hale · 1 Mar 2026, 08:30")).toBeInTheDocument();
    expect(history).toHaveTextContent("Craft rating: Exceeding");
    expect(history).toHaveTextContent("Culture rating: Strong");
    expect(history).toHaveTextContent("Justification: The critique holds up across Engineering");
    expect(within(history).queryByText("New")).not.toBeInTheDocument();
    expect(within(history).queryByText("Engineering")).not.toBeInTheDocument();
    const engineeringSummary = within(screen.getByRole("region", { name: "Engineering" })).getByRole("list", {
      name: "Engineering groups",
    });
    const designSummary = within(engineeringSummary).getByText("Design").parentElement;
    expect(designSummary).toHaveTextContent("50%");
    await user.click(within(history).getByRole("button", { name: "Show previous results" }));
    expect(designSummary).toHaveTextContent("33%");
    expect(designSummary).not.toHaveTextContent("50%");
    expect(
      within(screen.getByRole("region", { name: "Engineering" })).queryByText(
        "The critique holds up across Engineering",
      ),
    ).not.toBeInTheDocument();
    const culture = within(person).getByRole("region", { name: "Manager review" });
    expect(culture).toHaveTextContent("Culture rating: Exceeding");
    expect(culture).not.toHaveTextContent("Culture rating: Strong");
  });

  it("hides a department still under five and carries those ratings to the parent", async () => {
    const user = userEvent.setup();
    render(<DepartmentPage view={divisionView} />);

    const division = screen.getByRole("region", { name: "Division" });
    expect(within(division).getByText("Open")).toBeInTheDocument();
    expect(within(division).queryByRole("list", { name: "Division person lines" })).not.toBeInTheDocument();
    expect(within(division).queryByRole("list", { name: "Division spread" })).not.toBeInTheDocument();
    const summary = within(division).getByRole("list", { name: "Division groups" });
    expect(within(summary).getByText("Product")).toBeInTheDocument();
    expect(within(summary).getByText("Support")).toBeInTheDocument();
    expect(within(summary).getAllByText("0%")).toHaveLength(2);
    expect(within(division).getByText("Share rated Exceeding or above. The line marks 40%.")).toBeInTheDocument();

    const product = screen.getByRole("region", { name: "Product" });
    expect(within(product).getByText("Closed")).toBeInTheDocument();
    expect(within(product).queryByRole("list", { name: "Product spread" })).not.toBeInTheDocument();
    expect(within(product).getByText("Spread not shown because this team has fewer than 5 people.")).toBeInTheDocument();
    expect(within(product).queryByRole("list", { name: "Product person lines" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Support" }));
    expect(screen.queryByRole("region", { name: "Product" })).not.toBeInTheDocument();
    const support = screen.getByRole("region", { name: "Support" });
    expect(within(support).queryByRole("list", { name: "Support spread" })).not.toBeInTheDocument();
    expect(within(support).getByText("Spread not shown because this team has fewer than 5 people.")).toBeInTheDocument();
    expect(within(support).getAllByRole("article", { name: "Person line" })).toHaveLength(2);
  });

  it("shows the hidden children on their own page while the department stays under five", async () => {
    const user = userEvent.setup();
    render(<DepartmentPage view={productView} />);

    const product = screen.getByRole("region", { name: "Product" });
    expect(within(product).queryByRole("list", { name: "Product spread" })).not.toBeInTheDocument();
    expect(within(product).queryByRole("list", { name: "Product person lines" })).not.toBeInTheDocument();

    const north = screen.getByRole("region", { name: "North" });
    expect(within(north).queryByRole("list", { name: "North spread" })).not.toBeInTheDocument();
    expect(within(north).getByText("Spread not shown because this team has fewer than 5 people.")).toBeInTheDocument();
    expect(within(north).getAllByRole("article", { name: "Person line" })).toHaveLength(2);
    await user.click(within(north).getAllByRole("button", { name: "Show review" })[0]);
    expect(within(north).getByText(/Shipped the shared kit/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "South" }));
    expect(screen.queryByRole("region", { name: "North" })).not.toBeInTheDocument();
    const south = screen.getByRole("region", { name: "South" });
    expect(within(south).queryByRole("list", { name: "South spread" })).not.toBeInTheDocument();
    expect(within(south).getAllByRole("article", { name: "Person line" })).toHaveLength(2);
  });

  it("keeps the group cards open and collapses reviews and a person review", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.queryByRole("button", { name: "Collapse Engineering" })).not.toBeInTheDocument();
    const platform = screen.getByRole("region", { name: "Platform" });
    expect(within(platform).queryByRole("button", { name: "Collapse Platform" })).not.toBeInTheDocument();
    expect(within(platform).getByRole("list", { name: "Platform spread" })).toBeInTheDocument();
    await user.click(within(platform).getByRole("button", { name: "Reviews" }));
    expect(within(platform).queryByRole("button", { name: "Show review" })).not.toBeInTheDocument();
    expect(within(platform).getByRole("list", { name: "Platform spread" })).toBeInTheDocument();
    await user.click(within(platform).getByRole("button", { name: "Reviews" }));
    await user.click(within(platform).getAllByRole("button", { name: "Show review" })[0]);
    expect(within(platform).getByText(/Took on the rollout/)).toBeInTheDocument();
    await user.click(within(platform).getByRole("button", { name: "Hide review" }));
    expect(within(platform).queryByText(/Took on the rollout/)).not.toBeInTheDocument();
  });

  it("loads the department from the api", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => departmentView,
      }),
    );

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Engineering" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Platform" })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/api/department",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
});
