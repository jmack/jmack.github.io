// ---------------------------------------------------------------------------
//  Dewey Decimal → Informational category (fallback path)
// ---------------------------------------------------------------------------

/**
 * Maps Dewey ranges to informational category keys.
 * Each entry is [min, max) — first matching range wins.
 * @type {Array<{ min: number, max: number, key: string }>}
 */
export const DEWEY_RANGES = [
  { min:   0, max: 100, key: "general_computers_records" },
  { min: 100, max: 200, key: "psychology_parapsychology" },
  { min: 200, max: 292, key: "customs_holidays_manners_folktales" },
  { min: 292, max: 293, key: "mythology" },
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
  { min: 550, max: 551, key: "earth_sciences" },
  { min: 551, max: 552, key: "weather_natural_disasters" },
  { min: 552, max: 560, key: "earth_sciences" },
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
  { min: 700, max: 790, key: "arts_crafts_drawing_music" },
  { min: 790, max: 800, key: "sports_games_entertainment" },
  { min: 800, max: 900, key: "poetry_jokes_plays_quotes" },
  { min: 900, max: 910, key: "explorers_atlases" },
  { min: 910, max: 920, key: "explorers_atlases" },
  { min: 920, max: 930, key: "biographies" },
  { min: 930, max: 970, key: "world_history" },
  { min: 970, max: 1000, key: "american_history" },
];

/** Anchor values for nearest-match fallback when Dewey falls outside all ranges. */
export const DEWEY_ANCHORS = {
  general_computers_records:              6,
  chemistry:                            545,
  pets_farm_animals:                    636,
  psychology_parapsychology:            150,
  earth_sciences:                       556,
  weather_natural_disasters:          551.5,
  cooking_sewing_costume:               646,
  mythology:                          292.2,
  fossils_dinosaurs:                    567,
  arts_crafts_drawing_music:            745,
  society_government_work_education:    360,
  life_science_genetics_microorganisms: 576,
  sports_games_entertainment:           796,
  customs_holidays_manners_folktales:   394,
  plants:                               582,
  poetry_jokes_plays_quotes:            808,
  reading_languages_sign_dictionaries:  423,
  insects_animals:                      595,
  explorers_atlases:                    912,
  math:                                 514,
  medicine_health_nutrition_body:       613,
  biographies:                          925,
  astronomy_space:                      523,
  engineering_robots_inventions:        624,
  world_history:                        940,
  physics_sound_heat_electricity_magnets: 537,
  transportation:                       629,
  american_history:                     973,
};

/** @param {number} d  @returns {string} */
export function deweyToInformationalKey(d) {
  if (Number.isFinite(d) && d >= 0 && d < 1000) {
    for (const r of DEWEY_RANGES) {
      if (d >= r.min && d < r.max) return r.key;
    }
  }
  return nearestAnchor(d);
}

/** @param {number} d */
function nearestAnchor(d) {
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

// ---------------------------------------------------------------------------
//  Informational classification (subject-first with Dewey fallback)
// ---------------------------------------------------------------------------

/**
 * Keyword patterns for each informational category.
 * Scored against the combined subject blob + title.
 * @type {Array<[string, RegExp]>}
 */
const INFORMATIONAL_PATTERNS = [
  ["biographies",                         /\b(biograph|autobiograph|who\s*was|who\s*is|life\s*of)\b/i],
  ["weather_natural_disasters",           /\b(weather|hurricane|tornado|earthquake|tsunami|flood|storm|blizzard|natural\s*disaster|meteorolog|severe\s*weather|lightning|drought|cyclone|typhoon)\b/i],
  ["mythology",                           /\b(mytholog|myths?|greek\s*gods?|roman\s*gods?|norse|viking\s*mythol|egyptian\s*(?:god|mythol)|zeus|athena|olympus|hercules|poseidon|hades|apollo|thor|odin|loki|anubis|ra\b)\b/i],
  ["sports_games_entertainment",          /\b(sports?|baseball|basketball|football|soccer|olympics?|athlet|tennis|swimming|gymnast|hockey|wrestling|martial\s*arts|boxing|cricket)\b/i],
  ["astronomy_space",                     /\b(astronomy|planets?|solar\s*system|stars?|moon|nasa|astronaut|galax|universe|cosmos|space\s*explor|rocket|telescope|constellation|asteroid|comet|nebula)\b/i],
  ["fossils_dinosaurs",                   /\b(dinosaur|fossil|paleontolog|prehistoric|extinction|jurassic|triassic|cretaceous|mesozoic|tyrannosaurus|triceratops|pterodactyl)\b/i],
  ["american_history",                    /\b(american\s*history|united\s*states\s*history|american\s*revolution|civil\s*war|presidents?|colonial\s*america|independence|constitution|founding\s*fathers?|westward\s*expansion|declaration\s*of)\b/i],
  ["world_history",                       /\b(world\s*history|medieval|renaissance|world\s*war|civilizat|ancient\s*rome|ancient\s*egypt|ancient\s*greece|empire|dynasty|crusade|ottoman|roman\s*empire|feudal|pharaoh|gladiator|viking)\b/i],
  ["insects_animals",                     /\b(insects?|animals?|wildlife|mammals?|reptiles?|amphibians?|birds?|fish|sharks?|whales?|dolphins?|endangered\s*species|predator|prey|migration|habitat|zoolog)\b/i],
  ["pets_farm_animals",                   /\b(pets?|dogs?|cats?|horses?|hamsters?|rabbits?|farm\s*animals?|veterinar|pet\s*care|kittens?|puppies?|guinea\s*pigs?|goldfish|parrots?)\b/i],
  ["earth_sciences",                      /\b(geology|rocks?|minerals?|volcanos?|volcanoes?|geography|landforms?|soil|tectonic|caves?|mountains?|erosion|crystals?|gemstones?|geolog)\b/i],
  ["engineering_robots_inventions",       /\b(engineering|robots?|inventions?|inventors?|machines?|technolog|robotics|coding|programming|3d\s*print|mechanis|blueprint|prototype|patent)\b/i],
  ["medicine_health_nutrition_body",      /\b(medicine|health|nutrition|human\s*body|anatomy|diseases?|exercise|fitness|hygiene|skeleton|muscles?|digest|immune|vitamins?|organs?|surgery|doctor|nurse|first\s*aid)\b/i],
  ["arts_crafts_drawing_music",           /\b(art\b|drawing|painting|crafts?|music|musical\s*instruments?|sculpture|dance|origami|photography|theater|theatre|ballet|orchestra|compose|artist|gallery|museum)\b/i],
  ["chemistry",                           /\b(chemistry|chemical|elements?|periodic\s*table|atoms?|molecules?|reactions?|compound|solution|acid|base|laboratory)\b/i],
  ["physics_sound_heat_electricity_magnets", /\b(physics|electricity|magnets?|magnetism|sound|light|energy|heat|forces?|gravity|motion|waves?|friction|optics|circuit|voltage|newton)\b/i],
  ["math",                                /\b(mathematics|math\b|algebra|geometry|numbers?|fractions?|multiplication|probability|statistics|equations?|calcul|arithmetic|decimal)\b/i],
  ["plants",                              /\b(plants?|trees?|flowers?|gardening|botany|seeds?|photosynthesis|forests?|rainforest|ferns?|cactus|cacti|moss|pollen|roots?|leaves|botanical)\b/i],
  ["life_science_genetics_microorganisms", /\b(biology|genetics|cells?|microorganisms?|bacteria|viruses?|dna|evolution|ecosystems?|habitats?|biome|organism|photosynthesis|mitosis|chromosome)\b/i],
  ["cooking_sewing_costume",              /\b(cooking|recipes?|baking|sewing|fashion|costume|clothing|food\b|chef|cuisine|ingredients?|kitchen|dessert|knitting)\b/i],
  ["customs_holidays_manners_folktales",  /\b(holidays?|christmas|halloween|thanksgiving|traditions?|customs?|manners|etiquette|folklore|folktales?|celebrations?|easter|hanukkah|kwanzaa|diwali|ramadan|festival)\b/i],
  ["psychology_parapsychology",           /\b(psychology|dreams?|feelings?|emotions?|mind\b|brain\b|illusions?|optical\s*illusion|senses?|perception|self[- ]esteem|anxiety|mental\s*health|mindfulness)\b/i],
  ["reading_languages_sign_dictionaries", /\b(reading|languages?|sign\s*language|dictionar|vocabulary|grammar|writing|braille|alphabet|linguistics|bilingual|translator|hieroglyph)\b/i],
  ["society_government_work_education",   /\b(government|politics|jobs?|careers?|education|law\b|economics|community|democracy|voting|citizenship|president|congress|senate|rights|justice|civil\s*rights)\b/i],
  ["transportation",                      /\b(transportation|vehicles?|cars?|trucks?|trains?|airplanes?|boats?|ships?|submarines?|helicopters?|motorcycles?|locomotive|aviation|automobile|ferry|spacecraft)\b/i],
  ["explorers_atlases",                   /\b(explorers?|exploration|atlas|maps?|cartograph|discovery|navigation|voyages?|geography|expedition|navigator|compass|circumnavigat)\b/i],
  ["general_computers_records",           /\b(computers?|world\s*records?|guinness|internet|software|magazines?|encyclopedia|almanac|reference|database)\b/i],
  ["poetry_jokes_plays_quotes",           /\b(poetry|poems?|jokes?|riddles?|plays?\b|drama\b|quotes?|tongue\s*twisters?|limericks?|rhymes?|haiku|sonnets?|playwright)\b/i],
];

const INFORMATIONAL_TIE_PRIORITY = [
  "biographies",
  "mythology",
  "weather_natural_disasters",
  "fossils_dinosaurs",
  "astronomy_space",
  "sports_games_entertainment",
  "american_history",
  "world_history",
  "pets_farm_animals",
  "insects_animals",
  "earth_sciences",
  "engineering_robots_inventions",
  "medicine_health_nutrition_body",
  "chemistry",
  "physics_sound_heat_electricity_magnets",
  "math",
  "plants",
  "life_science_genetics_microorganisms",
  "arts_crafts_drawing_music",
  "cooking_sewing_costume",
  "customs_holidays_manners_folktales",
  "psychology_parapsychology",
  "reading_languages_sign_dictionaries",
  "society_government_work_education",
  "transportation",
  "explorers_atlases",
  "poetry_jokes_plays_quotes",
  "general_computers_records",
];

// -- Priority checks --

/** Check for DDC shorthand "B" or standalone "92" indicating biography. */
function hasBiographyDdc(edition, work) {
  for (const src of [edition, work]) {
    if (!src?.dewey_decimal_class) continue;
    const ddc = Array.isArray(src.dewey_decimal_class)
      ? src.dewey_decimal_class
      : [src.dewey_decimal_class];
    for (const raw of ddc) {
      const u = String(raw).trim().toUpperCase();
      if (u === "B" || u === "BIO" || /^92\b/.test(u)) return true;
    }
  }
  return false;
}

function collectPeopleBlob(edition, work) {
  const parts = [];
  for (const src of [edition, work]) {
    if (!src?.subject_people) continue;
    for (const p of src.subject_people) {
      if (typeof p === "string") parts.push(p);
      else if (p && typeof p.name === "string") parts.push(p.name);
    }
  }
  return parts.join(" | ");
}

function checkPriorityPatterns(blob, edition, work) {
  const hasPeople = collectPeopleBlob(edition, work).length > 0;
  const bioDdc = hasBiographyDdc(edition, work);
  const bioKeywords = /\b(biograph|autobiograph|who\s*was|who\s*is|life\s*of)\b/i.test(blob);
  if (hasPeople || bioDdc || bioKeywords) return "biographies";

  if (/\b(mytholog|myths?)\b/i.test(blob) && /\b(greek|roman|norse|egyptian|viking|olymp|zeus|athena|thor|odin|anubis|hercules|poseidon|hades|apollo|loki)\b/i.test(blob)) {
    return "mythology";
  }

  return null;
}

// -- Scoring --

function scoreInformationalCategories(blob) {
  const scores = {};
  for (const [key, re] of INFORMATIONAL_PATTERNS) {
    const m = blob.match(new RegExp(re.source, "gi"));
    if (m) scores[key] = m.length;
  }

  let best = null;
  let bestN = 0;
  for (const k of INFORMATIONAL_TIE_PRIORITY) {
    const n = scores[k] ?? 0;
    if (n > bestN) { bestN = n; best = k; }
  }
  return best;
}

/**
 * Classify a nonfiction book into one of the 28 informational categories.
 * Uses subject keywords first, falls back to Dewey.
 *
 * @param {object} edition
 * @param {object|null} work
 * @returns {string|null} Category key, or null if unclassifiable.
 */
export function classifyInformational(edition, work) {
  const subjects = collectSubjectBlob(edition, work);
  const title = String(edition.title || work?.title || "").toLowerCase();
  const people = collectPeopleBlob(edition, work);
  const blob = `${subjects} ${title} ${people}`.toLowerCase();

  const priority = checkPriorityPatterns(blob, edition, work);
  if (priority) return priority;

  const scored = scoreInformationalCategories(blob);
  if (scored) return scored;

  const dewey = parsePrimaryDewey(edition, work);
  if (dewey !== null) return deweyToInformationalKey(dewey);

  return null;
}

// ---------------------------------------------------------------------------
//  Fiction genre classification
// ---------------------------------------------------------------------------

/**
 * @param {string} blob  Lowercased (subject + title) text
 * @returns {string}     Fiction category key
 */
export function mapFictionGenre(blob) {
  const earlyMatch = matchEarlyRules(blob);
  if (earlyMatch) return earlyMatch;

  const spyMystery = matchSpyMystery(blob);
  if (spyMystery) return spyMystery;

  if (/\bfriendship\b/i.test(blob)) {
    const scored = scoreBroadGenres(blob);
    if (scored !== "realistic_fiction") return scored;
    return /\b(humor|humour|funny|comedy|jokes)\b/i.test(blob)
      ? "humor"
      : "realistic_fiction";
  }

  if (/\b(short\s*stories|antholog)\b/i.test(blob)) {
    return scoreAnthology(blob);
  }

  return scoreBroadGenres(blob);
}

// -- Early-exit rules (order matters) --

/** @type {Array<[RegExp, string, RegExp?]>} pattern → key, optional exclusion */
const EARLY_RULES = [
  [/\b(graphic\s*novel|comic\s*books?|manga|bande\s*dessinée)\b/i,       "graphic_novels_comics"],
  [/\bhorror\b|\bghosts?\b|\bhaunted\b|\bscary\b/i,                      "spooky",          /\bnon-?horror\b/i],
  [/\b(thriller|suspense|crime)\b/i,                                      "mystery"],
  [/\bwestern\b|\bcowboys?\b/i,                                          "adventure"],
  [/\bmagical\s*realism\b/i,                                             "fantasy"],
  [/\bsteampunk\b/i,                                                     "science_fiction"],
  [/\b(par|super)natural\b/i,                                            "spooky",          /\bhorror\b/i],
  [/\burban\s*fantasy\b/i,                                               "fantasy"],
  [/\b(school\s*stories|slice\s*of\s*life|coming\s*of\s*age)\b/i,        "realistic_fiction"],
  [/\b(tall\s*tales?|legends?)\b/i,                                      "traditional_literature", /\b(nonfiction|mythology\s*books?)\b/i],
  [/\b(inspirational|religious\s*fiction|christian\s*fiction)\b/i,         "realistic_fiction"],
  [/\btime\s*travel\b/i,                                                 "science_fiction"],
  [/\b(superhero|superheroes)\b/i,                                       "science_fiction"],
  [/\b(detective|private\s*investigator|\bPI\b)\b/i,                     "mystery"],
  [/\b(wilderness|survival)\b/i,                                         "adventure"],
];

function matchEarlyRules(blob) {
  for (const [pattern, key, exclude] of EARLY_RULES) {
    if (pattern.test(blob) && !(exclude?.test(blob))) return key;
  }
  return null;
}

// -- Spy / mystery disambiguation --

function matchSpyMystery(blob) {
  const spy     = /\b(espionage|spy|cia|mi6|secret\s*agent)\b/i.test(blob);
  const mystery = /\b(murder|homicide|noir|police\s*procedural)\b/i.test(blob);
  if (!spy && !mystery) return null;
  if (mystery && !spy) return "mystery";
  if (spy && !mystery) return "adventure";
  return /\b(murder|detective)\b/i.test(blob) ? "mystery" : "adventure";
}

// -- Broad genre scoring --

/** @type {Array<[string, RegExp]>} */
const GENRE_PATTERNS = [
  ["science_fiction",       /\b(science\s*fiction|sci[- ]?fi|space\s*opera|dystop|alien|outer\s*space|robots?)\b/i],
  ["historical_fiction",    /\b(historical\s*fiction)\b/i],
  ["fantasy",               /\b(fantasy|dragons?|wizards?|magic(?!\s*realism))\b/i],
  ["fairy_tale",            /\b(fairy\s*tales?)\b/i],
  ["myth",                  /\b(mythology|myths?|greek\s*gods?|roman\s*gods?)\b/i],
  ["mystery",               /\b(mystery|detective|whodunit)\b/i],
  ["adventure",             /\b(adventure|quests?|treasure)\b/i],
  ["humor",                 /\b(humor|humour|funny|comedy)\b/i],
  ["romance",               /\b(romance|love\s*stories)\b/i],
  ["dystopian",             /\b(dystopia)\b/i],
  ["spooky",                /\b(spooky|creepy)\b/i],
  ["animals",               /\b(animals?|pets?|dogs?|cats?)\b/i],
  ["sports",                /\b(sports?|basketball|football|soccer|baseball)\b/i],
  ["drama",                 /\b(drama|theater|theatre)\b/i],
  ["poetry",                /\b(poetry|poems?|verses?)\b/i],
  ["biography",             /\b(biography|biographical)\b/i],
  ["memoir",                /\b(memoir)\b/i],
  ["classic",               /\b(classics?|classic\s*literature)\b/i],
  ["traditional_literature", /\b(folklore|fables|legends?)\b/i],
  ["realistic_fiction",     /\b(realistic\s*fiction|contemporary\s*fiction)\b/i],
];

const TIE_PRIORITY = [
  "graphic_novels_comics", "science_fiction", "fantasy", "mystery",
  "historical_fiction", "adventure", "humor", "spooky", "dystopian",
  "romance", "animals", "sports", "drama", "poetry", "biography",
  "memoir", "classic", "fairy_tale", "myth", "traditional_literature",
  "realistic_fiction",
];

function scoreBroadGenres(blob) {
  const scores = {};
  for (const [key, re] of GENRE_PATTERNS) {
    const m = blob.match(new RegExp(re.source, "gi"));
    if (m) scores[key] = m.length;
  }

  let best = "realistic_fiction";
  let bestN = 0;
  for (const k of TIE_PRIORITY) {
    const n = scores[k] ?? 0;
    if (n > bestN) { bestN = n; best = k; }
  }

  if (bestN === 0 && /\b(juvenile\s*fiction|children'?s\s*fiction|fiction)\b/i.test(blob)) {
    return "realistic_fiction";
  }
  return best;
}

// -- Anthology sub-scoring --

/** @type {Array<[string, RegExp]>} */
const ANTHOLOGY_PATTERNS = [
  ["mystery",            /\b(detective|mystery|crime|thriller|noir)\b/i],
  ["fantasy",            /\b(fantasy|magic|dragon|wizard|fairy)\b/i],
  ["science_fiction",    /\b(science\s*fiction|sci[- ]?fi|space|alien|robot)\b/i],
  ["humor",              /\b(humor|humour|funny|comedy)\b/i],
  ["adventure",          /\b(adventure|survival|quest)\b/i],
  ["historical_fiction", /\b(historical)\b/i],
  ["spooky",             /\b(horror|ghost|scary)\b/i],
  ["realistic_fiction",  /\b(realistic|contemporary)\b/i],
];

function scoreAnthology(blob) {
  let best = "traditional_literature";
  let bestN = 0;
  for (const [key, re] of ANTHOLOGY_PATTERNS) {
    const m = blob.match(new RegExp(re.source, "gi"));
    const n = m ? m.length : 0;
    if (n > bestN) { bestN = n; best = key; }
  }
  return best;
}

// ---------------------------------------------------------------------------
//  Fiction vs non-fiction classification
// ---------------------------------------------------------------------------

/** @returns {"fiction" | "nonfiction"} */
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
      if (/\b(fiction|novels?|stories|juvenile fiction|tales)\b/i.test(combined)) return "fiction";
      return "nonfiction";
    }
  }

  if (/\bjuvenile\s*fiction\b|\bfiction\b|\bnovels?\b|\bshort\s*stories\b|\bfairy\s*tales?\b|\bfantasy\b/i.test(combined)) {
    return "fiction";
  }

  return "nonfiction";
}

// ---------------------------------------------------------------------------
//  Subject / Dewey extraction
// ---------------------------------------------------------------------------

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

export function parsePrimaryDewey(edition, work) {
  return firstNumericDewey(collectDeweyStrings(edition, work));
}
