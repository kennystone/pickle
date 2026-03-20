import { test, expect, describe } from "bun:test";
import {
  isGameFull,
  shouldShowRsvp,
  getLocationUrl,
  isKennyStone,
  canRemoveAttendee,
  formatDuration,
  formatPillText,
  gameFullMessage,
  getInviteStatus,
  getInviteAction,
  getRsvpState,
} from "./game-logic";

describe("isGameFull", () => {
  test("not full when under capacity", () => {
    expect(isGameFull(3, 5)).toBe(false);
  });

  test("full when at capacity", () => {
    expect(isGameFull(5, 5)).toBe(true);
  });

  test("full when over capacity", () => {
    expect(isGameFull(6, 5)).toBe(true);
  });

  test("not full with zero attendees", () => {
    expect(isGameFull(0, 5)).toBe(false);
  });
});

describe("shouldShowRsvp", () => {
  test("shows RSVP when not full", () => {
    expect(shouldShowRsvp(3, 5)).toBe(true);
  });

  test("hides RSVP when full", () => {
    expect(shouldShowRsvp(5, 5)).toBe(false);
  });

  test("hides RSVP when over capacity", () => {
    expect(shouldShowRsvp(7, 5)).toBe(false);
  });
});

describe("getLocationUrl", () => {
  test("returns map URL for PA", () => {
    expect(getLocationUrl("PA")).toBe("https://maps.app.goo.gl/2semxb1XU9zmQ3ky7");
  });

  test("returns null for other locations", () => {
    expect(getLocationUrl("Riverside Courts")).toBeNull();
  });

  test("case sensitive — pa does not match", () => {
    expect(getLocationUrl("pa")).toBeNull();
  });

  test("returns null for empty string", () => {
    expect(getLocationUrl("")).toBeNull();
  });
});

describe("isKennyStone", () => {
  test("matches exact name", () => {
    expect(isKennyStone("Kenny Stone")).toBe(true);
  });

  test("matches case insensitive", () => {
    expect(isKennyStone("kenny stone")).toBe(true);
    expect(isKennyStone("KENNY STONE")).toBe(true);
    expect(isKennyStone("Kenny stone")).toBe(true);
  });

  test("does not match other names", () => {
    expect(isKennyStone("Andria")).toBe(false);
    expect(isKennyStone("Kenny")).toBe(false);
    expect(isKennyStone("Stone")).toBe(false);
  });
});

describe("canRemoveAttendee", () => {
  test("can remove own entry", () => {
    expect(canRemoveAttendee("Kevin", "Kevin")).toBe(true);
  });

  test("case insensitive match", () => {
    expect(canRemoveAttendee("kevin", "Kevin")).toBe(true);
    expect(canRemoveAttendee("Kevin", "kevin")).toBe(true);
  });

  test("cannot remove someone else", () => {
    expect(canRemoveAttendee("Andria", "Kevin")).toBe(false);
  });

  test("cannot remove without viewer name", () => {
    expect(canRemoveAttendee("Kevin", undefined)).toBe(false);
  });
});

describe("formatDuration", () => {
  test("hours only", () => {
    expect(formatDuration(120)).toBe("2h");
    expect(formatDuration(60)).toBe("1h");
  });

  test("minutes only", () => {
    expect(formatDuration(30)).toBe("30m");
    expect(formatDuration(45)).toBe("45m");
  });

  test("hours and minutes", () => {
    expect(formatDuration(90)).toBe("1h 30m");
    expect(formatDuration(150)).toBe("2h 30m");
  });

  test("zero minutes", () => {
    expect(formatDuration(0)).toBe("0m");
  });
});

describe("gameFullMessage", () => {
  test("player is in game — see you on the court", () => {
    expect(gameFullMessage("Kevin", ["Kenny Stone", "Kevin"]))
      .toBe("Game is full! See you on the court!");
  });

  test("player is NOT in game — see you next time", () => {
    expect(gameFullMessage("Kevin", ["Kenny Stone", "Andria"]))
      .toBe("Game is full! See you next time.");
  });

  test("case insensitive match", () => {
    expect(gameFullMessage("kevin", ["Kenny Stone", "Kevin"]))
      .toBe("Game is full! See you on the court!");
  });

  test("no viewer name — see you next time", () => {
    expect(gameFullMessage(undefined, ["Kenny Stone", "Andria"]))
      .toBe("Game is full! See you next time.");
  });
});

describe("getInviteStatus", () => {
  const attendees = ["Kenny Stone", "Andria"];
  const declined = ["Kevin"];

  test("confirmed if player is in attendees", () => {
    expect(getInviteStatus("Andria", attendees, declined)).toBe("confirmed");
  });

  test("confirmed is case insensitive", () => {
    expect(getInviteStatus("andria", attendees, declined)).toBe("confirmed");
  });

  test("declined if player is in declined list", () => {
    expect(getInviteStatus("Kevin", attendees, declined)).toBe("declined");
  });

  test("declined is case insensitive", () => {
    expect(getInviteStatus("kevin", attendees, declined)).toBe("declined");
  });

  test("pending if player is in neither list", () => {
    expect(getInviteStatus("Sarah", attendees, declined)).toBe("pending");
  });

  test("confirmed takes priority over declined", () => {
    expect(getInviteStatus("Andria", attendees, ["Andria"])).toBe("confirmed");
  });
});

describe("getInviteAction", () => {
  test("confirmed -> Remove", () => {
    expect(getInviteAction("confirmed")).toBe("Remove");
  });

  test("pending -> Confirm", () => {
    expect(getInviteAction("pending")).toBe("Confirm");
  });

  test("declined -> Reset", () => {
    expect(getInviteAction("declined")).toBe("Reset");
  });
});

describe("getRsvpState", () => {
  test("Andria is already in — should see confirmed, not ask", () => {
    expect(getRsvpState("Andria", ["Kenny Stone", "Andria"])).toBe("confirmed");
  });

  test("confirmed player should see leave card, not 'can you make it'", () => {
    // This is the regression test:
    // When Andria is already confirmed, getRsvpState must return "confirmed"
    // so the UI shows "You're confirmed!" with a Leave button,
    // NOT the "can you make it?" prompt
    const state = getRsvpState("Andria", ["Kenny Stone", "Andria"]);
    expect(state).toBe("confirmed");
    expect(state).not.toBe("ask");
  });

  test("case insensitive", () => {
    expect(getRsvpState("andria", ["Kenny Stone", "Andria"])).toBe("confirmed");
  });

  test("player not in attendees — should ask", () => {
    expect(getRsvpState("Kevin", ["Kenny Stone", "Andria"])).toBe("ask");
  });

  test("no player name — should ask", () => {
    expect(getRsvpState(undefined, ["Kenny Stone", "Andria"])).toBe("ask");
  });
});

describe("formatPillText", () => {
  test("assembles full pill string", () => {
    expect(formatPillText("Thursday", "3/19", "2:00-4:00pm", "PA"))
      .toBe("Thursday 3/19 · 2:00-4:00pm @ PA");
  });

  test("works with different locations", () => {
    expect(formatPillText("Saturday", "4/5", "9:00-11:00am", "Riverside Courts"))
      .toBe("Saturday 4/5 · 9:00-11:00am @ Riverside Courts");
  });
});
