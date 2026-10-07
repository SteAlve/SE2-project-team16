/**
 * THIS IS JUST A PLACEHOLDER.
 *
 * APP - the root of the client: the only file that knows every page.
 *
 * Contains: the router, with one route for each page.
 * Does not contain: data, logic, the markup of a screen (that is pages/).
 *
 * Intended wiring, once react-router-dom is installed:
 *
 *   <BrowserRouter>
 *     <Routes>
 *       <Route path="/" element={<KioskPage />} />
 *       <Route path="/officer/:counterId" element={<OfficerPage />} />
 *       <Route path="/board" element={<BoardPage />} />
 *       <Route path="/manager" element={<ManagerPage />} />
 *       <Route path="/admin" element={<AdminPage />} />
 *     </Routes>
 *   </BrowserRouter>
 */
export default function App() {
  return <h1>Office Queue</h1>;
}
