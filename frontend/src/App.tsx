import { useEffect, useState } from "react";
import { DepartmentPage } from "./DepartmentPage";
import type { DepartmentView } from "./types";

export function App() {
  const [view, setView] = useState<DepartmentView | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/department", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load the department");
        }
        return response.json() as Promise<DepartmentView>;
      })
      .then((payload) => {
        setView(payload);
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") {
          return;
        }
        setError("Could not load the department");
      });
    return () => controller.abort();
  }, []);

  if (error) {
    return (
      <main className="page">
        <p role="alert">{error}</p>
      </main>
    );
  }
  if (!view) {
    return (
      <main className="page">
        <p>Loading the department…</p>
      </main>
    );
  }
  return <DepartmentPage view={view} />;
}
