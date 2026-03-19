const ADJECTIVES = [
  "dill", "sour", "briny", "crispy", "tangy", "crunchy", "zesty", "spicy",
  "garlicky", "sweet", "kosher", "snappy", "puckered", "pickled", "salty",
  "fizzy", "chunky", "wicked", "cheeky", "sneaky", "slippery", "zippy",
  "sassy", "saucy", "bouncy", "smashing", "spiffy", "nifty", "swanky", "peppy",
];

const PICKLE_NOUNS = [
  "dink", "lob", "smash", "rally", "volley", "serve", "spin", "drop",
  "drive", "banger", "poach", "erne", "kitchen", "paddle", "brine",
  "spear", "sprig", "wedge", "chip", "slice", "crunch", "bump", "flick",
  "twist", "snap", "pop", "punch", "hook", "dill", "pickle",
];

export function generateSlug(): string {
  const sha = Array.from(crypto.getRandomValues(new Uint8Array(3)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]!;
  const noun = PICKLE_NOUNS[Math.floor(Math.random() * PICKLE_NOUNS.length)]!;
  return `${sha}-${adj}-${noun}`;
}
