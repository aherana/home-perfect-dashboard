import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toolbar } from "./Toolbar";

describe("Toolbar", () => {
  it("renders the search input and reports typed queries", async () => {
    const user = userEvent.setup();
    const onQueryChange = jest.fn();
    render(
      <Toolbar
        searchPlaceholder="Search…"
        query=""
        onQueryChange={onQueryChange}
        exportLabel="Export CSV"
        onExport={() => {}}
      />
    );
    await user.type(screen.getByPlaceholderText("Search…"), "x");
    expect(onQueryChange).toHaveBeenCalledWith("x");
  });

  it("calls onExport when the export button is clicked", async () => {
    const user = userEvent.setup();
    const onExport = jest.fn();
    render(
      <Toolbar searchPlaceholder="Search…" query="" onQueryChange={() => {}} exportLabel="Export CSV" onExport={onExport} />
    );
    await user.click(screen.getByRole("button", { name: "Export CSV" }));
    expect(onExport).toHaveBeenCalled();
  });

  it("omits the carrier filter and status segments when not configured", () => {
    render(
      <Toolbar searchPlaceholder="Search…" query="" onQueryChange={() => {}} exportLabel="Export CSV" onExport={() => {}} />
    );
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
  });

  it("renders a carrier filter when carrierOptions is given, and reports selections", async () => {
    const user = userEvent.setup();
    const onCarrierChange = jest.fn();
    render(
      <Toolbar
        searchPlaceholder="Search…"
        query=""
        onQueryChange={() => {}}
        carrierOptions={["State Farm", "Farmers"]}
        carrier=""
        onCarrierChange={onCarrierChange}
        exportLabel="Export CSV"
        onExport={() => {}}
      />
    );
    await user.selectOptions(screen.getByRole("combobox"), "Farmers");
    expect(onCarrierChange).toHaveBeenCalledWith("Farmers");
  });

  it("renders status segments when statusOptions is given, marks the active one, and reports clicks", async () => {
    const user = userEvent.setup();
    const onStatusChange = jest.fn();
    render(
      <Toolbar
        searchPlaceholder="Search…"
        query=""
        onQueryChange={() => {}}
        statusOptions={[
          { value: "all", label: "All" },
          { value: "open", label: "Needs Attention" },
          { value: "resolved", label: "Resolved" },
        ]}
        status="all"
        onStatusChange={onStatusChange}
        exportLabel="Export CSV"
        onExport={() => {}}
      />
    );
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Needs Attention" }));
    expect(onStatusChange).toHaveBeenCalledWith("open");
  });
});
