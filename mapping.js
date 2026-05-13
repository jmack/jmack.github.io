/**
 * Dewey → informational category key (27). First matching range wins; use [min, max) in Dewey float space.
 * @type {Array<{ min: number, max: number, key: string }>}
 */
export const DEWEY_RANGES = [
  { min: 0, max: 100, key: "general_computers_records" },
  { min: 100, max: 200, key: "psychology_parapsychology" },
  { min: 200, max: 292, key: "customs_holidays_manners_folktales" },
  { min: 292, max: 293, key: "greek_roman_mythology" },
  { min: 293, max: 300, key: "customs_holidays_manners_folktales" },
  { min: 300, max: 380, key: "society_government_work_education" },
  { min: 380, max: 390, key: "transportation" },
  { min: 390, max: 400, key: "customs_holidays_manners_folktales" },
  { min: 400, max: 500, key: "reading_languages_sign_dictionaries" },
  { min: 500, max: 510, key: "earth_sciences" },
  { min: 510, max: 520, key: "math" },
  { min: 520, max: 530, key: "astronomy_space" },
  { min: 530, max: 540, key: "physics_sound_heat_electricity_magnets" },
  { min: 540, max: 550, key: "chemistry" },
  { min: 550, max: 560, key: "earth_sciences" },
  { min: 560, max: 570, key: "fossils_dinosaurs" },
  { min: 570, max: 580, key: "life_science_genetics_microorganisms" },
  { min: 580, max: 590, key: "plants" },
  { min: 590, max: 600, key: "insects_animals" },
  { min: 600, max: 610, key: "engineering_robots_inventions" },
  { min: 610, max: 620, key: "medicine_health_nutrition_body" },
  { min: 620, max: 630, key: "engineering_robots_inventions" },
  { min: 630, max: 640, key: "pets_farm_animals" },
  { min: 640, max: 650, key: "cooking_sewing_costume" },
  { min: 650, max: 660, key: "society_government_work_education" },
  { min: 660, max: 670, key: "chemistry" },
  { min: 670, max: 700, key: "engineering_robots_inventions" },
  { min: 700, max: 800, key: "arts_crafts_drawing_music" },
  { min: 800, max: 900, key: "poetry_jokes_plays_quotes" },
  { min: 900, max: 910, key: "explorers_atlases" },
  { min: 910, max: 920, key: "explorers_atlases" },
  { min: 920, max: 930, key: "biographies" },
  { min: 930, max: 970, key: "ancient_world_history_wars" },
  { min: 970, max: 1000, key: "american_history" },
];

/** Representative Dewey used when `d` is not inside any range (should be rare). */
export const DEWEY_ANCHORS = {
  general_computers_records: 6,
  chemistry: 545,
  pets_farm_animals: 636,
  psychology_parapsychology: 150,
  earth_sciences: 556,
  cooking_sewing_costume: 646,
  greek_roman_mythology: 292.2,
  fossils_dinosaurs: 567,
  arts_crafts_drawing_music: 745,
  society_government_work_education: 360,
  life_science_genetics_microorganisms: 576,
  sports_games_entertainment: 796,
  customs_holidays_manners_folktales: 394,
  plants: 582,
  poetry_jokes_plays_quotes: 808,
  reading_languages_sign_dictionaries: 423,
  insects_animals: 595,
  explorers_atlases: 912,
  math: 514,
  medicine_health_nutrition_body: 613,
  biographies: 925,
  astronomy_space: 523,
  engineering_robots_inventions: 624,
  ancient_world_history_wars: 940,
  physics_sound_heat_electricity_magnets: 537,
  transportation: 629,
  american_history: 973,
};

/**
 * @param {number} d
 * @returns {string}
 */
export function deweyToInformationalKey(d) {
  if (!Number.isFinite(d) || d < 0 || d >= 1000) {
    return nearestInformationalKey(d);
  }
  for (const r of DEWEY_RANGES) {
    if (d >= r.min && d < r.max) return r.key;
  }
  return nearestInformationalKey(d);
}

/**
 * @param {number} d
 * @returns {string}
 */
function nearestInformationalKey(d) {
  let bestKey = "general_computers_records";
  let bestDist = Infinity;
  for (const [key, anchor] of Object.entries(DEWEY_ANCHORS)) {
    const dist = Math.abs(d - anchor);
    if (dist < bestDist || (dist === bestDist && key < bestKey)) {
      bestDist = dist;
      bestKey = key;
    }
  }
  return bestKey;
}

/**
 * @param {string} blob Lowercased subject + title text
 * @returns {string} fiction category key
 */
export function mapFictionGenre(blob) {
  if (/\b(graphic\s*novel|comic\s*books?|manga|bande\s*dessinée)\b/i.test(blob)) {
    return "graphic_novels_comics";
  }
  if (/\bhorror\b|\bghosts?\b|\bhaunted\b|\bscary\b/i.test(blob) && !/\bnon-?horror\b/i.test(blob)) {
    return "spooky";
  }
  if (/\b(thriller|suspense|crime)\b/i.test(blob)) {
    return "mystery";
  }
  if (/\bwestern\b|\bcowboys?\b/i.test(blob)) {
    return "adventure";
  }
  if (/\bmagical\s*realism\b/i.test(blob)) {
    return "fantasy";
  }
  if (/\bsteampunk\b/i.test(blob)) {
    return "science_fiction";
  }
  if (/\b(par|super)natural\b/i.test(blob) && !/\bhorror\b/i.test(blob)) {
    return "spooky";
  }
  if (/\burban\s*fantasy\b/i.test(blob)) {
    return "fantasy";
  }
  if (/\b(school\s*stories|slice\s*of\s*life|coming\s*of\s*age)\b/i.test(blob)) {
    return "realistic_fiction";
  }
  if (/\b(tall\s*tales?|legends?)\b/i.test(blob) && !/\b(nonfiction|mythology\s*books?)\b/i.test(blob)) {
    return "traditional_literature";
  }
  if (/\b(inspirational|religious\s*fiction|christian\s*fiction)\b/i.test(blob)) {
    return "realistic_fiction";
  }
  if (/\btime\s*travel\b/i.test(blob)) {
    return "science_fiction";
  }
  if (/\b(superhero|superheroes)\b/i.test(blob)) {
    return "science_fiction";
  }
  if (/\b(detective|private\s*investigator|\bPI\b)\b/i.test(blob)) {
    return "mystery";
  }
  if (/\b(wilderness|survival)\b/i.test(blob)) {
    return "adventure";
  }

  const spyHints = /\b(espionage|spy|cia|mi6|secret\s*agent)\b/i.test(blob);
  const mysteryHints = /\b(murder|homicide|noir|police\s*procedural)\b/i.test(blob);
  if (spyHints || mysteryHints) {
    if (mysteryHints && !spyHints) return "mystery";
    if (spyHints && !mysteryHints) return "adventure";
    if (mysteryHints && spyHints) return /\b(murder|detective)\b/i.test(blob) ? "mystery" : "adventure";
  }

  if (/\bfriendship\b/i.test(blob)) {
    if (/\b(humor|humour|funny|comedy|jokes)\b/i.test(blob)) return "humor";
    return "realistic_fiction";
  }

  if (/\b(short\s*stories|antholog)\b/i.test(blob)) {
    return scoreAnthologyGenre(blob);
  }

  const scores = {
    science_fiction: score(blob, /\b(science\s*fiction|sci[- ]?fi|space\s*opera|dystop|alien|outer\s*space|robots?)\b/i),
    historical_fiction: score(blob, /\b(historical\s*fiction)\b/i),
    fantasy: score(blob, /\b(fantasy|dragons?|wizards?|magic(?!\s*realism))\b/i),
    fairy_tale: score(blob, /\b(fairy\s*tales?)\b/i),
    myth: score(blob, /\b(mythology|myths?|greek\s*gods?|roman\s*gods?)\b/i),
    mystery: score(blob, /\b(mystery|detective|whodunit)\b/i),
    adventure: score(blob, /\b(adventure|quests?|treasure)\b/i),
    humor: score(blob, /\b(humor|humour|funny|comedy)\b/i),
    romance: score(blob, /\b(romance|love\s*stories)\b/i),
    dystopian: score(blob, /\b(dystopia)\b/i),
    spooky: score(blob, /\b(spooky|creepy)\b/i),
    animals: score(blob, /\b(animals?|pets?|dogs?|cats?)\b/i),
    sports: score(blob, /\b(sports?|basketball|football|soccer|baseball)\b/i),
    drama: score(blob, /\b(drama|theater|theatre)\b/i),
    poetry: score(blob, /\b(poetry|poems?|verses?)\b/i),
    biography: score(blob, /\b(biography|biographical)\b/i),
    memoir: score(blob, /\b(memoir)\b/i),
    classic: score(blob, /\b(classics?|classic\s*literature)\b/i),
    traditional_literature: score(blob, /\b(folklore|fables|legends?)\b/i),
    realistic_fiction: score(blob, /\b(realistic\s*fiction|contemporary\s*fiction)\b/i),
  };

  let best = "realistic_fiction";
  let bestN = 0;
  const tieOrder = [
    "graphic_novels_comics",
    "science_fiction",
    "fantasy",
    "mystery",
    "historical_fiction",
    "adventure",
    "humor",
    "spooky",
    "dystopian",
    "romance",
    "animals",
    "sports",
    "drama",
    "poetry",
    "biography",
    "memoir",
    "classic",
    "fairy_tale",
    "myth",
    "traditional_literature",
    "realistic_fiction",
  ];
  for (const k of tieOrder) {
    const n = scores[k] ?? 0;
    if (n > bestN) {
      bestN = n;
      best = k;
    }
  }
  if (bestN === 0 && /\b(juvenile\s*fiction|children'?s\s*fiction|fiction)\b/i.test(blob)) {
    return "realistic_fiction";
  }
  return best;
}

/**
 * @param {string} blob
 * @param {RegExp} re
 */
function score(blob, re) {
  const m = blob.match(re);
  return m ? m.length : 0;
}

/**
 * @param {string} blob
 */
function scoreAnthologyGenre(blob) {
  /** @type {Array<[string, RegExp]>} */
  const checks = [
    ["mystery", /\b(detective|mystery|crime|thriller|noir)\b/i],
    ["fantasy", /\b(fantasy|magic|dragon|wizard|fairy)\b/i],
    ["science_fiction", /\b(science\s*fiction|sci[- ]?fi|space|alien|robot)\b/i],
    ["humor", /\b(humor|humour|funny|comedy)\b/i],
    ["adventure", /\b(adventure|survival|quest)\b/i],
    ["historical_fiction", /\b(historical)\b/i],
    ["spooky", /\b(horror|ghost|scary)\b/i],
    ["realistic_fiction", /\b(realistic|contemporary)\b/i],
  ];
  let best = "traditional_literature";
  let bestN = 0;
  for (const [k, re] of checks) {
    const n = score(blob, re);
    if (n > bestN) {
      bestN = n;
      best = k;
    }
  }
  return best;
}

/**
 * @param {object} edition
 * @param {object|null} work
 * @returns {"fiction"|"nonfiction"}
 */
export function classifyFictionNonfiction(edition, work) {
  const subjects = collectSubjectBlob(edition, work);
  const blob = subjects.toLowerCase();
  const title = String(edition.title || work?.title || "").toLowerCase();
  const combined = `${blob} ${title}`;

  if (/\bjuvenile\s*nonfiction\b|\bnonfiction\b|\bjuvenile\s*non-fiction\b/i.test(combined)) {
    if (!/\bjuvenile\s*fiction\b/i.test(combined)) return "nonfiction";
  }

  const deweyStrs = collectDeweyStrings(edition, work);
  for (const raw of deweyStrs) {
    const u = String(raw).trim().toUpperCase();
    if (/^F(IC)?$/.test(u) || u === "E") return "fiction";
  }

  const n = firstNumericDewey(deweyStrs);
  if (n !== null) {
    if (n >= 92 && n < 93) return "nonfiction";
    if (n < 800 || n >= 900) return "nonfiction";
    if (n >= 800 && n < 900) {
      if (/\b(fiction|novels?|stories|juvenile fiction|tales)\b/i.test(combined)) {
        return "fiction";
      }
      if (/\b(criticism|literary history|authorship|poetics|biography)\b/i.test(combined)) {
        return "nonfiction";
      }
      return "nonfiction";
    }
  }

  if (/\bjuvenile\s*fiction\b|\bfiction\b|\bnovels?\b|\bshort\s*stories\b|\bfairy\s*tales?\b|\bfantasy\b/i.test(combined)) {
    return "fiction";
  }

  return "nonfiction";
}

/**
 * @param {object} edition
 * @param {object|null} work
 */
export function collectSubjectBlob(edition, work) {
  const parts = [];
  for (const src of [edition, work]) {
    if (!src?.subjects) continue;
    for (const s of src.subjects) {
      if (typeof s === "string") parts.push(s);
      else if (s && typeof s.name === "string") parts.push(s.name);
    }
  }
  return parts.join(" | ");
}

/**
 * @param {object} edition
 * @param {object|null} work
 * @returns {string[]}
 */
function collectDeweyStrings(edition, work) {
  const out = [];
  for (const src of [edition, work]) {
    if (!src?.dewey_decimal_class) continue;
    const ddc = src.dewey_decimal_class;
    if (Array.isArray(ddc)) out.push(...ddc.map(String));
    else out.push(String(ddc));
  }
  return out;
}

/**
 * @param {string[]} deweyStrs
 * @returns {number|null}
 */
function firstNumericDewey(deweyStrs) {
  for (const raw of deweyStrs) {
    const m = String(raw).trim().match(/^(\d+(?:\.\d+)?)/);
    if (m) {
      const v = parseFloat(m[1]);
      if (Number.isFinite(v)) return v;
    }
  }
  return null;
}

/**
 * @param {object} edition
 * @param {object|null} work
 * @returns {number|null}
 */
export function parsePrimaryDewey(edition, work) {
  return firstNumericDewey(collectDeweyStrings(edition, work));
}
