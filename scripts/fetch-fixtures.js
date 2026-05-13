#!/usr/bin/env node

import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------------------------------------------------------------------
//  Book list — search by title+author (far more reliable than guessing ISBNs)
//  expectedCategory is the HUMAN-DETERMINED correct answer.
// ---------------------------------------------------------------------------

const BOOKS = [
  // =======================================================================
  //  FICTION
  // =======================================================================

  // -- graphic_novels_comics --
  { title: "Dog Man", author: "Dav Pilkey", expectedBranch: "fiction", expectedCategory: "graphic_novels_comics", note: "4th" },
  { title: "Amulet The Stonekeeper", author: "Kazu Kibuishi", expectedBranch: "fiction", expectedCategory: "graphic_novels_comics", note: "4th" },
  { title: "Smile", author: "Raina Telgemeier", expectedBranch: "fiction", expectedCategory: "graphic_novels_comics", note: "5th" },
  { title: "El Deafo", author: "Cece Bell", expectedBranch: "fiction", expectedCategory: "graphic_novels_comics", note: "5th" },

  // -- realistic_fiction --
  { title: "Because of Winn-Dixie", author: "Kate DiCamillo", expectedBranch: "fiction", expectedCategory: "realistic_fiction", note: "4th" },
  { title: "Tales of a Fourth Grade Nothing", author: "Judy Blume", expectedBranch: "fiction", expectedCategory: "realistic_fiction", note: "4th" },
  { title: "Wonder", author: "R.J. Palacio", expectedBranch: "fiction", expectedCategory: "realistic_fiction", note: "5th" },
  { title: "Ramona Quimby Age 8", author: "Beverly Cleary", expectedBranch: "fiction", expectedCategory: "realistic_fiction", note: "3rd" },

  // -- science_fiction --
  { title: "The Wild Robot", author: "Peter Brown", expectedBranch: "fiction", expectedCategory: "science_fiction", note: "4th" },
  { title: "Space Case", author: "Stuart Gibbs", expectedBranch: "fiction", expectedCategory: "science_fiction", note: "4th" },
  { title: "A Wrinkle in Time", author: "Madeleine L'Engle", expectedBranch: "fiction", expectedCategory: "science_fiction", note: "6th" },
  { title: "The City of Ember", author: "Jeanne DuPrau", expectedBranch: "fiction", expectedCategory: "science_fiction", note: "5th" },

  // -- historical_fiction --
  { title: "Number the Stars", author: "Lois Lowry", expectedBranch: "fiction", expectedCategory: "historical_fiction", note: "4th" },
  { title: "Little House on the Prairie", author: "Laura Ingalls Wilder", expectedBranch: "fiction", expectedCategory: "historical_fiction", note: "4th" },
  { title: "Esperanza Rising", author: "Pam Muñoz Ryan", expectedBranch: "fiction", expectedCategory: "historical_fiction", note: "5th" },
  { title: "Sarah Plain and Tall", author: "Patricia MacLachlan", expectedBranch: "fiction", expectedCategory: "historical_fiction", note: "3rd" },

  // -- fantasy --
  { title: "The Lion the Witch and the Wardrobe", author: "C.S. Lewis", expectedBranch: "fiction", expectedCategory: "fantasy", note: "4th" },
  { title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", expectedBranch: "fiction", expectedCategory: "fantasy", note: "5th" },
  { title: "Dinosaurs Before Dark", author: "Mary Pope Osborne", expectedBranch: "fiction", expectedCategory: "fantasy", note: "2nd" },
  { title: "The Lightning Thief", author: "Rick Riordan", expectedBranch: "fiction", expectedCategory: "fantasy", note: "5th" },

  // -- fairy_tale --
  { title: "Ella Enchanted", author: "Gail Carson Levine", expectedBranch: "fiction", expectedCategory: "fairy_tale", note: "4th" },
  { title: "Lon Po Po", author: "Ed Young", expectedBranch: "fiction", expectedCategory: "fairy_tale", note: "2nd" },
  { title: "The Princess and the Goblin", author: "George MacDonald", expectedBranch: "fiction", expectedCategory: "fairy_tale", note: "5th" },
  { title: "The Frog Prince Continued", author: "Jon Scieszka", expectedBranch: "fiction", expectedCategory: "fairy_tale", note: "3rd" },

  // -- traditional_literature --
  { title: "Anansi the Spider", author: "Gerald McDermott", expectedBranch: "fiction", expectedCategory: "traditional_literature", note: "2nd" },
  { title: "The People Could Fly", author: "Virginia Hamilton", expectedBranch: "fiction", expectedCategory: "traditional_literature", note: "4th" },
  { title: "John Henry", author: "Julius Lester", expectedBranch: "fiction", expectedCategory: "traditional_literature", note: "3rd" },
  { title: "Coyote A Trickster Tale", author: "Gerald McDermott", expectedBranch: "fiction", expectedCategory: "traditional_literature", note: "2nd" },

  // -- myth (fiction retellings) --
  { title: "Black Ships Before Troy", author: "Rosemary Sutcliff", expectedBranch: "fiction", expectedCategory: "myth", note: "6th" },
  { title: "Percy Jackson's Greek Gods", author: "Rick Riordan", expectedBranch: "fiction", expectedCategory: "myth", note: "5th" },
  { title: "Favorite Greek Myths", author: "Mary Pope Osborne", expectedBranch: "fiction", expectedCategory: "myth", note: "4th" },
  { title: "The Wanderings of Odysseus", author: "Rosemary Sutcliff", expectedBranch: "fiction", expectedCategory: "myth", note: "6th" },

  // -- mystery --
  { title: "From the Mixed-Up Files of Mrs. Basil E. Frankweiler", author: "E.L. Konigsburg", expectedBranch: "fiction", expectedCategory: "mystery", note: "4th" },
  { title: "Nate the Great", author: "Marjorie Weinman Sharmat", expectedBranch: "fiction", expectedCategory: "mystery", note: "2nd" },
  { title: "Chasing Vermeer", author: "Blue Balliett", expectedBranch: "fiction", expectedCategory: "mystery", note: "5th" },
  { title: "The Westing Game", author: "Ellen Raskin", expectedBranch: "fiction", expectedCategory: "mystery", note: "5th" },

  // -- adventure --
  { title: "Hatchet", author: "Gary Paulsen", expectedBranch: "fiction", expectedCategory: "adventure", note: "5th" },
  { title: "My Side of the Mountain", author: "Jean Craighead George", expectedBranch: "fiction", expectedCategory: "adventure", note: "4th" },
  { title: "Island of the Blue Dolphins", author: "Scott O'Dell", expectedBranch: "fiction", expectedCategory: "adventure", note: "4th" },
  { title: "Holes", author: "Louis Sachar", expectedBranch: "fiction", expectedCategory: "adventure", note: "5th" },

  // -- humor --
  { title: "Diary of a Wimpy Kid", author: "Jeff Kinney", expectedBranch: "fiction", expectedCategory: "humor", note: "4th" },
  { title: "Captain Underpants", author: "Dav Pilkey", expectedBranch: "fiction", expectedCategory: "humor", note: "3rd" },
  { title: "Sideways Stories from Wayside School", author: "Louis Sachar", expectedBranch: "fiction", expectedCategory: "humor", note: "4th" },
  { title: "Junie B. Jones and the Stupid Smelly Bus", author: "Barbara Park", expectedBranch: "fiction", expectedCategory: "humor", note: "2nd" },

  // -- romance --
  { title: "Flipped", author: "Wendelin Van Draanen", expectedBranch: "fiction", expectedCategory: "romance", note: "6th" },
  { title: "Love Stargirl", author: "Jerry Spinelli", expectedBranch: "fiction", expectedCategory: "romance", note: "6th" },

  // -- dystopian --
  { title: "The Giver", author: "Lois Lowry", expectedBranch: "fiction", expectedCategory: "dystopian", note: "5th" },
  { title: "Among the Hidden", author: "Margaret Peterson Haddix", expectedBranch: "fiction", expectedCategory: "dystopian", note: "4th" },
  { title: "The Hunger Games", author: "Suzanne Collins", expectedBranch: "fiction", expectedCategory: "dystopian", note: "6th" },
  { title: "Gathering Blue", author: "Lois Lowry", expectedBranch: "fiction", expectedCategory: "dystopian", note: "5th" },

  // -- spooky --
  { title: "Welcome to Dead House", author: "R.L. Stine", expectedBranch: "fiction", expectedCategory: "spooky", note: "4th" },
  { title: "Scary Stories to Tell in the Dark", author: "Alvin Schwartz", expectedBranch: "fiction", expectedCategory: "spooky", note: "4th" },
  { title: "The Graveyard Book", author: "Neil Gaiman", expectedBranch: "fiction", expectedCategory: "spooky", note: "5th" },
  { title: "Bunnicula", author: "James Howe", expectedBranch: "fiction", expectedCategory: "spooky", note: "3rd" },

  // -- animals (fiction) --
  { title: "Charlotte's Web", author: "E.B. White", expectedBranch: "fiction", expectedCategory: "animals", note: "4th" },
  { title: "The One and Only Ivan", author: "Katherine Applegate", expectedBranch: "fiction", expectedCategory: "animals", note: "4th" },
  { title: "Shiloh", author: "Phyllis Reynolds Naylor", expectedBranch: "fiction", expectedCategory: "animals", note: "4th" },
  { title: "The Cricket in Times Square", author: "George Selden", expectedBranch: "fiction", expectedCategory: "animals", note: "3rd" },

  // -- sports (fiction) --
  { title: "Ghost", author: "Jason Reynolds", expectedBranch: "fiction", expectedCategory: "sports", note: "5th" },
  { title: "Heat", author: "Mike Lupica", expectedBranch: "fiction", expectedCategory: "sports", note: "4th" },
  { title: "The Crossover", author: "Kwame Alexander", expectedBranch: "fiction", expectedCategory: "sports", note: "5th" },
  { title: "Travel Team", author: "Mike Lupica", expectedBranch: "fiction", expectedCategory: "sports", note: "4th" },

  // -- drama (fiction — books about theater/performance) --
  { title: "The Shakespeare Stealer", author: "Gary Blackwood", expectedBranch: "fiction", expectedCategory: "drama", note: "5th" },
  { title: "Onstage and Backstage", author: "Lisa Fiedler", expectedBranch: "fiction", expectedCategory: "drama", note: "4th" },

  // -- poetry (fiction — verse novels) --
  { title: "Love That Dog", author: "Sharon Creech", expectedBranch: "fiction", expectedCategory: "poetry", note: "4th" },
  { title: "Locomotion", author: "Jacqueline Woodson", expectedBranch: "fiction", expectedCategory: "poetry", note: "4th" },
  { title: "Inside Out and Back Again", author: "Thanhha Lai", expectedBranch: "fiction", expectedCategory: "poetry", note: "5th" },
  { title: "Hate That Cat", author: "Sharon Creech", expectedBranch: "fiction", expectedCategory: "poetry", note: "4th" },

  // -- biography (fiction — fictionalized biographical accounts) --
  { title: "The Dreamer", author: "Pam Muñoz Ryan", expectedBranch: "fiction", expectedCategory: "biography", note: "5th" },
  { title: "26 Fairmount Avenue", author: "Tomie dePaola", expectedBranch: "fiction", expectedCategory: "biography", note: "2nd" },

  // -- memoir (fiction — autobiographical novels) --
  { title: "The Absolutely True Diary of a Part-Time Indian", author: "Sherman Alexie", expectedBranch: "fiction", expectedCategory: "memoir", note: "6th" },
  { title: "Knots in My Yo-Yo String", author: "Jerry Spinelli", expectedBranch: "fiction", expectedCategory: "memoir", note: "4th" },

  // -- classic --
  { title: "The Secret Garden", author: "Frances Hodgson Burnett", expectedBranch: "fiction", expectedCategory: "classic", note: "4th" },
  { title: "A Little Princess", author: "Frances Hodgson Burnett", expectedBranch: "fiction", expectedCategory: "classic", note: "4th" },
  { title: "Heidi", author: "Johanna Spyri", expectedBranch: "fiction", expectedCategory: "classic", note: "4th" },
  { title: "Stuart Little", author: "E.B. White", expectedBranch: "fiction", expectedCategory: "classic", note: "3rd" },

  // =======================================================================
  //  INFORMATIONAL (NONFICTION)
  // =======================================================================

  // -- general_computers_records --
  { title: "Coding Games in Scratch", author: "Jon Woodcock", expectedBranch: "nonfiction", expectedCategory: "general_computers_records", note: "4th" },
  { title: "Hello Ruby Adventures in Coding", author: "Linda Liukas", expectedBranch: "nonfiction", expectedCategory: "general_computers_records", note: "2nd" },
  { title: "Guinness World Records", author: "", expectedBranch: "nonfiction", expectedCategory: "general_computers_records", note: "4th" },
  { title: "DK Eyewitness Computer", author: "", expectedBranch: "nonfiction", expectedCategory: "general_computers_records", note: "5th" },

  // -- chemistry --
  { title: "DK Eyewitness Chemistry", author: "", expectedBranch: "nonfiction", expectedCategory: "chemistry", note: "5th" },
  { title: "Candy Experiments", author: "Loralee Leavitt", expectedBranch: "nonfiction", expectedCategory: "chemistry", note: "4th" },
  { title: "Basher Science Chemistry", author: "Simon Basher", expectedBranch: "nonfiction", expectedCategory: "chemistry", note: "4th" },
  { title: "What Is the World Made Of?", author: "Kathleen Zoehfeld", expectedBranch: "nonfiction", expectedCategory: "chemistry", note: "2nd" },

  // -- pets_farm_animals --
  { title: "DK Eyewitness Dog", author: "", expectedBranch: "nonfiction", expectedCategory: "pets_farm_animals", note: "4th" },
  { title: "DK Eyewitness Cat", author: "", expectedBranch: "nonfiction", expectedCategory: "pets_farm_animals", note: "4th" },
  { title: "DK Eyewitness Horse", author: "", expectedBranch: "nonfiction", expectedCategory: "pets_farm_animals", note: "5th" },
  { title: "National Geographic Readers Cats vs Dogs", author: "Elizabeth Carney", expectedBranch: "nonfiction", expectedCategory: "pets_farm_animals", note: "2nd" },

  // -- psychology_parapsychology --
  { title: "Your Fantastic Elastic Brain", author: "JoAnn Deak", expectedBranch: "nonfiction", expectedCategory: "psychology_parapsychology", note: "2nd" },
  { title: "What to Do When You Worry Too Much", author: "Dawn Huebner", expectedBranch: "nonfiction", expectedCategory: "psychology_parapsychology", note: "4th" },
  { title: "My Many Colored Days", author: "Dr. Seuss", expectedBranch: "nonfiction", expectedCategory: "psychology_parapsychology", note: "2nd" },
  { title: "A Little SPOT of Emotion", author: "Diane Alber", expectedBranch: "nonfiction", expectedCategory: "psychology_parapsychology", note: "2nd" },

  // -- earth_sciences --
  { title: "DK Eyewitness Rocks and Minerals", author: "", expectedBranch: "nonfiction", expectedCategory: "earth_sciences", note: "4th" },
  { title: "DK Eyewitness Volcano and Earthquake", author: "", expectedBranch: "nonfiction", expectedCategory: "earth_sciences", note: "4th" },
  { title: "National Geographic Readers Volcanoes", author: "Anne Schreiber", expectedBranch: "nonfiction", expectedCategory: "earth_sciences", note: "3rd" },
  { title: "Rocks and Minerals", author: "Kathleen Zoehfeld", expectedBranch: "nonfiction", expectedCategory: "earth_sciences", note: "2nd" },

  // -- weather_natural_disasters --
  { title: "DK Eyewitness Weather", author: "", expectedBranch: "nonfiction", expectedCategory: "weather_natural_disasters", note: "4th" },
  { title: "Flash Crash Rumble and Roll", author: "Franklyn Branley", expectedBranch: "nonfiction", expectedCategory: "weather_natural_disasters", note: "2nd" },
  { title: "Hurricanes", author: "Seymour Simon", expectedBranch: "nonfiction", expectedCategory: "weather_natural_disasters", note: "4th" },
  { title: "National Geographic Readers Hurricanes", author: "", expectedBranch: "nonfiction", expectedCategory: "weather_natural_disasters", note: "3rd" },

  // -- cooking_sewing_costume --
  { title: "The Complete Cookbook for Young Chefs", author: "", expectedBranch: "nonfiction", expectedCategory: "cooking_sewing_costume", note: "4th" },
  { title: "Kid Chef", author: "Eliza Cross", expectedBranch: "nonfiction", expectedCategory: "cooking_sewing_costume", note: "4th" },
  { title: "DK Eyewitness Costume", author: "", expectedBranch: "nonfiction", expectedCategory: "cooking_sewing_costume", note: "5th" },
  { title: "Pretend Soup", author: "Mollie Katzen", expectedBranch: "nonfiction", expectedCategory: "cooking_sewing_costume", note: "2nd" },

  // -- mythology (informational — reference/encyclopedia about myths) --
  { title: "D'Aulaires Book of Greek Myths", author: "Ingri d'Aulaire", expectedBranch: "nonfiction", expectedCategory: "mythology", note: "4th" },
  { title: "Treasury of Greek Mythology", author: "Donna Jo Napoli", expectedBranch: "nonfiction", expectedCategory: "mythology", note: "4th" },
  { title: "Treasury of Egyptian Mythology", author: "Donna Jo Napoli", expectedBranch: "nonfiction", expectedCategory: "mythology", note: "5th" },
  { title: "Treasury of Norse Mythology", author: "Donna Jo Napoli", expectedBranch: "nonfiction", expectedCategory: "mythology", note: "5th" },

  // -- fossils_dinosaurs --
  { title: "DK Eyewitness Dinosaur", author: "", expectedBranch: "nonfiction", expectedCategory: "fossils_dinosaurs", note: "4th" },
  { title: "DK Eyewitness Fossil", author: "", expectedBranch: "nonfiction", expectedCategory: "fossils_dinosaurs", note: "4th" },
  { title: "National Geographic Little Kids First Big Book of Dinosaurs", author: "Catherine Hughes", expectedBranch: "nonfiction", expectedCategory: "fossils_dinosaurs", note: "2nd" },
  { title: "Dinosaurs", author: "Gail Gibbons", expectedBranch: "nonfiction", expectedCategory: "fossils_dinosaurs", note: "2nd" },

  // -- arts_crafts_drawing_music --
  { title: "Ed Emberley's Drawing Book", author: "Ed Emberley", expectedBranch: "nonfiction", expectedCategory: "arts_crafts_drawing_music", note: "2nd" },
  { title: "DK Eyewitness Music", author: "", expectedBranch: "nonfiction", expectedCategory: "arts_crafts_drawing_music", note: "4th" },
  { title: "DK Eyewitness Art", author: "", expectedBranch: "nonfiction", expectedCategory: "arts_crafts_drawing_music", note: "5th" },
  { title: "How to Draw", author: "Mark Linley", expectedBranch: "nonfiction", expectedCategory: "arts_crafts_drawing_music", note: "4th" },

  // -- society_government_work_education --
  { title: "What Is the Constitution", author: "Patricia Brennan Demuth", expectedBranch: "nonfiction", expectedCategory: "society_government_work_education", note: "4th" },
  { title: "What Are the Three Branches of Government", author: "", expectedBranch: "nonfiction", expectedCategory: "society_government_work_education", note: "4th" },
  { title: "We the Kids", author: "David Catrow", expectedBranch: "nonfiction", expectedCategory: "society_government_work_education", note: "3rd" },
  { title: "If You Were a Kid During the Civil Rights Movement", author: "", expectedBranch: "nonfiction", expectedCategory: "society_government_work_education", note: "3rd" },

  // -- life_science_genetics_microorganisms --
  { title: "DK Eyewitness Life", author: "", expectedBranch: "nonfiction", expectedCategory: "life_science_genetics_microorganisms", note: "4th" },
  { title: "Tiny Creatures The World of Microbes", author: "Nicola Davies", expectedBranch: "nonfiction", expectedCategory: "life_science_genetics_microorganisms", note: "2nd" },
  { title: "Germs Germs Germs", author: "Bobbi Katz", expectedBranch: "nonfiction", expectedCategory: "life_science_genetics_microorganisms", note: "2nd" },
  { title: "Cells Are Us", author: "Fran Balkwill", expectedBranch: "nonfiction", expectedCategory: "life_science_genetics_microorganisms", note: "4th" },

  // -- sports_games_entertainment --
  { title: "DK Eyewitness Sport", author: "", expectedBranch: "nonfiction", expectedCategory: "sports_games_entertainment", note: "4th" },
  { title: "National Geographic Kids Everything Sports", author: "", expectedBranch: "nonfiction", expectedCategory: "sports_games_entertainment", note: "4th" },
  { title: "G Is for Gold Medal", author: "Brad Herzog", expectedBranch: "nonfiction", expectedCategory: "sports_games_entertainment", note: "3rd" },
  { title: "DK Eyewitness Olympics", author: "", expectedBranch: "nonfiction", expectedCategory: "sports_games_entertainment", note: "4th" },

  // -- customs_holidays_manners_folktales --
  { title: "Celebrate Halloween", author: "Deborah Heiligman", expectedBranch: "nonfiction", expectedCategory: "customs_holidays_manners_folktales", note: "3rd" },
  { title: "Celebrate Thanksgiving", author: "Deborah Heiligman", expectedBranch: "nonfiction", expectedCategory: "customs_holidays_manners_folktales", note: "3rd" },
  { title: "Children Just Like Me Celebrations", author: "", expectedBranch: "nonfiction", expectedCategory: "customs_holidays_manners_folktales", note: "4th" },
  { title: "The Story of Kwanzaa", author: "Donna Washington", expectedBranch: "nonfiction", expectedCategory: "customs_holidays_manners_folktales", note: "3rd" },

  // -- plants --
  { title: "DK Eyewitness Plant", author: "", expectedBranch: "nonfiction", expectedCategory: "plants", note: "4th" },
  { title: "DK Eyewitness Tree", author: "", expectedBranch: "nonfiction", expectedCategory: "plants", note: "4th" },
  { title: "From Seed to Plant", author: "Gail Gibbons", expectedBranch: "nonfiction", expectedCategory: "plants", note: "2nd" },
  { title: "The Tiny Seed", author: "Eric Carle", expectedBranch: "nonfiction", expectedCategory: "plants", note: "2nd" },

  // -- poetry_jokes_plays_quotes (informational) --
  { title: "Where the Sidewalk Ends", author: "Shel Silverstein", expectedBranch: "nonfiction", expectedCategory: "poetry_jokes_plays_quotes", note: "4th" },
  { title: "A Light in the Attic", author: "Shel Silverstein", expectedBranch: "nonfiction", expectedCategory: "poetry_jokes_plays_quotes", note: "4th" },
  { title: "Falling Up", author: "Shel Silverstein", expectedBranch: "nonfiction", expectedCategory: "poetry_jokes_plays_quotes", note: "3rd" },
  { title: "Poetry for Young People Robert Frost", author: "", expectedBranch: "nonfiction", expectedCategory: "poetry_jokes_plays_quotes", note: "5th" },

  // -- reading_languages_sign_dictionaries --
  { title: "DK Children's Illustrated Dictionary", author: "", expectedBranch: "nonfiction", expectedCategory: "reading_languages_sign_dictionaries", note: "3rd" },
  { title: "Scholastic Children's Dictionary", author: "", expectedBranch: "nonfiction", expectedCategory: "reading_languages_sign_dictionaries", note: "4th" },
  { title: "My First Book of Sign Language", author: "", expectedBranch: "nonfiction", expectedCategory: "reading_languages_sign_dictionaries", note: "2nd" },
  { title: "DK First Dictionary", author: "", expectedBranch: "nonfiction", expectedCategory: "reading_languages_sign_dictionaries", note: "2nd" },

  // -- insects_animals (informational) --
  { title: "DK Eyewitness Insect", author: "", expectedBranch: "nonfiction", expectedCategory: "insects_animals", note: "4th" },
  { title: "DK Eyewitness Shark", author: "", expectedBranch: "nonfiction", expectedCategory: "insects_animals", note: "4th" },
  { title: "National Geographic Animal Encyclopedia", author: "", expectedBranch: "nonfiction", expectedCategory: "insects_animals", note: "4th" },
  { title: "DK Eyewitness Bird", author: "", expectedBranch: "nonfiction", expectedCategory: "insects_animals", note: "4th" },

  // -- explorers_atlases --
  { title: "National Geographic Kids World Atlas", author: "", expectedBranch: "nonfiction", expectedCategory: "explorers_atlases", note: "4th" },
  { title: "DK Student Atlas", author: "", expectedBranch: "nonfiction", expectedCategory: "explorers_atlases", note: "4th" },
  { title: "DK Eyewitness Explorer", author: "", expectedBranch: "nonfiction", expectedCategory: "explorers_atlases", note: "4th" },
  { title: "Maps", author: "Aleksandra Mizielinska", expectedBranch: "nonfiction", expectedCategory: "explorers_atlases", note: "3rd" },

  // -- math --
  { title: "G Is for Googol", author: "David Schwartz", expectedBranch: "nonfiction", expectedCategory: "math", note: "4th" },
  { title: "Millions to Measure", author: "David Schwartz", expectedBranch: "nonfiction", expectedCategory: "math", note: "3rd" },
  { title: "How Much Is a Million", author: "David Schwartz", expectedBranch: "nonfiction", expectedCategory: "math", note: "2nd" },
  { title: "Sir Cumference and the First Round Table", author: "Cindy Neuschwander", expectedBranch: "nonfiction", expectedCategory: "math", note: "4th" },

  // -- medicine_health_nutrition_body --
  { title: "DK Eyewitness Human Body", author: "", expectedBranch: "nonfiction", expectedCategory: "medicine_health_nutrition_body", note: "4th" },
  { title: "Germs Make Me Sick", author: "Melvin Berger", expectedBranch: "nonfiction", expectedCategory: "medicine_health_nutrition_body", note: "2nd" },
  { title: "The Human Body", author: "Seymour Simon", expectedBranch: "nonfiction", expectedCategory: "medicine_health_nutrition_body", note: "4th" },
  { title: "DK Eyewitness Skeleton", author: "", expectedBranch: "nonfiction", expectedCategory: "medicine_health_nutrition_body", note: "4th" },

  // -- biographies (informational) --
  { title: "Who Was Abraham Lincoln", author: "Janet Pascal", expectedBranch: "nonfiction", expectedCategory: "biographies", note: "4th" },
  { title: "Who Was Martin Luther King Jr", author: "Bonnie Bader", expectedBranch: "nonfiction", expectedCategory: "biographies", note: "4th" },
  { title: "Brown Girl Dreaming", author: "Jacqueline Woodson", expectedBranch: "nonfiction", expectedCategory: "biographies", note: "5th" },
  { title: "I Am Malala Young Readers Edition", author: "Malala Yousafzai", expectedBranch: "nonfiction", expectedCategory: "biographies", note: "5th" },

  // -- astronomy_space --
  { title: "DK Eyewitness Space Exploration", author: "", expectedBranch: "nonfiction", expectedCategory: "astronomy_space", note: "4th" },
  { title: "DK Eyewitness Astronomy", author: "", expectedBranch: "nonfiction", expectedCategory: "astronomy_space", note: "4th" },
  { title: "National Geographic Planets", author: "Elizabeth Carney", expectedBranch: "nonfiction", expectedCategory: "astronomy_space", note: "3rd" },
  { title: "The Sun", author: "Seymour Simon", expectedBranch: "nonfiction", expectedCategory: "astronomy_space", note: "3rd" },

  // -- engineering_robots_inventions --
  { title: "DK Eyewitness Invention", author: "", expectedBranch: "nonfiction", expectedCategory: "engineering_robots_inventions", note: "4th" },
  { title: "National Geographic Everything Robotics", author: "", expectedBranch: "nonfiction", expectedCategory: "engineering_robots_inventions", note: "4th" },
  { title: "DK Eyewitness Robot", author: "", expectedBranch: "nonfiction", expectedCategory: "engineering_robots_inventions", note: "4th" },
  { title: "125 Cool Inventions", author: "", expectedBranch: "nonfiction", expectedCategory: "engineering_robots_inventions", note: "4th" },

  // -- world_history --
  { title: "DK Eyewitness Ancient Egypt", author: "", expectedBranch: "nonfiction", expectedCategory: "world_history", note: "4th" },
  { title: "DK Eyewitness Ancient Rome", author: "", expectedBranch: "nonfiction", expectedCategory: "world_history", note: "4th" },
  { title: "DK Eyewitness Aztec Inca Maya", author: "", expectedBranch: "nonfiction", expectedCategory: "world_history", note: "4th" },
  { title: "Mummies Made in Egypt", author: "Aliki", expectedBranch: "nonfiction", expectedCategory: "world_history", note: "3rd" },

  // -- physics_sound_heat_electricity_magnets --
  { title: "DK Eyewitness Energy", author: "", expectedBranch: "nonfiction", expectedCategory: "physics_sound_heat_electricity_magnets", note: "4th" },
  { title: "DK Eyewitness Electricity", author: "", expectedBranch: "nonfiction", expectedCategory: "physics_sound_heat_electricity_magnets", note: "4th" },
  { title: "What Makes a Magnet", author: "Franklyn Branley", expectedBranch: "nonfiction", expectedCategory: "physics_sound_heat_electricity_magnets", note: "2nd" },
  { title: "Switch On Switch Off", author: "Melvin Berger", expectedBranch: "nonfiction", expectedCategory: "physics_sound_heat_electricity_magnets", note: "2nd" },

  // -- transportation --
  { title: "DK Eyewitness Train", author: "", expectedBranch: "nonfiction", expectedCategory: "transportation", note: "4th" },
  { title: "DK Eyewitness Boat", author: "", expectedBranch: "nonfiction", expectedCategory: "transportation", note: "4th" },
  { title: "National Geographic Readers Planes", author: "", expectedBranch: "nonfiction", expectedCategory: "transportation", note: "2nd" },
  { title: "Trucks Trucks Trucks", author: "Peter Sis", expectedBranch: "nonfiction", expectedCategory: "transportation", note: "2nd" },

  // -- american_history --
  { title: "If You Lived at the Time of the American Revolution", author: "Kay Moore", expectedBranch: "nonfiction", expectedCategory: "american_history", note: "4th" },
  { title: "DK Eyewitness American Revolution", author: "", expectedBranch: "nonfiction", expectedCategory: "american_history", note: "4th" },
  { title: "What Was the Boston Tea Party", author: "Kathleen Krull", expectedBranch: "nonfiction", expectedCategory: "american_history", note: "4th" },
  { title: "Who Was Robert E. Lee", author: "Bonnie Bader", expectedBranch: "nonfiction", expectedCategory: "american_history", note: "4th" },
];

// ---------------------------------------------------------------------------
//  Fetcher — searches by title+author, then fetches edition+work data
// ---------------------------------------------------------------------------

const RELEVANT_EDITION_FIELDS = [
  "title", "subjects", "dewey_decimal_class", "subject_people", "works",
];
const RELEVANT_WORK_FIELDS = [
  "title", "subjects", "dewey_decimal_class", "subject_people",
  "subject_times", "subject_places",
];

function pick(obj, fields) {
  if (!obj) return null;
  const out = {};
  for (const f of fields) {
    if (f in obj) out[f] = obj[f];
  }
  return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function searchAndFetch(title, author) {
  const params = new URLSearchParams({
    title,
    limit: "5",
    fields: "key,title,isbn,edition_key",
  });
  if (author) params.set("author", author);

  const search = await fetchJson(
    `https://openlibrary.org/search.json?${params}`,
  );
  if (!search.docs?.length) throw new Error("No search results");

  const doc = search.docs.find((d) => d.isbn?.length) ?? search.docs[0];
  const isbn = doc.isbn?.[0];

  let edition;
  if (isbn) {
    await sleep(150);
    edition = await fetchJson(`https://openlibrary.org/isbn/${isbn}.json`);
  } else if (doc.edition_key?.length) {
    await sleep(150);
    edition = await fetchJson(
      `https://openlibrary.org/books/${doc.edition_key[0]}.json`,
    );
  } else {
    throw new Error("No ISBN or edition key in search results");
  }

  let work = null;
  const workKey = edition.works?.[0]?.key ?? doc.key;
  if (workKey) {
    await sleep(150);
    try {
      const url = workKey.startsWith("/works/")
        ? `https://openlibrary.org${workKey}.json`
        : `https://openlibrary.org/works/${workKey}.json`;
      work = await fetchJson(url);
    } catch { /* work data is optional */ }
  }

  return {
    isbn: isbn ?? doc.edition_key?.[0] ?? "unknown",
    resolvedTitle: edition.title,
    edition: pick(edition, RELEVANT_EDITION_FIELDS),
    work: pick(work, RELEVANT_WORK_FIELDS),
  };
}

async function main() {
  const fixtures = [];
  let ok = 0;
  let fail = 0;
  const failures = [];

  for (let i = 0; i < BOOKS.length; i++) {
    const book = BOOKS[i];
    const tag = `[${String(i + 1).padStart(3)}/${BOOKS.length}]`;

    try {
      const result = await searchAndFetch(book.title, book.author);
      fixtures.push({
        isbn: result.isbn,
        expectedBranch: book.expectedBranch,
        expectedCategory: book.expectedCategory,
        note: book.note,
        searchTitle: book.title,
        edition: result.edition,
        work: result.work,
      });
      console.log(`${tag} ✓ "${result.resolvedTitle}" [${book.expectedCategory}]`);
      ok++;
    } catch (err) {
      console.error(
        `${tag} ✗ "${book.title}" — ${err.message}`,
      );
      failures.push({ title: book.title, error: err.message });
      fail++;
    }

    await sleep(250);
  }

  const outDir = join(__dirname, "..", "tests");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    join(outDir, "fixtures.json"),
    JSON.stringify(fixtures, null, 2),
  );

  console.log(`\n${"=".repeat(60)}`);
  console.log(
    `Done: ${ok} fetched, ${fail} failed, ${fixtures.length} fixtures written`,
  );
  if (failures.length) {
    console.log(`\nFailed searches:`);
    for (const f of failures) {
      console.log(`  "${f.title}" — ${f.error}`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
