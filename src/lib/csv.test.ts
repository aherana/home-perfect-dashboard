import { buildCsv, recordsToCsv } from "./csv";
import type { FieldRowData } from "./types";

describe("buildCsv", () => {
  it("joins headers and rows with commas and CRLF-free newlines", () => {
    expect(buildCsv(["Name", "Amount"], [["Alice", "10"], ["Bob", "20"]])).toBe(
      "Name,Amount\nAlice,10\nBob,20"
    );
  });

  it("quotes fields containing commas, quotes, or newlines", () => {
    expect(buildCsv(["Note"], [['Says "hi", bye\nend']])).toBe('Note\n"Says ""hi"", bye\nend"');
  });

  it("returns just the header row when there are no data rows", () => {
    expect(buildCsv(["A", "B"], [])).toBe("A,B");
  });
});

describe("recordsToCsv", () => {
  const fields: FieldRowData[] = [
    { label: "Leads sent", value: "6" },
    { label: "Revenue collected", value: "$42,300" },
  ];

  it("uses the first record's field labels as the header row, prefixed by the title header", () => {
    const csv = recordsToCsv("Partner", [{ title: "Temecula Valley Plumbing", fields }]);
    expect(csv.split("\n")[0]).toBe("Partner,Leads sent,Revenue collected");
  });

  it("emits one row per record with the title first", () => {
    const csv = recordsToCsv("Partner", [
      { title: "Temecula Valley Plumbing", fields },
      { title: "Murrieta Pro Plumbing", fields: [{ label: "Leads sent", value: "5" }, { label: "Revenue collected", value: "$31,150" }] },
    ]);
    const rows = csv.split("\n");
    expect(rows[1]).toBe("Temecula Valley Plumbing,6,$42,300".replace("$42,300", '"$42,300"'));
    expect(rows[2]).toBe("Murrieta Pro Plumbing,5,$31,150".replace("$31,150", '"$31,150"'));
  });

  it("returns an empty string for no records", () => {
    expect(recordsToCsv("Partner", [])).toBe("");
  });
});
