/**
 * THIS IS JUST AN EXAMPLE. DO NOT COPY IT.
 *
 * TESTS - run by Vitest. Real tests are named *.test.js or *.test.jsx; this file is not run.
 *   lib:         call the pure functions with plain values.
 *   components:  render with props (Testing Library), click like a user, check what is on screen.
 *   pages:       render the page with the api/ modules replaced by vi.mock: no server needed.
 *
 * Example: stories 1 and 6. Imports use the final file names, created with the first story.
 * It needs vitest, jsdom, @testing-library/react and @testing-library/user-event (not installed yet).
 * Delete when the real tests exist.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { formatWait } from '../src/lib/formatWait.js';
import { ServiceCard } from '../src/components/ServiceCard.jsx';
import { KioskPage } from '../src/pages/KioskPage.jsx';

// The pages talk to the server only through api/: replace those modules (vi.mock is hoisted).
vi.mock('../src/api/services.js', () => ({
  getServices: async () => [{ id: 3, tag: 'SHIP', queueLength: 4, estimatedWaitSec: 950 }],
}));
vi.mock('../src/api/tickets.js', () => ({
  issueTicket: async () => ({ code: 'SHIP-007', estimatedWaitSec: 950 }),
}));

describe('formatWait (lib)', () => {
  it('matches the spec example: 15:50', () => {
    expect(formatWait(950)).toBe('15:50');
  });
});

describe('ServiceCard (component)', () => {
  it('shows the queue and tells which service was chosen', async () => {
    const onSelect = vi.fn();
    const service = { id: 3, tag: 'SHIP', queueLength: 4, estimatedWaitSec: 950 };
    render(<ServiceCard service={service} onSelect={onSelect} />);

    expect(screen.getByText('4 waiting')).toBeTruthy();
    await userEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith(3);
  });
});

describe('KioskPage (page, with api mocked)', () => {
  it('shows the ticket code after choosing a service', async () => {
    render(<KioskPage />);

    await userEvent.click(await screen.findByRole('button'));
    expect(await screen.findByText(/SHIP-007/)).toBeTruthy();
  });
});
