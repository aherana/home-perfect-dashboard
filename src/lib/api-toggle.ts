// In-memory kill switch for the mock API, toggled via POST /api/toggle. Every
// route handler (including /api/health) checks isApiEnabled() and returns 503
// when it's false, to simulate the backend going down for testing/demos.
//
// This is a module-level singleton, which only works within one long-running
// Node process (fine for `next dev` and a single-instance deployment) — it
// does NOT synchronize across multiple serverless instances.
let enabled = true;

export function isApiEnabled(): boolean {
  return enabled;
}

export function setApiEnabled(value: boolean): void {
  enabled = value;
}
