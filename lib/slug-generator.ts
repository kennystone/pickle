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

const ANIMALS = [
  "otter", "bunny", "capybara", "hedgehog", "quokka", "axolotl", "wombat",
  "marmot", "chinchilla", "fennec", "lemur", "narwhal", "pangolin", "pika",
  "dormouse", "jerboa", "numbat", "kinkajou", "loris", "bilby", "meerkat",
  "stoat", "vole", "shrew", "hamster", "gerbil", "ferret", "puffin",
  "penguin", "corgi", "duckling", "gosling", "lamb", "cub", "piglet",
];

export function generateSlug(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]!;
  const noun = PICKLE_NOUNS[Math.floor(Math.random() * PICKLE_NOUNS.length)]!;
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]!;
  return `${adj}-${noun}-${animal}`;
}
