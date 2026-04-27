// ============================================================================
// OSRO Quest Helper - Configuration
// ============================================================================

const VERSION = 117;
const FLAVOR = 'Highrate';

// === DATA SOURCE CONFIGURATION ===

// Toggle between local development server and production GitHub URLs
const USE_LOCAL_SERVER = false; 

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
  { id: 678,   amount: 25,  name: 'Poison Bottle', group: 'Consumable' },
  { id: 7139,  amount: 50,  name: 'Glistening Coat', group: 'Consumable' },
  { id: 607,   amount: 50,  name: 'Yggdrasil Berry', group: 'Consumable' },
  { id: 608,   amount: 50,  name: 'Yggdrasil Seed', group: 'Consumable' },
  { id: 610,   amount: 50,  name: 'Yggdrasil Leaf', group: 'Consumable' },
  { id: 504,   amount: 100, name: 'White Potion', group: 'Consumable' },
  { id: 505,   amount: 100, name: 'Blue Potion', group: 'Consumable' },
  { id: 969,   amount: 100, name: 'Gold', group: 'Consumable' },
  { id: 7444,  amount: 100, name: 'Treasure Box', group: 'Loot' },
  { id: 12028, amount: 50,  name: 'Box of Thunder', group: 'Consumable' },
  { id: 12114, amount: 50,  name: 'Fire Elemental Converter', group: 'Consumable' },
  { id: 12115, amount: 50,  name: 'Water Elemental Converter', group: 'Consumable' },
  { id: 12116, amount: 50,  name: 'Earth Elemental Converter', group: 'Consumable' },
  { id: 12117, amount: 50,  name: 'Wind Elemental Converter', group: 'Consumable' },
  { id: 7035,  amount: 5,   name: 'Matchstick', group: 'Loot' },
  { id: 7289,  amount: 5,   name: 'Peridot', group: 'Loot' },
  { id: 7297,  amount: 5,   name: 'Biotite', group: 'Loot' },
  { id: 4002,  amount: 10,  name: 'Fabre Card', group: 'Card' },
  { id: 4003,  amount: 10,  name: 'Pupa Card', group: 'Card' },
  { id: 4006,  amount: 10,  name: 'Lunatic Card', group: 'Card' },
  { id: 4008,  amount: 10,  name: 'Picky Card', group: 'Card' },
  { id: 4009,  amount: 10,  name: 'Chonchon Card', group: 'Card' },
  { id: 4010,  amount: 10,  name: 'Willow Card', group: 'Card' },
  { id: 4021,  amount: 10,  name: 'Rocker Card', group: 'Card' },
];

const GUILD_CONTRIBUTION_CARD_ART_IDS = [
  4002, 4003, 4006, 4008, 4009, 4010, 4021,
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
