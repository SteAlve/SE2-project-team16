/**
 * MAIN - the entry point: mounts <App /> in the page (index.html). Nothing else.
 * It works as it is and rarely changes.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './global.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className='app-container'>
      <App />
    </div>
  </StrictMode>,
);
