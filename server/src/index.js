/**
 * THIS IS JUST A PLACEHOLDER.
 *
 * INDEX - the entry point: the only file that starts the server (npm start runs it).
 *
 * Contains: importing `app` and calling listen() on a port (PORT, default 3001).
 * Does not contain: routes, wiring, logic. All of it lives in app.js.
 * Why separate: tests import `app` without opening a port.
 *
 * It works once app.js and the files app.js imports exist.
 */
import { app } from './app.js';

const port = process.env.PORT ?? 3001;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
