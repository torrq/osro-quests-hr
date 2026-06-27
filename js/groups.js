// groups.js - Group and Subgroup Management Logic

let groupsTabMode = 'quests'; // 'quests' or 'shops'

function renderGroupsListCore() {
  const container = document.getElementById("groupsList");
  
  if (!container) {
    console.warn('[renderGroupsList] Container element not found');
    return;
  }

  let html = `
    <div class="groups-tab-selector">
      <button class="btn ${groupsTabMode === 'quests' ? 'btn-primary' : ''}" onclick="setGroupsTabMode('quests')">Quest Groups</button>
      <button class="btn ${groupsTabMode === 'shops' ? 'btn-primary' : ''}" onclick="setGroupsTabMode('shops')">Shop Groups</button>
    </div>
  `;

  const groups = groupsTabMode === 'quests' ? DATA.groups : DATA.shopGroups;

  if (!Array.isArray(groups)) {
    console.warn('[renderGroupsList] Groups data is not an array');
    container.innerHTML = html + `<div class="empty-msg-centered">No data loaded.</div>`;
    return;
  }

  groups.forEach((group, groupIdx) => {
    if (!group) return;
    
    const isSelected = state.selectedGroupForEdit === groupIdx;
    const subgroupCount = Array.isArray(group.subgroups) ? group.subgroups.length : 0;
    
    html += `
      <div class="group-edit-item ${isSelected ? "active" : ""}" onclick="selectGroupForEdit(${groupIdx})">
        <div class="group-edit-header">
          <div class="group-edit-name-container">
            <span class="group-edit-name">${group.name || 'Unnamed Group'}</span>
            ${group.caption ? `<span class="group-edit-caption">${group.caption}</span>` : ""}
          </div>
          <span class="group-edit-count">${subgroupCount} sub</span>
        </div>
      </div>
    `;
  });

  if (groups.length === 0) {
    const entityType = groupsTabMode === 'quests' ? 'quest' : 'shop';
    html += `<div class="empty-msg-centered">No ${entityType} groups yet. Click "+ Group" to create one.</div>`;
  }

  container.innerHTML = html;
}

function selectGroupForEdit(idx) {
  state.selectedGroupForEdit = idx;
  renderGroupsList();
  renderGroupContent();
}

function renderGroupContentCore() {
  const container = document.getElementById("mainContent");
  
  if (!container) {
    console.warn('[renderGroupContent] Container element not found');
    return;
  }

  if (state.selectedGroupForEdit === null) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>No Group Selected</h2>
        <p>Select a group from the sidebar to edit</p>
      </div>
    `;
    return;
  }

  const groups = groupsTabMode === 'quests' ? DATA.groups : DATA.shopGroups;
  const groupIdx = state.selectedGroupForEdit;
  const group = groups[groupIdx];

  if (!group) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>Group Not Found</h2>
        <p>The selected group no longer exists.</p>
      </div>
    `;
    return;
  }

  const entityType = groupsTabMode === 'quests' ? 'Quest' : 'Shop';
  const itemsKey = groupsTabMode === 'quests' ? 'quests' : 'shops';

  let html = `
    <div class="editor-group">
      <div class="group-edit-top">
        <h2>Edit ${entityType} Group</h2>
        <button class="btn btn-danger" onclick="deleteGroup(${groupIdx})">Delete Group</button>
      </div>
      
      <div class="form-group">
        <span class="item-label">Group Name:</span>
        <input type="text" placeholder="Group Name" value="${group.name}" onchange="updateGroupName(${groupIdx}, this.value)">
      </div>
      
      <div class="form-group">
        <span class="item-label">Caption (optional):</span>
        <input type="text" placeholder="e.g., Main Office, Prontera, etc." value="${group.caption || ""}" onchange="updateGroupCaption(${groupIdx}, this.value)">
        <p class="help-text">A short location or description displayed under the group name</p>
      </div>

      <div class="form-group">
        <span class="item-label">Navigation Command:</span>
        <div class="nav-inputs-row" style="display: flex; gap: 8px; align-items: center;">
          <input type="text" placeholder="Map (e.g. prt_fild01)" value="${group.map || ""}" onchange="updateGroupMap(${groupIdx}, this.value)" style="flex: 2;">
          <input type="number" placeholder="X" value="${group.map_x || ""}" onchange="updateGroupMapX(${groupIdx}, this.value)" style="flex: 1; width: 60px;">
          <input type="number" placeholder="Y" value="${group.map_y || ""}" onchange="updateGroupMapY(${groupIdx}, this.value)" style="flex: 1; width: 60px;">
          <span style="font-size: 12px; color: var(--text-muted); font-weight: bold;">OR</span>
          <input type="text" placeholder="Custom (e.g. @npc 16)" value="${group.custom_command || ""}" onchange="updateGroupCustomCommand(${groupIdx}, this.value)" style="flex: 2;">
        </div>
        <p class="help-text">Produces copyable @warp or custom command links. Map name must be lowercase with underscores/hyphens.</p>
      </div>
      
      <div class="group-ordering-section">
        <span class="item-label">Group Position:</span>
        <div class="ordering-controls">
          <button class="btn btn-sm" onclick="moveGroup(${groupIdx}, -1)" ${groupIdx === 0 ? "disabled" : ""}>↑ Move Up</button>
          <button class="btn btn-sm" onclick="moveGroup(${groupIdx}, 1)" ${groupIdx === groups.length - 1 ? "disabled" : ""}>↓ Move Down</button>
          <span class="ordering-info">Position ${groupIdx + 1} of ${groups.length}</span>
        </div>
      </div>
      
      <div class="subgroups-section">
        <div class="subgroups-header">
          <span class="item-label">Subgroups (${Array.isArray(group.subgroups) ? group.subgroups.length : 0})</span>
          <button class="btn btn-sm btn-primary" onclick="addSubgroup(${groupIdx})">+ Add Subgroup</button>
        </div>
        
        <div class="subgroups-list">
  `;

  if (!Array.isArray(group.subgroups) || group.subgroups.length === 0) {
    html += `<div class="empty-msg-centered">No subgroups yet. Click "+ Add Subgroup" to create one.</div>`;
  } else {
    group.subgroups.forEach((subgroup, subIdx) => {
      if (!subgroup) return;
      
      const itemCount = Array.isArray(subgroup[itemsKey]) ? subgroup[itemsKey].length : 0;
      
      html += `
        <div class="subgroup-edit-card">
          <div class="subgroup-edit-header">
            <input type="text" class="subgroup-edit-name-input" value="${subgroup.name || 'Unnamed Subgroup'}" onchange="updateSubgroupName(${groupIdx}, ${subIdx}, this.value)">
            <span class="subgroup-quest-count">${itemCount} ${itemsKey}</span>
            <div class="subgroup-ordering-controls">
              <button class="btn btn-sm btn-icon" onclick="moveSubgroup(${groupIdx}, ${subIdx}, -1)" ${subIdx === 0 ? "disabled" : ""} title="Move Up">↑</button>
              <button class="btn btn-sm btn-icon" onclick="moveSubgroup(${groupIdx}, ${subIdx}, 1)" ${subIdx === group.subgroups.length - 1 ? "disabled" : ""} title="Move Down">↓</button>
            </div>
            <button class="btn btn-sm btn-danger" onclick="deleteSubgroup(${groupIdx}, ${subIdx})">Delete</button>
          </div>
          <div class="subgroup-edit-caption-row" style="display: flex; flex-direction: column; gap: 8px;">
            <input type="text" class="subgroup-edit-caption-input" placeholder="Caption (optional)" value="${subgroup.caption || ''}" onchange="updateSubgroupCaption(${groupIdx}, ${subIdx}, this.value)">
            <div class="nav-inputs-row" style="display: flex; gap: 8px; align-items: center;">
              <input type="text" placeholder="Map" value="${subgroup.map || ''}" onchange="updateSubgroupMap(${groupIdx}, ${subIdx}, this.value)" style="flex: 2;">
              <input type="number" placeholder="X" value="${subgroup.map_x || ''}" onchange="updateSubgroupMapX(${groupIdx}, ${subIdx}, this.value)" style="flex: 1; width: 50px;">
              <input type="number" placeholder="Y" value="${subgroup.map_y || ''}" onchange="updateSubgroupMapY(${groupIdx}, ${subIdx}, this.value)" style="flex: 1; width: 50px;">
              <span style="font-size: 11px; color: var(--text-muted); font-weight: bold;">OR</span>
              <input type="text" placeholder="Custom Command" value="${subgroup.custom_command || ''}" onchange="updateSubgroupCustomCommand(${groupIdx}, ${subIdx}, this.value)" style="flex: 2;">
            </div>
          </div>
        </div>
      `;
    });
  }

  html += `
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function addGroup() {
  const itemsKey = groupsTabMode === 'quests' ? 'quests' : 'shops';
  const group = {
    name: "New Group",
    subgroups: [],
  };
  
  const groups = groupsTabMode === 'quests' ? DATA.groups : DATA.shopGroups;
  groups.push(group);

  if (state.currentTab === "groups") {
    selectGroupForEdit(groups.length - 1);
  } else if (groupsTabMode === 'quests') {
    state.expandedGroups.add(groups.length - 1);
  } else {
    state.expandedShopGroups.add(groups.length - 1);
  }

  render();
}

function deleteGroup(idx) {
  const groups = groupsTabMode === 'quests' ? DATA.groups : DATA.shopGroups;
  const deletedGroupName = groups[idx]?.name || 'Group';
  groups.splice(idx, 1);
  showToast(`Deleted "${deletedGroupName}"`, 'info');

  if (groupsTabMode === 'quests') {
    state.expandedGroups.delete(idx);
    if (state.selectedGroup === groups[idx]) { state.selectedQuest = null; }
  } else {
    state.expandedShopGroups.delete(idx);
    if (state.selectedShopGroup === groups[idx]) { state.selectedShop = null; }
  }

  if (state.selectedGroupForEdit === idx) {
    state.selectedGroupForEdit = null;
  } else if (state.selectedGroupForEdit > idx) {
    state.selectedGroupForEdit--;
  }

  render();
}
function updateGroupName(idx, value) {
  const groups = groupsTabMode === 'quests' ? DATA.groups : DATA.shopGroups;
  groups[idx].name = value;
  render();
}

function updateGroupCaption(idx, value) {
  const groups = groupsTabMode === 'quests' ? DATA.groups : DATA.shopGroups;
  groups[idx].caption = value.trim() || undefined;
  renderGroupContentCore();
}

function updateGroupMap(idx, value) {
  const groups = groupsTabMode === 'quests' ? DATA.groups : DATA.shopGroups;
  const val = value.trim();
  if (val && !/^[a-z0-9_-]+$/.test(val)) {
    alert("Invalid map name. Only lowercase alphanumeric, underscores, and hyphens are allowed.");
    return;
  }
  groups[idx].map = val || undefined;
  renderGroupContentCore();
}

function updateGroupMapX(idx, value) {
  const groups = groupsTabMode === 'quests' ? DATA.groups : DATA.shopGroups;
  groups[idx].map_x = value ? parseInt(value, 10) : undefined;
  renderGroupContentCore();
}

function updateGroupMapY(idx, value) {
  const groups = groupsTabMode === 'quests' ? DATA.groups : DATA.shopGroups;
  groups[idx].map_y = value ? parseInt(value, 10) : undefined;
  renderGroupContentCore();
}

function updateGroupCustomCommand(idx, value) {
  const groups = groupsTabMode === 'quests' ? DATA.groups : DATA.shopGroups;
  groups[idx].custom_command = value.trim() || undefined;
  renderGroupContentCore();
}

function moveGroup(idx, direction) {
  const groups = groupsTabMode === 'quests' ? DATA.groups : DATA.shopGroups;
  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= groups.length) return;

  // Swap groups
  const temp = groups[idx];
  groups[idx] = groups[newIdx];
  groups[newIdx] = temp;

  // Update selected index
  state.selectedGroupForEdit = newIdx;

  render();
}

function addSubgroup(groupIdx) {
  const itemsKey = groupsTabMode === 'quests' ? 'quests' : 'shops';
  const subgroup = {
    name: "New Subgroup",
    [itemsKey]: [],
  };
  
  const groups = groupsTabMode === 'quests' ? DATA.groups : DATA.shopGroups;
  groups[groupIdx].subgroups.push(subgroup);
  render();
}

function updateSubgroupName(groupIdx, subIdx, value) {
  const groups = groupsTabMode === 'quests' ? DATA.groups : DATA.shopGroups;
  groups[groupIdx].subgroups[subIdx].name = value;
  render();
}

function updateSubgroupCaption(groupIdx, subIdx, value) {
  const groups = groupsTabMode === 'quests' ? DATA.groups : DATA.shopGroups;
  groups[groupIdx].subgroups[subIdx].caption = value.trim() || undefined;
  renderGroupContentCore();
}

function updateSubgroupMap(groupIdx, subIdx, value) {
  const groups = groupsTabMode === 'quests' ? DATA.groups : DATA.shopGroups;
  const val = value.trim();
  if (val && !/^[a-z0-9_-]+$/.test(val)) {
    alert("Invalid map name. Only lowercase alphanumeric, underscores, and hyphens are allowed.");
    return;
  }
  groups[groupIdx].subgroups[subIdx].map = val || undefined;
  renderGroupContentCore();
}

function updateSubgroupMapX(groupIdx, subIdx, value) {
  const groups = groupsTabMode === 'quests' ? DATA.groups : DATA.shopGroups;
  groups[groupIdx].subgroups[subIdx].map_x = value ? parseInt(value, 10) : undefined;
  renderGroupContentCore();
}

function updateSubgroupMapY(groupIdx, subIdx, value) {
  const groups = groupsTabMode === 'quests' ? DATA.groups : DATA.shopGroups;
  groups[groupIdx].subgroups[subIdx].map_y = value ? parseInt(value, 10) : undefined;
  renderGroupContentCore();
}

function updateSubgroupCustomCommand(groupIdx, subIdx, value) {
  const groups = groupsTabMode === 'quests' ? DATA.groups : DATA.shopGroups;
  groups[groupIdx].subgroups[subIdx].custom_command = value.trim() || undefined;
  renderGroupContentCore();
}

function moveSubgroup(groupIdx, subIdx, direction) {
  const groups = groupsTabMode === 'quests' ? DATA.groups : DATA.shopGroups;
  const group = groups[groupIdx];
  const newIdx = subIdx + direction;
  if (newIdx < 0 || newIdx >= group.subgroups.length) return;

  // Swap subgroups
  const temp = group.subgroups[subIdx];
  group.subgroups[subIdx] = group.subgroups[newIdx];
  group.subgroups[newIdx] = temp;

  render();
}

function deleteSubgroup(groupIdx, subIdx) {
  const groups = groupsTabMode === 'quests' ? DATA.groups : DATA.shopGroups;
  const itemsKey = groupsTabMode === 'quests' ? 'quests' : 'shops';
  
  const subgroup = groups[groupIdx].subgroups[subIdx];
    
    if (groupsTabMode === 'quests' && state.selectedSubgroup === subgroup) {
      state.selectedQuest = null;
    } else if (groupsTabMode === 'shops' && state.selectedShopSubgroup === subgroup) {
      state.selectedShop = null;
    }
    
  groups[groupIdx].subgroups.splice(subIdx, 1);
  const subKey = `${groupIdx}-${subIdx}`;
  if (groupsTabMode === 'quests') {
    state.expandedSubgroups.delete(subKey);
  } else {
    state.expandedShopSubgroups.delete(subKey);
  }
  showToast(`Subgroup deleted`, 'info');
  render();
}

function setGroupsTabMode(mode) {
  groupsTabMode = mode;
  state.selectedGroupForEdit = null;
  render();
}

// ===== ERROR-WRAPPED RENDER FUNCTIONS =====

// ===== ERROR-WRAPPED RENDER FUNCTIONS =====

// Wrap render functions with error boundaries and data validation
window.renderGroupsList = withErrorBoundary(
  withDataValidation(renderGroupsListCore, 'renderGroupsList', ['DATA.groups']),
  'renderGroupsList'
);

window.renderGroupContent = withErrorBoundary(
  withDataValidation(renderGroupContentCore, 'renderGroupContent', ['DATA.groups']),
  'renderGroupContent'
);

// ===== EXPOSE FUNCTIONS CALLED FROM HTML =====

// Group selection
window.selectGroupForEdit = selectGroupForEdit;

// Group management
window.addGroup = addGroup;
window.deleteGroup = deleteGroup;
window.updateGroupName = updateGroupName;
window.updateGroupCaption = updateGroupCaption;
window.updateGroupMap = updateGroupMap;
window.updateGroupMapX = updateGroupMapX;
window.updateGroupMapY = updateGroupMapY;
window.updateGroupCustomCommand = updateGroupCustomCommand;
window.moveGroup = moveGroup;

// Subgroup management
window.addSubgroup = addSubgroup;
window.updateSubgroupName = updateSubgroupName;
window.updateSubgroupCaption = updateSubgroupCaption;
window.updateSubgroupMap = updateSubgroupMap;
window.updateSubgroupMapX = updateSubgroupMapX;
window.updateSubgroupMapY = updateSubgroupMapY;
window.updateSubgroupCustomCommand = updateSubgroupCustomCommand;
window.moveSubgroup = moveSubgroup;
window.deleteSubgroup = deleteSubgroup;
window.setGroupsTabMode = setGroupsTabMode;