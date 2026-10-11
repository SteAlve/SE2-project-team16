/**
 *
 * THIS IS JUST AN EXAMPLE. DO NOT COPY IT.
 *
 * MIDDLEWARE - code that runs before the controllers. For now it has one job: finding out
 * who is calling. One file per concern: requireAuth.js, ...
 *
 * Contains: factory functions that receive what they need (handed over by app.js) and return an
 * Express middleware (req, res, next). Reading the cookie and putting the user in req.user.
 * Does not contain: business rules (who may do what is checked by the use case, on the user the
 * controller hands over), SQL, status codes or error bodies, password hashing, the clock,
 * imports from any other layer or from the database (it imports nothing).
 *
 * Failures are not answered here: the middleware calls next(err) and the error middleware in
 * app.js turns UnauthorizedError into 401. So a missing cookie is not special-cased either:
 * the `authenticate` use case receives `undefined` and fails with 401.
 *
 * The router puts the middleware in front of the controller of every protected path, e.g.
 *   router.post('/counters/:counterId/next-ticket', requireAuth, controllers.callNextTicket);
 * Public paths (GET /api/services, POST /api/tickets) never see it.
 *
 * Example: story 2 (the officer calls the next customer), the part before the controller.
 * Delete when the real files exist.
 */

// --- requireAuth.js ---

/**
 * Reads the session id from the Cookie header. A tiny parser on purpose: no library, no import.
 * @param {string | undefined} header value of the Cookie header, e.g. 'sid=abc123; theme=dark'
 * @param {string} name name of the session cookie
 * @returns {string | undefined} the session id, or undefined when the cookie is absent
 */
function readCookie(header, name) {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    if (part.slice(0, index).trim() === name) {
      return decodeURIComponent(part.slice(index + 1).trim());
    }
  }
  return undefined;
}

/**
 * @param {(sessionId: string | undefined) => (object | Promise<object>)} authenticate
 *   the `authenticate` use case, already built by app.js: given a session id it returns the
 *   user or throws UnauthorizedError (-> 401). This is the contract.
 * @param {string} [cookieName] name of the session cookie, the same one the login controller sets
 * @returns {(req, res, next) => Promise<void>} the Express middleware
 */
export function makeRequireAuth(authenticate, cookieName = 'sid') {
  return async function requireAuth(req, res, next) {
    try {
      const sessionId = readCookie(req.headers.cookie, cookieName);
      req.user = await authenticate(sessionId); // 401 if unknown: the controller never runs
      next();
    } catch (err) {
      next(err); // the error middleware in app.js maps it to a status code
    }
  };
}

// --- in app.js (wiring, for reference) ---
//
//   const requireAuth = makeRequireAuth(authenticate);
//   app.use('/api', makeRouters(controllers, { requireAuth }));
//
// --- in a test: no database, no HTTP server ---
//
//   const requireAuth = makeRequireAuth((id) => {
//     if (id !== 'good') throw new UnauthorizedError();
//     return { id: 1, role: 'officer', counterId: 3 };
//   });
//   const req = { headers: { cookie: 'sid=good' } };
//   await requireAuth(req, {}, () => {});   // req.user is now the officer
