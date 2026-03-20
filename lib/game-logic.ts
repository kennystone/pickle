/**
 * Pure game logic functions for testability.
 */

const PA_MAP_URL = "https://maps.app.goo.gl/2semxb1XU9zmQ3ky7";

export function isGameFull(attendeeCount: number, peopleNeeded: number): boolean {
  return attendeeCount >= peopleNeeded;
}

export function shouldShowRsvp(attendeeCount: number, peopleNeeded: number): boolean {
  return !isGameFull(attendeeCount, peopleNeeded);
}

export function getLocationUrl(place: string): string | null {
  return place === "PA" ? PA_MAP_URL : null;
}

export function isKennyStone(name: string): boolean {
  return name.toLowerCase() === "kenny stone";
}

export function canRemoveAttendee(attendeeName: string, viewerName: string | undefined): boolean {
  if (!viewerName) return false;
  return attendeeName.toLowerCase() === viewerName.toLowerCase();
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function gameFullMessage(viewerName: string | undefined, attendeeNames: string[]): string {
  if (!viewerName) return "Game is full! See you next time.";
  const isPlaying = attendeeNames.some(
    (n) => n.toLowerCase() === viewerName.toLowerCase()
  );
  return isPlaying
    ? "Game is full! See you on the court!"
    : "Game is full! See you next time.";
}

export type InviteStatus = "confirmed" | "pending" | "declined";

export function getInviteStatus(
  playerName: string,
  attendeeNames: string[],
  declinedNames: string[],
): InviteStatus {
  if (attendeeNames.some((n) => n.toLowerCase() === playerName.toLowerCase())) {
    return "confirmed";
  }
  if (declinedNames.some((n) => n.toLowerCase() === playerName.toLowerCase())) {
    return "declined";
  }
  return "pending";
}

export function getInviteAction(status: InviteStatus): string {
  switch (status) {
    case "confirmed": return "Remove";
    case "pending": return "Confirm";
    case "declined": return "Reset";
  }
}

export type RsvpState = "ask" | "confirmed";

export function getRsvpState(
  playerName: string | undefined,
  attendeeNames: string[],
): RsvpState {
  if (!playerName) return "ask";
  const isIn = attendeeNames.some(
    (n) => n.toLowerCase() === playerName.toLowerCase()
  );
  return isIn ? "confirmed" : "ask";
}

export function formatPillText(
  weekday: string,
  shortDate: string,
  timeRange: string,
  place: string,
): string {
  return `${weekday} ${shortDate} · ${timeRange} @ ${place}`;
}
