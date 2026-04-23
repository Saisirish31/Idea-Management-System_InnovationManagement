// Authentication Check
const currentUser = JSON.parse(localStorage.getItem("imsCurrentUser"));
if (!currentUser) {
  window.location.href = "login.html";
}

// Initialize navigation menu
document.getElementById('nav-menu').innerHTML = renderNavigationMenu();

// DOM Elements
const ideaForm = document.getElementById("idea-form");
const titleInput = document.getElementById("idea-title");
const descriptionInput = document.getElementById("idea-description");
const categoryInput = document.getElementById("idea-category");
const impactInput = document.getElementById("idea-impact");
const feasibilityInput = document.getElementById("idea-feasibility");
const ratingInput = document.getElementById("idea-rating");
const stageInput = document.getElementById("idea-stage");
const errorBox = document.getElementById("form-error");

const ideasList = document.getElementById("ideas-list");
const topIdeasList = document.getElementById("top-ideas-list");
const searchInput = document.getElementById("search-ideas");
const filterCategory = document.getElementById("filter-category");
const filterStage = document.getElementById("filter-stage");
const sortMode = document.getElementById("sort-mode");
const sortDirectionButton = document.getElementById("sort-direction");
const exportButton = document.getElementById("export-json");
const resetDataButton = document.getElementById("reset-data");
const clearFiltersButton = document.getElementById("clear-filters");

const dashboardTab = document.getElementById("tab-dashboard"); // May not exist in new layout
const topTab = document.getElementById("tab-top");
const dashboardSection = document.getElementById("dashboard");
const topSection = document.getElementById("top-ideas");

const resultsCounter = document.getElementById("results-counter");

const statTotal = document.getElementById("stat-total");
const statRating = document.getElementById("stat-rating");
const statScore = document.getElementById("stat-score");
const statVotes = document.getElementById("stat-votes");

const stageIdea = document.getElementById("stage-idea");
const stageScreening = document.getElementById("stage-screening");
const stagePrototype = document.getElementById("stage-prototype");
const stageImplementation = document.getElementById("stage-implementation");
const stageIdeaBar = document.getElementById("stage-idea-bar");
const stageScreeningBar = document.getElementById("stage-screening-bar");
const stagePrototypeBar = document.getElementById("stage-prototype-bar");
const stageImplementationBar = document.getElementById("stage-implementation-bar");

const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");
const editTitle = document.getElementById("edit-title");
const editDescription = document.getElementById("edit-description");
const editCategory = document.getElementById("edit-category");
const editImpact = document.getElementById("edit-impact");
const editFeasibility = document.getElementById("edit-feasibility");
const editRating = document.getElementById("edit-rating");
const editStage = document.getElementById("edit-stage");
const editError = document.getElementById("edit-error");
const closeModalButton = document.getElementById("close-modal");
const cancelEditButton = document.getElementById("cancel-edit");

const helpModal = document.getElementById("help-modal");
const helpButton = document.getElementById("help-button");
const closeHelpButton = document.getElementById("close-help");

const scrollToTopButton = document.getElementById("scroll-to-top");

// User profile elements
const userMenuBtn = document.getElementById("user-menu-btn");
const userDropdown = document.getElementById("user-dropdown");
const logoutBtn = document.getElementById("logout-btn");
const userInitials = document.getElementById("user-initials");
const userInitialsLarge = document.getElementById("user-initials-large");
const userNameDisplay = document.getElementById("user-name-display");
const userEmailDisplay = document.getElementById("user-email-display");

const storageKey = "imsIdeas";
const stageOptions = ["Idea", "Screening", "Prototype", "Implementation"];
let ideas = [];
let sortDescending = true;
let activeEditId = null;
let syncTimer = null;

const sampleIdeas = [
  {
    id: "id-1001",
    title: "Smart Inventory Alerts",
    description: "Use sensors and auto-reorder triggers to avoid stockouts.",
    category: "Process",
    impact: 5,
    feasibility: 4,
    rating: 5,
    stage: "Screening",
    votes: 12,
    comments: ["Great for supply chain visibility."],
    createdBy: {
      id: "demo-user",
      name: "Demo User",
      email: "demo@ims.com"
    },
    createdAt: "2026-03-01T10:00:00.000Z"
  },
  {
    id: "id-1002",
    title: "Eco-Friendly Packaging",
    description: "Replace plastic wrap with compostable materials.",
    category: "Product",
    impact: 4,
    feasibility: 4,
    rating: 4,
    stage: "Prototype",
    votes: 8,
    comments: ["Aligns with sustainability goals."],
    createdBy: {
      id: "demo-user",
      name: "Demo User",
      email: "demo@ims.com"
    },
    createdAt: "2026-03-02T14:30:00.000Z"
  },
  {
    id: "id-1003",
    title: "Campus Ambassador Program",
    description: "Let students promote products via referral rewards.",
    category: "Marketing",
    impact: 3,
    feasibility: 5,
    rating: 3,
    stage: "Idea",
    votes: 5,
    comments: ["Could boost brand reach quickly."],
    createdBy: {
      id: "demo-user",
      name: "Demo User",
      email: "demo@ims.com"
    },
    createdAt: "2026-03-03T09:15:00.000Z"
  },
  {
    id: "id-1004",
    title: "Community Skill Workshops",
    description: "Offer weekend workshops to build local talent.",
    category: "Social",
    impact: 4,
    feasibility: 3,
    rating: 4,
    stage: "Implementation",
    votes: 9,
    comments: [],
    createdBy: {
      id: "demo-user",
      name: "Demo User",
      email: "demo@ims.com"
    },
    createdAt: "2026-03-04T16:45:00.000Z"
  },
  {
    id: "id-1005",
    title: "AI Support Chat",
    description: "Provide 24/7 answers with an AI support assistant.",
    category: "Process",
    impact: 5,
    feasibility: 3,
    rating: 5,
    stage: "Screening",
    votes: 15,
    comments: ["Ensure human handoff available."],
    createdBy: {
      id: "demo-user",
      name: "Demo User",
      email: "demo@ims.com"
    },
    createdAt: "2026-03-05T11:20:00.000Z"
  }
];

function normalizeIdea(idea) {
  const safeIdea = idea && typeof idea === "object" ? idea : {};
  const normalizedStage = stageOptions.includes(safeIdea.stage) ? safeIdea.stage : "Idea";

  return {
    id: safeIdea.id || `id-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: String(safeIdea.title || "Untitled Idea"),
    description: String(safeIdea.description || ""),
    category: String(safeIdea.category || "Product"),
    impact: Number(safeIdea.impact || 0),
    feasibility: Number(safeIdea.feasibility || 0),
    rating: Number(safeIdea.rating || 0),
    stage: normalizedStage,
    votes: Number(safeIdea.votes || 0),
    comments: Array.isArray(safeIdea.comments) ? safeIdea.comments : []
  };
}

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

async function loadFromLocal() {
  try {
    const data = await apiRequest("/api/ideas");
    ideas = Array.isArray(data.ideas) ? data.ideas.map(normalizeIdea) : [];
  } catch (error) {
    ideas = sampleIdeas.map(normalizeIdea);
    showErrorMessage(`Server unavailable: ${error.message}`);
  }
}

async function pushIdeasToServer() {
  await apiRequest("/api/ideas/sync", {
    method: "POST",
    body: JSON.stringify({ ideas })
  });
}

function saveToLocal() {
  if (syncTimer) {
    clearTimeout(syncTimer);
  }
  syncTimer = setTimeout(async () => {
    try {
      await pushIdeasToServer();
    } catch (error) {
      showErrorMessage(`Failed to save changes: ${error.message}`);
    }
  }, 120);
}

async function addIdea(event) {
  event.preventDefault();
  errorBox.textContent = "";
  
  // Remove previous error highlights
  document.querySelectorAll(".field-error").forEach(el => el.classList.remove("field-error"));

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const category = categoryInput.value;
  const impact = impactInput.value;
  const feasibility = feasibilityInput.value;
  const rating = ratingInput.value;
  const stage = stageInput.value;

  const missingFields = [];
  
  if (!title) {
    missingFields.push("Title");
    titleInput.classList.add("field-error");
  }
  if (!description) {
    missingFields.push("Description");
    descriptionInput.classList.add("field-error");
  }
  if (!category) {
    missingFields.push("Category");
    categoryInput.classList.add("field-error");
  }
  if (!impact) {
    missingFields.push("Impact");
    impactInput.classList.add("field-error");
  }
  if (!feasibility) {
    missingFields.push("Feasibility");
    feasibilityInput.classList.add("field-error");
  }
  if (!rating) {
    missingFields.push("Rating");
    ratingInput.classList.add("field-error");
  }
  if (!stage) {
    missingFields.push("Funnel Stage");
    stageInput.classList.add("field-error");
  }

  if (missingFields.length > 0) {
    errorBox.textContent = `Please fill in: ${missingFields.join(", ")}`;
    return;
  }

  if (!isValidScore(impact) || !isValidScore(feasibility) || !isValidScore(rating)) {
    errorBox.textContent = "Scores and rating must be between 1 and 5.";
    return;
  }

  const newIdea = {
    title,
    description,
    category,
    impact: Number(impact),
    feasibility: Number(feasibility),
    rating: Number(rating),
    stage,
    votes: 0,
    comments: [],
    createdBy: {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email
    },
    createdAt: new Date().toISOString()
  };

  try {
    const data = await apiRequest("/api/ideas", {
      method: "POST",
      body: JSON.stringify(newIdea)
    });
    const savedIdea = normalizeIdea(data.idea || newIdea);
    ideas.unshift(savedIdea);
    showSuccessMessage("Idea added successfully! 🎉");
  } catch (error) {
    // Fallback: keep the app usable even if server write fails.
    ideas.unshift(normalizeIdea({ id: `id-${Date.now()}`, ...newIdea }));
    saveToLocal();
    showErrorMessage(`Saved locally only: ${error.message}`);
  }

  showIdeas();
  showTopIdeas();
  updateInsights();
  ideaForm.reset();
}

function showIdeas() {
  const selected = filterCategory.value;
  const selectedStage = filterStage.value;
  const query = searchInput.value.trim().toLowerCase();

  let filtered = ideas.filter((idea) => {
    const matchesCategory = selected === "All" || idea.category === selected;
    const matchesStage = selectedStage === "All" || idea.stage === selectedStage;
    const matchesSearch =
      !query ||
      idea.title.toLowerCase().includes(query) ||
      idea.description.toLowerCase().includes(query);
    return matchesCategory && matchesStage && matchesSearch;
  });

  filtered = sortIdeas(filtered);

  // Update results counter
  resultsCounter.textContent = `${filtered.length} ${filtered.length === 1 ? 'idea' : 'ideas'}`;

  ideasList.innerHTML = "";

  if (filtered.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.innerHTML = `
      <div class="empty-icon">📭</div>
      <h3>No Ideas Found</h3>
      <p>Try adjusting your filters or search terms, or add a new idea to get started!</p>
      <button onclick="document.getElementById('clear-filters').click()" class="primary" style="margin-top: 10px;">Clear Filters</button>
    `;
    ideasList.appendChild(emptyState);
    return;
  }

  filtered.forEach((idea) => {
    const score = getScreeningScore(idea);
    const createdBy = idea.createdBy ? idea.createdBy.name : "Unknown User";
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-header">
        <div>
          <h3>${idea.title}</h3>
          <p>${idea.description}</p>
          <div class="idea-meta">
            <span class="meta-badge">👤 ${createdBy}</span>
          </div>
        </div>
        <div>
          <span class="badge">${idea.category}</span>
          <span class="badge stage-badge">${idea.stage}</span>
        </div>
      </div>
      <div class="rating">${renderStars(idea.rating)} (${idea.rating}/5)</div>
      <div class="score-row">
        <span class="score-pill">Screening Score: ${score}/10</span>
        <span>Impact: ${idea.impact}/5</span>
        <span>Feasibility: ${idea.feasibility}/5</span>
      </div>
      <div class="vote-box">
        <span>Votes: ${idea.votes}</span>
        <button data-action="vote-up" data-id="${idea.id}">+</button>
        <button data-action="vote-down" data-id="${idea.id}">-</button>
      </div>
      <div class="card-actions">
        <button data-action="edit" data-id="${idea.id}">Edit</button>
        <button data-action="delete" data-id="${idea.id}">Delete</button>
      </div>
      <div>
        <h4>Comments</h4>
        <div class="comment-list">
          ${renderComments(idea.comments)}
        </div>
        <form class="comment-form" data-id="${idea.id}">
          <input type="text" placeholder="Add a comment" />
          <button type="submit">Add</button>
        </form>
      </div>
    `;

    ideasList.appendChild(card);
  });
}

function renderComments(comments) {
  if (!comments.length) {
    return "<em>No comments yet.</em>";
  }

  return comments.map((comment) => `<div>- ${comment}</div>`).join("");
}

function addComment(event) {
  if (!event.target.classList.contains("comment-form")) {
    return;
  }
  event.preventDefault();

  const input = event.target.querySelector("input");
  const text = input.value.trim();
  if (!text) {
    return;
  }

  const ideaId = event.target.getAttribute("data-id");
  const idea = ideas.find((item) => item.id === ideaId);
  if (!idea) {
    return;
  }

  idea.comments.push(text);
  saveToLocal();
  showIdeas();
  showTopIdeas();
  input.value = "";
  showSuccessMessage("Comment added! 💬");
}

function deleteIdea(id) {
  const idea = ideas.find((item) => item.id === id);
  if (!idea) return;
  
  const confirmed = confirm(`Are you sure you want to delete "${idea.title}"?\n\nThis action cannot be undone.`);
  if (!confirmed) return;
  
  ideas = ideas.filter((item) => item.id !== id);
  saveToLocal();
  showIdeas();
  showTopIdeas();
  updateInsights();
  showSuccessMessage("Idea deleted successfully");
}

function voteIdea(id, delta) {
  const idea = ideas.find((item) => item.id === id);
  if (!idea) {
    return;
  }
  idea.votes = Math.max(0, idea.votes + delta);
  saveToLocal();
  showIdeas();
  showTopIdeas();
  updateInsights();
}

function editIdea(id) {
  const idea = ideas.find((item) => item.id === id);
  if (!idea) {
    return;
  }
  activeEditId = idea.id;
  editTitle.value = idea.title;
  editDescription.value = idea.description;
  editCategory.value = idea.category;
  editImpact.value = idea.impact;
  editFeasibility.value = idea.feasibility;
  editRating.value = idea.rating;
  editStage.value = idea.stage;
  editError.textContent = "";
  editModal.classList.remove("hidden");
}

function renderStars(value) {
  const filled = "★".repeat(value);
  const empty = "☆".repeat(5 - value);
  return `<span class="stars">${filled}${empty}</span>`;
}

function getScreeningScore(idea) {
  return Number(idea.impact || 0) + Number(idea.feasibility || 0);
}

function isValidScore(value) {
  const score = Number(value);
  return score >= 1 && score <= 5;
}

function sortIdeas(items) {
  const mode = sortMode.value;
  const sorted = [...items];

  if (mode === "newest") {
    sorted.sort((a, b) => {
      const aId = Number(String(a.id || "").replace("id-", "")) || 0;
      const bId = Number(String(b.id || "").replace("id-", "")) || 0;
      return bId - aId;
    });
  }
  if (mode === "rating") {
    sorted.sort((a, b) => b.rating - a.rating);
  }
  if (mode === "score") {
    sorted.sort((a, b) => getScreeningScore(b) - getScreeningScore(a));
  }
  if (mode === "votes") {
    sorted.sort((a, b) => b.votes - a.votes);
  }

  return sortDescending ? sorted : sorted.reverse();
}

function showTopIdeas() {
  topIdeasList.innerHTML = "";
  
  if (ideas.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.innerHTML = `
      <div class="empty-icon">🌟</div>
      <h3>No Ideas Yet</h3>
      <p>Add some ideas to see the top 5 most innovative ideas here!</p>
    `;
    topIdeasList.appendChild(emptyState);
    return;
  }
  
  const sorted = [...ideas].sort((a, b) => {
    const ratingDiff = b.rating - a.rating;
    if (ratingDiff !== 0) {
      return ratingDiff;
    }
    const scoreDiff = getScreeningScore(b) - getScreeningScore(a);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }
    return b.votes - a.votes;
  });
  const topFive = sorted.slice(0, 5);

  topFive.forEach((idea, index) => {
    const score = getScreeningScore(idea);
    const createdBy = idea.createdBy ? idea.createdBy.name : "Unknown User";
    const card = document.createElement("div");
    card.className = "card";
    const rankEmojis = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
    const rankLabels = ["1st", "2nd", "3rd", "4th", "5th"];
    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
        <span style="font-size: 28px;">${rankEmojis[index]}</span>
        <span class="badge" style="background: linear-gradient(135deg, #f4a42b, #ff9800); color: white; font-weight: 700;">${rankLabels[index]} Place</span>
      </div>
      <div class="card-header">
        <div>
          <h3>${idea.title}</h3>
          <p>${idea.description}</p>
          <div class="idea-meta">
            <span class="meta-badge">👤 ${createdBy}</span>
          </div>
        </div>
        <div>
          <span class="badge">${idea.category}</span>
          <span class="badge stage-badge">${idea.stage}</span>
        </div>
      </div>
      <div class="rating">${renderStars(idea.rating)} (${idea.rating}/5)</div>
      <div class="score-row">
        <span class="score-pill">Screening Score: ${score}/10</span>
        <span>Impact: ${idea.impact}/5</span>
        <span>Feasibility: ${idea.feasibility}/5</span>
      </div>
      <div class="vote-box">
        <span>Votes: ${idea.votes}</span>
      </div>
      <div>
        <h4>Comments</h4>
        <div class="comment-list">
          ${renderComments(idea.comments)}
        </div>
      </div>
    `;
    topIdeasList.appendChild(card);
  });
}

function toggleTabs(showTop) {
  if (showTop) {
    dashboardSection.classList.add("hidden");
    topSection.classList.remove("hidden");
    if (dashboardTab) {
      dashboardTab.classList.remove("active");
      dashboardTab.setAttribute("aria-pressed", "false");
    }
    if (topTab) {
      topTab.classList.add("active");
      topTab.setAttribute("aria-pressed", "true");
    }
    showTopIdeas();
  } else {
    dashboardSection.classList.remove("hidden");
    topSection.classList.add("hidden");
    if (dashboardTab) {
      dashboardTab.classList.add("active");
      dashboardTab.setAttribute("aria-pressed", "true");
    }
    if (topTab) {
      topTab.classList.remove("active");
      topTab.setAttribute("aria-pressed", "false");
    }
  }
}

function exportIdeas() {
  const report = {
    generatedAt: new Date().toISOString(),
    totalIdeas: ideas.length,
    ideas
  };

  const file = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = `idea-management-report-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showSuccessMessage("Data exported successfully! 📥");
}

function clearFilters() {
  searchInput.value = "";
  filterCategory.value = "All";
  filterStage.value = "All";
  sortMode.value = "newest";
  sortDescending = true;
  sortDirectionButton.textContent = "Descending";
  showIdeas();
  showSuccessMessage("Filters cleared");
}

function closeEditModal() {
  editModal.classList.add("hidden");
  activeEditId = null;
}

function openHelpModal() {
  helpModal.classList.remove("hidden");
}

function closeHelpModal() {
  helpModal.classList.add("hidden");
}

function clearLocalData() {
  apiRequest("/api/system/reset", { method: "POST" })
    .then(() => loadFromLocal())
    .then(() => {
      showIdeas();
      showTopIdeas();
      updateInsights();
      showSuccessMessage("Data reset to sample ideas successfully! 🔄");
    })
    .catch((error) => {
      showErrorMessage(`Reset failed: ${error.message}`);
    });
}

function handleEditSubmit(event) {
  event.preventDefault();
  editError.textContent = "";

  const idea = ideas.find((item) => item.id === activeEditId);
  if (!idea) {
    editError.textContent = "Unable to update the idea. Please try again.";
    return;
  }

  const updated = {
    title: editTitle.value.trim(),
    description: editDescription.value.trim(),
    category: editCategory.value,
    impact: Number(editImpact.value),
    feasibility: Number(editFeasibility.value),
    rating: Number(editRating.value),
    stage: editStage.value
  };

  if (!updated.title || !updated.description) {
    editError.textContent = "Title and description are required.";
    return;
  }
  if (!isValidScore(updated.impact) || !isValidScore(updated.feasibility) || !isValidScore(updated.rating)) {
    editError.textContent = "Scores and rating must be between 1 and 5.";
    return;
  }

  idea.title = updated.title;
  idea.description = updated.description;
  idea.category = updated.category;
  idea.impact = updated.impact;
  idea.feasibility = updated.feasibility;
  idea.rating = updated.rating;
  idea.stage = updated.stage;

  saveToLocal();
  showIdeas();
  showTopIdeas();
  updateInsights();
  closeEditModal();
  showSuccessMessage("Idea updated successfully! ✓");
}

function updateInsights() {
  const total = ideas.length;
  const totalRating = ideas.reduce((sum, idea) => sum + idea.rating, 0);
  const totalScore = ideas.reduce((sum, idea) => sum + getScreeningScore(idea), 0);
  const totalVotes = ideas.reduce((sum, idea) => sum + idea.votes, 0);

  statTotal.textContent = total;
  statRating.textContent = total ? (totalRating / total).toFixed(1) : "0.0";
  statScore.textContent = total ? (totalScore / total).toFixed(1) : "0.0";
  statVotes.textContent = totalVotes;

  const stages = {
    Idea: 0,
    Screening: 0,
    Prototype: 0,
    Implementation: 0
  };

  ideas.forEach((idea) => {
    if (stages[idea.stage] !== undefined) {
      stages[idea.stage] += 1;
    }
  });

  stageIdea.textContent = stages.Idea;
  stageScreening.textContent = stages.Screening;
  stagePrototype.textContent = stages.Prototype;
  stageImplementation.textContent = stages.Implementation;

  const maxStage = Math.max(1, ...Object.values(stages));
  stageIdeaBar.style.width = `${(stages.Idea / maxStage) * 100}%`;
  stageScreeningBar.style.width = `${(stages.Screening / maxStage) * 100}%`;
  stagePrototypeBar.style.width = `${(stages.Prototype / maxStage) * 100}%`;
  stageImplementationBar.style.width = `${(stages.Implementation / maxStage) * 100}%`;
}

ideaForm.addEventListener("submit", addIdea);
// Remove error highlighting when user starts typing
[titleInput, descriptionInput, categoryInput, impactInput, feasibilityInput, ratingInput, stageInput].forEach(input => {
  input.addEventListener("input", () => {
    input.classList.remove("field-error");
    errorBox.textContent = "";
  });
  input.addEventListener("change", () => {
    input.classList.remove("field-error");
    errorBox.textContent = "";
  });
});

ideasList.addEventListener("submit", addComment);
ideasList.addEventListener("click", (event) => {
  const action = event.target.getAttribute("data-action");
  const id = event.target.getAttribute("data-id");

  if (action === "delete") {
    deleteIdea(id);
  }
  if (action === "edit") {
    editIdea(id);
  }
  if (action === "vote-up") {
    voteIdea(id, 1);
  }
  if (action === "vote-down") {
    voteIdea(id, -1);
  }
});

searchInput.addEventListener("input", showIdeas);
filterCategory.addEventListener("change", showIdeas);
filterStage.addEventListener("change", showIdeas);
sortMode.addEventListener("change", showIdeas);
sortDirectionButton.addEventListener("click", () => {
  sortDescending = !sortDescending;
  sortDirectionButton.textContent = sortDescending ? "Descending" : "Ascending";
  showIdeas();
});

exportButton.addEventListener("click", exportIdeas);
clearFiltersButton.addEventListener("click", clearFilters);
resetDataButton.addEventListener("click", () => {
  const confirmed = confirm("This will reset server data and restore sample ideas. Continue?");
  if (confirmed) {
    clearLocalData();
  }
});
editForm.addEventListener("submit", handleEditSubmit);
closeModalButton.addEventListener("click", closeEditModal);
cancelEditButton.addEventListener("click", closeEditModal);
editModal.addEventListener("click", (event) => {
  if (event.target === editModal) {
    closeEditModal();
  }
});

helpButton.addEventListener("click", openHelpModal);
closeHelpButton.addEventListener("click", closeHelpModal);
helpModal.addEventListener("click", (event) => {
  if (event.target === helpModal) {
    closeHelpModal();
  }
});

if (!window.__imsUserMenuManaged) {
  userMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleUserDropdown();
  });

  logoutBtn.addEventListener("click", handleLogout);
}

if (dashboardTab) {
  dashboardTab.addEventListener("click", () => toggleTabs(false));
}
if (topTab) {
  topTab.addEventListener("click", () => toggleTabs(true));
}

// Success/Error message system
function showSuccessMessage(message) {
  const existing = document.getElementById("toast-message");
  if (existing) existing.remove();
  
  const toast = document.createElement("div");
  toast.id = "toast-message";
  toast.className = "toast-message success";
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showErrorMessage(message) {
  const existing = document.getElementById("toast-message");
  if (existing) existing.remove();
  
  const toast = document.createElement("div");
  toast.id = "toast-message";
  toast.className = "toast-message error";
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// User Profile Functions
function initializeUserProfile() {
  if (!currentUser) return;
  
  // Get initials
  const initials = currentUser.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
  
  userInitials.textContent = initials;
  userInitialsLarge.textContent = initials;
  userNameDisplay.textContent = currentUser.name;
  userEmailDisplay.textContent = currentUser.email;
}

function toggleUserDropdown() {
  userDropdown.classList.toggle("hidden");
}

function handleLogout() {
  const confirmed = confirm("Are you sure you want to logout?");
  if (!confirmed) return;
  
  localStorage.removeItem("imsCurrentUser");
  localStorage.removeItem("imsRememberMe");
  showSuccessMessage("Logged out successfully!");
  
  setTimeout(() => {
    window.location.href = "login.html";
  }, 500);
}

// Close dropdown when clicking outside
if (!window.__imsUserMenuManaged) {
  document.addEventListener("click", (e) => {
    if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.classList.add("hidden");
    }
  });
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Escape key closes modals
  if (e.key === "Escape") {
    if (!editModal.classList.contains("hidden")) {
      closeEditModal();
    } else if (!helpModal.classList.contains("hidden")) {
      closeHelpModal();
    }
  }
  
  // Ctrl/Cmd + K focuses search
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
});

// Scroll to top functionality
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    scrollToTopButton.classList.remove("hidden");
  } else {
    scrollToTopButton.classList.add("hidden");
  }
});

scrollToTopButton.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

window.addEventListener("beforeunload", () => {
  if (!syncTimer) {
    return;
  }
  clearTimeout(syncTimer);
  // Fire-and-forget best effort flush for pending changes.
  pushIdeasToServer().catch(() => {});
});

// Initialize user profile and load server data.
initializeUserProfile();

async function initializeApp() {
  await loadFromLocal();
  showIdeas();
  showTopIdeas();
  updateInsights();
}

initializeApp();
