// ============================================================================
// OSRO Quest Helper - Configuration
// ============================================================================

const VERSION = 119;
const FLAVOR = 'Highrate';

// === DATA SOURCE CONFIGURATION ===

// Auto-import data on page load (disable if you want to manually import)
const AUTO_IMPORT_ON_FIRST_LOAD = true;

const REMOTE_PREFIX = "https://torrq.github.io/osro-quests-hr/data/";
const LOCAL_PREFIX  = `${window.location.origin}/data/`;

function isLocalLikeHost(hostname) {
  return hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname === '::1'
    || hostname.startsWith('10.')
    || /^192\.168\./.test(hostname)
    || /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);
}

const FILES = {
  items:           "osrohr_items.json",
  newItems:        "osrohr_items_new.json",
  values:          "osrohr_item_values.json",
  pointLinks:      "osrohr_point_links.json",
  quests:          "osrohr_quests.json",
  shops:           "osrohr_shops.json",
  icons:           "osrohr_item_icons.json",
  spriteMap:       "osrohr_sprite_map.json",
  itemLists:       "osrohr_item_lists.json",
};

const LOCAL_STORAGE = {
  "config":         "osrohr_config",
  "theme":          "osrohr_theme",
  "autoloot_data":  "osrohr_autoloot_data",
  "autoloot_names": "osrohr_autoloot_names",
  "autoloot_v2":    "osrohr_autoloot_v2",
  "autoloot_vip":   "osrohr_autoloot_vip",
  "item_values":    "osrohr_item_values",
  "lab_data":       "osrohr_lab_data",
  "bookmarks":      "osrohr_bookmarks",
  "lab_gem":        "osrohr_lab_gem_v1",
  "lab_credit":     "osrohr_lab_credit_v1",
  "lab_tracker":    "osrohr_lab_tracker_v1"
};

// Keys synchronized across devices when linked (theme stays per device)
const SYNC_KEYS = [
  LOCAL_STORAGE.config,
  LOCAL_STORAGE.autoloot_data,
  LOCAL_STORAGE.autoloot_names,
  LOCAL_STORAGE.autoloot_v2,
  LOCAL_STORAGE.item_values,
  LOCAL_STORAGE.lab_data,
  LOCAL_STORAGE.bookmarks,
  LOCAL_STORAGE.lab_gem,
  LOCAL_STORAGE.lab_credit,
  LOCAL_STORAGE.lab_tracker
];

// Cloud worker & sync configuration
const CLOUDFLARE_WORKER_URL = window.CLOUDFLARE_WORKER_URL || "https://osro-push-worker.osro-push-worker.workers.dev";
const GOOGLE_CLIENT_ID = window.GOOGLE_CLIENT_ID || ""; // Google OAuth Web Client ID — leave empty to hide Google sign-in

// Top-level const doesn't create window properties, so expose these explicitly
window.CLOUDFLARE_WORKER_URL = CLOUDFLARE_WORKER_URL;
window.GOOGLE_CLIENT_ID      = GOOGLE_CLIENT_ID;
window.SYNC_KEYS             = SYNC_KEYS;
window.LOCAL_STORAGE         = LOCAL_STORAGE;

const USE_LOCAL_SERVER = isLocalLikeHost(window.location.hostname);
const prefix = USE_LOCAL_SERVER ? LOCAL_PREFIX : REMOTE_PREFIX;
const AUTO_IMPORT_URLS = Object.fromEntries(
  Object.entries(FILES).map(([k, f]) => [k, prefix + f])
);

// === VALUE DISPLAY CONSTANTS ===

// Zeny value of 1 Credit (used as fallback if not in item database)
const CREDIT_ZENY_VALUE = 10_000_000;

// In 'mixed' mode, show credits above this threshold (zeny)
const MIXED_CREDIT_THRESHOLD = 10_000_000;

// === SPECIAL ITEM IDS ===

// These items are used as currency in the game
const SPECIAL_ITEMS = {
  CREDIT: 3100,  // Credits
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


// === CURRENCY NAMES ===
// Shared lookup for all requirement types → display labels
const CURRENCY_NAMES = {
  zeny:                    'Zeny',
  credit:                  'Credit',
  gold:                    'Gold',
  vote_points:             'Vote Points',
  activity_points:         'Activity Points',
  instance_points:         'Instance Points',
  hourly_points:           'Hourly Points',
  donate_points:           'Donate Points',
  koe_points:              'KoE Points',
  woe_points:              'WoE Points',
  headgear_points:         'Headgear Points',
  aura_points:             'Aura Points',
  monster_arena_points:    'Monster Arena Points',
  otherworld_points:       'Otherworld Points',
  hall_of_heritage_points: 'Hall of Heritage Points',
  token_points:            'Token Points',
  card_points:             'Card Points',
  event_points:            'Event Points',
};

// === REQUIREMENT / CURRENCY TYPE OPTIONS ===

// Used by both Quests and Shops editors.
const REQ_TYPE_OPTIONS = [
  { value: 'item', label: 'Item' },
  { value: 'zeny', label: 'Zeny' },
  { value: 'gold', label: 'Gold' },
  { value: 'credit', label: 'Credit' },

  { value: 'vote_points', label: 'Vote Points' },
  { value: 'hourly_points', label: 'Hourly Points' },
  { value: 'activity_points', label: 'Activity Points' },
  { value: 'instance_points', label: 'Instance Points' },
  { value: 'donate_points', label: 'Donate Points' },
  { value: 'koe_points', label: 'KoE Points' },
  { value: 'woe_points', label: 'WoE Points' },
  { value: 'headgear_points', label: 'Headgear Points' },
  { value: 'aura_points', label: 'Aura Points' },

  { value: 'monster_arena_points', label: 'Arena Points' },
  { value: 'otherworld_points', label: 'Otherworld Points' },
  { value: 'hall_of_heritage_points', label: 'HoH Points' },
  { value: 'token_points', label: 'Token Points' },
  { value: 'card_points', label: 'Card Points' },
];

// === HELPER FUNCTIONS ===

/**
 * Get the current zeny value of Credits from the items database
 * @returns {number} Zeny value per Credit
 */
function getCreditValue() {
  return DATA.items[SPECIAL_ITEMS.CREDIT]?.value || CREDIT_ZENY_VALUE;
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
