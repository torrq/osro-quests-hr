// ============================================================================
// OSRO Quest Helper - Configuration
// ============================================================================

const VERSION = 115;
const FLAVOR = 'Highrate';

// === DATA SOURCE CONFIGURATION ===

// Toggle between local development server and production GitHub URLs
const USE_LOCAL_SERVER = true; 

// Auto-import data on page load (disable if you want to manually import)
const AUTO_IMPORT_ON_FIRST_LOAD = true;

const REMOTE_PREFIX = "https://torrq.github.io/osro-quests-hr/data/";
const LOCAL_PREFIX  = "http://10.0.0.20:9080/data/";

const FILES = {
  items:           "osrohr_items.json",
  newItems:        "osrohr_items_new.json",
  values:          "osrohr_item_values.json",
  quests:          "osrohr_quests.json",
  shops:           "osrohr_shops.json",
  icons:           "osrohr_item_icons.json",
  searchIndexName: "osrohr_search_index_name.json",
  searchIndexDesc: "osrohr_search_index_desc.json",
  spriteMap:       "osrohr_sprite_map.json",
};

const LOCAL_STORAGE = {
  "config": "osrohr_config",
  "theme": "osrohr_theme",
  "autoloot_data": "osrohr_autoloot_data",
  "autoloot_names": "osrohr_autoloot_names",
  "item_values":   "osrohr_item_values"
};

const prefix = USE_LOCAL_SERVER ? LOCAL_PREFIX : REMOTE_PREFIX;
const AUTO_IMPORT_URLS = Object.fromEntries(
  Object.entries(FILES).map(([k, f]) => [k, prefix + f])
);

// === SPECIAL ITEM IDS ===

// These items are used as currency in the game
const SPECIAL_ITEMS = {
  CREDIT: 40001,  // Credits
  GOLD: 969,      // Gold
};

const GUILD_CONTRIBUTION_ITEMS = [
  { id: 678,   amount: 25,  name: 'Poison Bottle' },
  { id: 7139,  amount: 50,  name: 'Glistening Coat' },
  { id: 607,   amount: 50,  name: 'Yggdrasil Berry' },
  { id: 608,   amount: 50,  name: 'Yggdrasil Seed' },
  { id: 610,   amount: 50,  name: 'Yggdrasil Leaf' },
  { id: 504,   amount: 100, name: 'White Potion' },
  { id: 505,   amount: 100, name: 'Blue Potion' },
  { id: 969,   amount: 100, name: 'Gold' },
  { id: 7444,  amount: 100, name: 'Treasure Box' },
  { id: 12028, amount: 50,  name: 'Box of Thunder' },
  { id: 12114, amount: 50,  name: 'Fire Elemental Converter' },
  { id: 12115, amount: 50,  name: 'Water Elemental Converter' },
  { id: 12116, amount: 50,  name: 'Earth Elemental Converter' },
  { id: 12117, amount: 50,  name: 'Wind Elemental Converter' },
  { id: 7035,  amount: 5,   name: 'Matchstick' },
  { id: 7289,  amount: 5,   name: 'Peridot' },
  { id: 7297,  amount: 5,   name: 'Biotite' },
  { id: 4002,  amount: 10,  name: 'Fabre Card' },
  { id: 4003,  amount: 10,  name: 'Pupa Card' },
  { id: 4006,  amount: 10,  name: 'Lunatic Card' },
  { id: 4008,  amount: 10,  name: 'Picky Card' },
  { id: 4009,  amount: 10,  name: 'Chonchon Card' },
  { id: 4010,  amount: 10,  name: 'Willow Card' },
  { id: 4021,  amount: 10,  name: 'Rocker Card' },
];

// === HELPER FUNCTIONS ===

/**
 * Get the current zeny value of Credits from the items database
 * @returns {number} Zeny value per Credit
 */
function getCreditValue() {
  return DATA.items[SPECIAL_ITEMS.CREDIT]?.value || 0;
}

/**
 * Get the current zeny value of Gold from the items database
 * @returns {number} Zeny value per Gold
 */
function getGoldValue() {
  return DATA.items[SPECIAL_ITEMS.GOLD]?.value || 0;
}

// === DEVELOPMENT MODE ===

// Log configuration on load (useful for debugging)
if (typeof console !== 'undefined') {
  console.log('[Config] Data source:', USE_LOCAL_SERVER ? 'LOCAL' : 'REMOTE');
  console.log('[Config] Auto-import:', AUTO_IMPORT_ON_FIRST_LOAD ? 'ENABLED' : 'DISABLED');
}
