/**
 * THIS IS JUST AN EXAMPLE. DO NOT COPY IT.
 *
 * COMPONENTS - the reusable pieces of the screens: they draw what they receive.
 *
 * Contains: markup and its styles (a CSS Module next to the component). Data comes in as props,
 * what the user does goes out as callbacks (onSelect).
 * Does not contain: fetch, api/, hooks/, imports from pages/ (ESLint enforces it). It may import
 * lib/ to format what it shows.
 * Why: a component is tested by rendering it with props, with no server.
 *
 * Example: one service on the kiosk (stories 1 and 6). Imports use the final file names, created
 * with the first story. Delete when the real files exist.
 */
import { formatWait } from '../lib/formatWait.js';
import styles from './example.module.css';

export function ServiceCard({ service, onSelect }) {
  return (
    <button type="button" className={styles.card} onClick={() => onSelect(service.id)}>
      <span className={styles.tag}>{service.tag}</span>
      <span>{service.queueLength} waiting</span>
      <span>about {formatWait(service.estimatedWaitSec)}</span>
    </button>
  );
}
