/**
 * THIS IS JUST A PLACEHOLDER CHECK IT.
 *
 * CLOCK - the only place that reads the system date.
 *
 * Contains: today(), the business day as 'YYYY-MM-DD' in local time. app.js hands `clock` to the
 * use cases, so nothing else calls new Date() (ESLint forbids it in domain/ and usecases/).
 * Does not contain: business rules, formatting for the API.
 * Why: tests pass a fake clock, e.g. { today: () => '2026-01-15' }, to check the daily reset.
 * Local time on purpose: toISOString() gives the UTC date and would switch day at the wrong hour.
 */
export const clock = {
  today() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  },
};
