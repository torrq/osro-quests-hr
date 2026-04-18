// ============================================================================
// OSRO Quest Helper - Configuration
// ============================================================================

const VERSION = 115;
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