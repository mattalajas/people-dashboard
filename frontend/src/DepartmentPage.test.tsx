import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { DepartmentPage } from "./DepartmentPage";
import { departmentView } from "./departmentFixture";

function renderPage() {
  return render(<DepartmentPage view={departmentView} />);
}

function personLine(justification: string) {
  const match = screen.getByText(justification).closest("article");
  if (!match) {
    throw new Error(`No person line contains ${justification}`);
  }
  return match;
}

function labeledValue(scope: HTMLElement, label: string) {
  const container = within(scope).getByText(label).closest("div");
  if (!container) {
    throw new Error(`No value for ${label}`);
  }
  return container;
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
    const engineeringSpread = within(engineering).getByRole("list", { name: "Engineering spread" });
    expect(within(engineeringSpread).getByText("Below").parentElement).toHaveTextContent("1");

    const platform = screen.getByRole("region", { name: "Platform" });
    expect(within(platform).getByRole("heading", { name: "Platform" })).toBeInTheDocument();
    expect(within(platform).getByText("Closed")).toBeInTheDocument();

    expect(document.querySelector("input, textarea, select, [contenteditable='true']")).toBeNull();
    expect(screen.queryByText("person-1")).not.toBeInTheDocument();
  });

  it("shows Platform's five-band histogram from both ratings", () => {
    renderPage();

    const spread = screen.getByRole("list", { name: "Platform spread" });
    const bands = within(spread).getAllByRole("listitem");
    expect(bands.map((band) => [within(band).getByText(/^(Below|Developing|Strong|Exceeding|Exceptional)$/).textContent, within(band).getByText(/^\d+$/).textContent])).toEqual([
      ["Below", "2"],
      ["Developing", "3"],
      ["Strong", "4"],
      ["Exceeding", "5"],
      ["Exceptional", "2"],
    ]);
  });

  it("shows eight unnamed person lines with both ratings, both justifications, and the self review", () => {
    renderPage();

    const platform = screen.getByRole("region", { name: "Platform" });
    const lines = within(platform).getAllByRole("article", { name: "Person line" });
    expect(lines).toHaveLength(8);

    const line = personLine("Took on the rollout");
    expect(labeledValue(line, "Craft rating")).toHaveTextContent("Strong");
    expect(labeledValue(line, "Culture rating")).toHaveTextContent("Strong");
    expect(labeledValue(line, "Craft justification")).toHaveTextContent("Took on the rollout");
    expect(labeledValue(line, "Culture justification")).toHaveTextContent("Steadied the team rituals");

    const selfReview = within(line).getByRole("region", { name: "Self review" });
    expect(within(selfReview).getByText("Took on the rollout in their own words")).toBeInTheDocument();
    expect(within(selfReview).getByText("Steadied the team rituals in their own words")).toBeInTheDocument();
    expect(within(selfReview).getByText("Next step after Took on the rollout")).toBeInTheDocument();
    expect(within(line).queryByText("Scope grew")).not.toBeInTheDocument();
  });

  it("shows only the chosen person's rating changes, and keeps the current ratings", async () => {
    const user = userEvent.setup();
    renderPage();

    const first = personLine("Took on the rollout");
    await user.click(within(first).getByRole("button", { name: "Show rating changes" }));

    const firstHistory = within(first).getByRole("region", { name: "Rating changes" });
    expect(within(firstHistory).getByText("Craft")).toBeInTheDocument();
    expect(within(firstHistory).getByText("Developing")).toBeInTheDocument();
    expect(within(firstHistory).getByText("Strong")).toBeInTheDocument();
    expect(within(firstHistory).getByText("Scope grew")).toBeInTheDocument();
    expect(within(firstHistory).getByText("Platform")).toBeInTheDocument();
    expect(within(firstHistory).queryByText("Steadier collaboration")).not.toBeInTheDocument();

    const craftRating = within(first).getByText("Craft rating").closest("div");
    expect(craftRating).not.toBeNull();
    expect(within(craftRating as HTMLElement).getByText("Strong")).toBeInTheDocument();
    expect(within(craftRating as HTMLElement).queryByText("Developing")).not.toBeInTheDocument();

    const second = personLine("Set the technical direction");
    await user.click(within(second).getByRole("button", { name: "Show rating changes" }));

    expect(screen.queryByText("Scope grew")).not.toBeInTheDocument();
    const secondHistory = within(second).getByRole("region", { name: "Rating changes" });
    expect(within(secondHistory).getByText("Culture")).toBeInTheDocument();
    expect(within(secondHistory).getByText("Below")).toBeInTheDocument();
    expect(within(secondHistory).getByText("Strong")).toBeInTheDocument();
    expect(within(secondHistory).getByText("Steadier collaboration")).toBeInTheDocument();
    expect(within(secondHistory).getByText("Platform")).toBeInTheDocument();

    const cultureRating = within(second).getByText("Culture rating").closest("div");
    expect(cultureRating).not.toBeNull();
    expect(within(cultureRating as HTMLElement).getByText("Strong")).toBeInTheDocument();
    expect(within(cultureRating as HTMLElement).queryByText("Below")).not.toBeInTheDocument();

    const untouched = personLine("Missed the design bar");
    await user.click(within(untouched).getByRole("button", { name: "Show rating changes" }));
    const emptyHistory = within(untouched).getByRole("region", { name: "Rating changes" });
    expect(within(emptyHistory).queryByRole("article")).not.toBeInTheDocument();
    expect(screen.queryByText("Scope grew")).not.toBeInTheDocument();
    expect(screen.queryByText("Steadier collaboration")).not.toBeInTheDocument();
  });

  it("shows Platform flagged with an AI summary, and Infra with neither", () => {
    renderPage();

    const platform = screen.getByRole("region", { name: "Platform" });
    expect(within(platform).getByText("Flagged")).toBeInTheDocument();
    expect(within(platform).getByRole("region", { name: "Platform AI summary" })).toHaveTextContent(
      "setting the technical direction",
    );

    const infra = screen.getByRole("region", { name: "Infra" });
    expect(within(infra).getByText("Closed")).toBeInTheDocument();
    expect(within(infra).getByRole("list", { name: "Infra spread" })).toBeInTheDocument();
    expect(within(infra).getAllByRole("article", { name: "Person line" })).toHaveLength(6);
    expect(within(infra).queryByText("Flagged")).not.toBeInTheDocument();
    expect(within(infra).queryByRole("region", { name: "Infra AI summary" })).not.toBeInTheDocument();
    expect(within(infra).getByText("Kept the build green")).toBeInTheDocument();
  });

  it("shows Design and Research without histograms, and only Design is flagged", () => {
    renderPage();

    const design = screen.getByRole("region", { name: "Design" });
    expect(within(design).getByRole("heading", { name: "Design" })).toBeInTheDocument();
    expect(within(design).getByText("Closed")).toBeInTheDocument();
    expect(within(design).queryByRole("list", { name: "Design spread" })).not.toBeInTheDocument();
    expect(within(design).getByText("Flagged")).toBeInTheDocument();
    expect(within(design).getByRole("region", { name: "Design AI summary" })).toHaveTextContent(
      "raising the visual bar",
    );
    expect(within(design).getAllByRole("article", { name: "Person line" })).toHaveLength(3);
    expect(within(design).getByText("Raised the visual bar")).toBeInTheDocument();
    expect(screen.queryByText("design-1")).not.toBeInTheDocument();

    const research = screen.getByRole("region", { name: "Research" });
    expect(within(research).getByRole("heading", { name: "Research" })).toBeInTheDocument();
    expect(within(research).getByText("Closed")).toBeInTheDocument();
    expect(within(research).queryByRole("list", { name: "Research spread" })).not.toBeInTheDocument();
    expect(within(research).queryByText("Flagged")).not.toBeInTheDocument();
    expect(within(research).queryByRole("region", { name: "Research AI summary" })).not.toBeInTheDocument();
    expect(within(research).getAllByRole("article", { name: "Person line" })).toHaveLength(3);
    expect(within(research).getByText("Found the failed assumption")).toBeInTheDocument();
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
