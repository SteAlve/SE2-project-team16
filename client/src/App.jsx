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

import SelectServicePage from './pages/SelectServicePage/SelectServicePage'
import ShowTicketPage from './pages/ShowTicketPage/ShowTicketPage'
import { Routes, Route, BrowserRouter } from "react-router-dom"

function App() {

  // Enable client-side navigation through React Router
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/select-service" element={<SelectServicePage />} />
          <Route path="/show-ticket" element={<ShowTicketPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App
