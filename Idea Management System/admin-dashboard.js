const adminUser = JSON.parse(localStorage.getItem("imsAdminUser"));
if (!adminUser) {
  window.location.href = "admin.html";
}

let users = [];
let ideas = [];
let lastBackup = null;

const usersTab = document.getElementById("tab-users");
const ideasTab = document.getElementById("tab-ideas");
const backupTab = document.getElementById("tab-backup");

const usersSection = document.getElementById("users-section");
const ideasSection = document.getElementById("ideas-section");
const backupSection = document.getElementById("backup-section");

const usersTableBody = document.getElementById("users-table-body");
const ideasContainer = document.getElementById("ideas-container");

const userMenuBtn = document.getElementById("user-menu-btn");
const userDropdown = document.getElementById("user-dropdown");
const logoutBtn = document.getElementById("logout-btn");

const totalUsersEl = document.getElementById("total-users");
const totalIdeasEl = document.getElementById("total-ideas");
const totalVotesEl = document.getElementById("total-votes");
const totalCommentsEl = document.getElementById("total-comments");

const exportAllBtn = document.getElementById("export-all-btn");
const exportUsersBtn = document.getElementById("export-users-btn");
const exportIdeasBtn = document.getElementById("export-ideas-btn");
const deleteAllUsersBtn = document.getElementById("delete-all-users-btn");
const resetSystemBtn = document.getElementById("reset-system-btn");

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch (_error) {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }
  return payload;
}

function switchTab(tab) {
  [usersTab, ideasTab, backupTab].forEach((t) => t.classList.remove("active"));
  [usersSection, ideasSection, backupSection].forEach((s) => s.classList.add("hidden"));

  if (tab === "users") {
    usersTab.classList.add("active");
    usersSection.classList.remove("hidden");
  } else if (tab === "ideas") {
    ideasTab.classList.add("active");
    ideasSection.classList.remove("hidden");
  } else {
    backupTab.classList.add("active");
    backupSection.classList.remove("hidden");
  }
}

function updateStatistics() {
  totalUsersEl.textContent = users.length;
  totalIdeasEl.textContent = ideas.length;
  totalVotesEl.textContent = ideas.reduce((sum, idea) => sum + Number(idea.votes || 0), 0);
  totalCommentsEl.textContent = ideas.reduce((sum, idea) => sum + (idea.comments?.length || 0), 0);
}

function loadUsers() {
  usersTableBody.innerHTML = "";

  if (!users.length) {
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          <h3>No Users Registered</h3>
          <p>No users have registered yet.</p>
        </td>
      </tr>
    `;
    return;
  }

  users.forEach((user) => {
    const userIdeas = ideas.filter((idea) => idea.createdBy?.id === user.id);
    const date = new Date(user.createdAt).toLocaleDateString();

    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${user.name}</strong></td>
      <td class="user-email">${user.email}</td>
      <td class="user-date">${date}</td>
      <td><strong>${userIdeas.length}</strong> ideas</td>
      <td>
        <button class="action-btn" data-action="view" data-id="${user.id}">View</button>
        <button class="action-btn danger" data-action="delete" data-id="${user.id}">Delete</button>
      </td>
    `;
    usersTableBody.appendChild(row);
  });
}

function loadIdeas() {
  ideasContainer.innerHTML = "";

  if (!ideas.length) {
    ideasContainer.innerHTML = `
      <div class="empty-state">
        <h3>No Ideas Submitted</h3>
        <p>No ideas have been submitted yet.</p>
      </div>
    `;
    return;
  }

  ideas.forEach((idea) => {
    const creator = idea.createdBy?.name || "Unknown User";
    const date = new Date(idea.createdAt).toLocaleDateString();

    const item = document.createElement("div");
    item.className = "idea-item";
    item.innerHTML = `
      <div class="idea-header">
        <div>
          <div class="idea-title">${idea.title}</div>
          <div class="idea-creator">By ${creator} • ${date}</div>
        </div>
        <div>
          <span class="badge">${idea.category}</span>
          <span class="badge stage-badge">${idea.stage}</span>
        </div>
      </div>
      <p style="color: var(--muted); font-size: 14px; margin-top: 8px;">${idea.description}</p>
      <div style="display: flex; gap: 16px; margin-top: 12px; font-size: 13px; color: var(--muted);">
        <span>Rating: ${idea.rating}/5</span>
        <span>Votes: ${idea.votes}</span>
        <span>Comments: ${idea.comments?.length || 0}</span>
      </div>
    `;
    ideasContainer.appendChild(item);
  });
}

function updateDbStats() {
  const payloadSize = JSON.stringify({ users, ideas }).length;
  const sizeInKB = (payloadSize / 1024).toFixed(2);
  document.getElementById("db-size").textContent = `${sizeInKB} KB`;
  document.getElementById("last-backup").textContent = lastBackup ? new Date(lastBackup).toLocaleString() : "Never";
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function showToast(message, type) {
  const toast = document.createElement("div");
  toast.className = `toast-message ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

function showSuccess(message) {
  showToast(message, "success");
}

function showError(message) {
  showToast(message, "error");
}

function viewUserDetails(userId) {
  const user = users.find((u) => u.id === userId);
  if (!user) {
    showError("User not found");
    return;
  }
  const userIdeas = ideas.filter((idea) => idea.createdBy?.id === userId);
  alert(`User Details:\n\nName: ${user.name}\nEmail: ${user.email}\nRegistered: ${new Date(user.createdAt).toLocaleString()}\n\nTotal Ideas: ${userIdeas.length}\nIdea Titles: ${userIdeas.map((i) => i.title).join(", ") || "None"}`);
}

async function deleteUser(userId) {
  const user = users.find((u) => u.id === userId);
  if (!user) {
    showError("User not found");
    return;
  }

  const ideasCount = ideas.filter((i) => i.createdBy?.id === userId).length;
  const confirmed = confirm(`Delete user "${user.name}"?\n\nThis will also delete all ${ideasCount} ideas created by this user.\n\nThis action cannot be undone.`);
  if (!confirmed) {
    return;
  }

  try {
    await apiRequest(`/api/users/${encodeURIComponent(userId)}`, { method: "DELETE" });
    await refreshOverview();
    showSuccess("User and their ideas deleted successfully!");
  } catch (error) {
    showError(error.message || "Unable to delete user");
  }
}

async function refreshOverview() {
  const data = await apiRequest("/api/admin/overview");
  users = data.users || [];
  ideas = data.ideas || [];
  lastBackup = data.lastBackup || null;

  updateStatistics();
  loadUsers();
  loadIdeas();
  updateDbStats();
}

usersTab.addEventListener("click", () => switchTab("users"));
ideasTab.addEventListener("click", () => switchTab("ideas"));
backupTab.addEventListener("click", () => switchTab("backup"));

usersTableBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const action = button.getAttribute("data-action");
  const userId = button.getAttribute("data-id");

  if (action === "view") {
    viewUserDetails(userId);
  }
  if (action === "delete") {
    deleteUser(userId);
  }
});

exportAllBtn.addEventListener("click", async () => {
  const data = {
    exportDate: new Date().toISOString(),
    users,
    ideas,
    statistics: {
      totalUsers: users.length,
      totalIdeas: ideas.length,
      totalVotes: ideas.reduce((sum, idea) => sum + Number(idea.votes || 0), 0),
      totalComments: ideas.reduce((sum, idea) => sum + (idea.comments?.length || 0), 0)
    }
  };
  downloadJSON(data, `ims-complete-backup-${Date.now()}.json`);
  try {
    const backupData = await apiRequest("/api/admin/backup", { method: "POST" });
    lastBackup = backupData.lastBackup;
    updateDbStats();
  } catch (_error) {
    // Export still succeeds even if backup timestamp update fails.
  }
  showSuccess("Complete system data exported!");
});

exportUsersBtn.addEventListener("click", () => {
  downloadJSON({ exportDate: new Date().toISOString(), users }, `ims-users-${Date.now()}.json`);
  showSuccess("Users data exported!");
});

exportIdeasBtn.addEventListener("click", () => {
  downloadJSON({ exportDate: new Date().toISOString(), ideas }, `ims-ideas-${Date.now()}.json`);
  showSuccess("Ideas data exported!");
});

deleteAllUsersBtn.addEventListener("click", async () => {
  const confirmed = confirm(`DELETE ALL USERS?\n\nThis will delete ${users.length} users and all their ideas.\n\nThis action CANNOT be undone!`);
  if (!confirmed) {
    return;
  }

  const verification = prompt("Type DELETE to confirm:");
  if (verification !== "DELETE") {
    showError("Deletion cancelled.");
    return;
  }

  try {
    await apiRequest("/api/users", { method: "DELETE" });
    await refreshOverview();
    showSuccess("All users deleted!");
  } catch (error) {
    showError(error.message || "Unable to delete users");
  }
});

resetSystemBtn.addEventListener("click", async () => {
  const confirmed = confirm("RESET ENTIRE SYSTEM?\n\nThis will delete all users and ideas and restore sample data.\n\nThis action CANNOT be undone!");
  if (!confirmed) {
    return;
  }

  const verification = prompt("Type RESET to confirm:");
  if (verification !== "RESET") {
    showError("Reset cancelled.");
    return;
  }

  try {
    await apiRequest("/api/system/reset", { method: "POST" });
    await refreshOverview();
    showSuccess("System reset complete!");
  } catch (error) {
    showError(error.message || "Reset failed");
  }
});

userMenuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  userDropdown.classList.toggle("hidden");
});

document.addEventListener("click", (e) => {
  if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
    userDropdown.classList.add("hidden");
  }
});

logoutBtn.addEventListener("click", () => {
  const confirmed = confirm("Logout from admin panel?");
  if (!confirmed) {
    return;
  }
  localStorage.removeItem("imsAdminUser");
  showSuccess("Logged out successfully!");
  setTimeout(() => {
    window.location.href = "admin.html";
  }, 500);
});

refreshOverview().catch((error) => {
  showError(error.message || "Unable to load admin data");
});
