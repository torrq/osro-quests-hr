"""
generate_item_lists.py
----------------------
Regenerates the "Deposit List" and "Unlock List" entries in
data/osrohr_item_lists.json by scanning item descriptions for
known marker strings.

Detection rules (verified against the current dataset, 0 false positives):
  Deposit List  ->  desc contains "Deposit Effect"
  Unlock List   ->  desc contains "Unlock Effect"

All other lists in osrohr_item_lists.json are left untouched.

Usage:
    python helpers/generate_item_lists.py
"""

import json
import pathlib

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
ITEMS_FILE = REPO_ROOT / "data" / "osrohr_items.json"
LISTS_FILE = REPO_ROOT / "data" / "osrohr_item_lists.json"

DEPOSIT_MARKER = "Deposit Effect"
UNLOCK_MARKER  = "Unlock Effect"


def main():
    with open(ITEMS_FILE, "r", encoding="utf-8") as f:
        items: dict = json.load(f)

    with open(LISTS_FILE, "r", encoding="utf-8") as f:
        lists: list = json.load(f)

    # Build the new id lists (sorted numerically for a stable diff)
    deposit_ids = sorted(
        int(id_str)
        for id_str, item in items.items()
        if DEPOSIT_MARKER in item.get("desc", "")
    )
    unlock_ids = sorted(
        int(id_str)
        for id_str, item in items.items()
        if UNLOCK_MARKER in item.get("desc", "")
    )

    # Update in-place so order and other lists are preserved
    updated = {"Deposit List": False, "Unlock List": False}
    for entry in lists:
        if entry["name"] == "Deposit List":
            old = entry["items"]
            entry["items"] = deposit_ids
            updated["Deposit List"] = True
            print(f"Deposit List: {len(old)} -> {len(deposit_ids)} items")
        elif entry["name"] == "Unlock List":
            old = entry["items"]
            entry["items"] = unlock_ids
            updated["Unlock List"] = True
            print(f"Unlock List:  {len(old)} -> {len(unlock_ids)} items")

    for name, ok in updated.items():
        if not ok:
            print(f"WARNING: '{name}' not found in {LISTS_FILE.name} — no changes made for it.")

    with open(LISTS_FILE, "w", encoding="utf-8") as f:
        json.dump(lists, f, indent=2, ensure_ascii=False)

    print(f"\nSaved {LISTS_FILE}")


if __name__ == "__main__":
    main()
