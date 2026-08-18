import { DAY_FEED_INTERVAL_HOURS, MILK_EXPIRY_HOURS, NIGHT_FEED_INTERVAL_HOURS } from '../config/feeding';
import type { NightWindow } from '../storage/nightWindow';

const HOUR_MS = 60 * 60_000;

export function isNightTime(timestamp: number, window: NightWindow): boolean {
  const hour = new Date(timestamp).getHours();
  const { startHour, endHour } = window;

  if (startHour === endHour) return false;

  return startHour < endHour
    ? hour >= startHour && hour < endHour
    : hour >= startHour || hour < endHour;
}

export function computeNextFeedTime(lastFeedAt: number, window: NightWindow): number {
  const intervalHours = isNightTime(lastFeedAt, window) ? NIGHT_FEED_INTERVAL_HOURS : DAY_FEED_INTERVAL_HOURS;
  return lastFeedAt + intervalHours * HOUR_MS;
}

export function computeMilkExpiry(lastFeedAt: number): number {
  return lastFeedAt + MILK_EXPIRY_HOURS * HOUR_MS;
}
