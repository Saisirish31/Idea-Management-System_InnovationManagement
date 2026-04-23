// Authentication Check
const currentUser = JSON.parse(localStorage.getItem("imsCurrentUser"));
if (!currentUser) {
  window.location.href = "login.html";
}

// Initialize navigation
document.getElementById('nav-menu').innerHTML = renderNavigationMenu();
document.getElementById('breadcrumbs-container').innerHTML = renderBreadcrumbs([
  { label: 'Dashboard', page: 'index' },
  { label: 'My Ideas' }
]);

let myIdeas = [];

// Fetch user's ideas
async function fetchMyIdeas() {
  try {
    const response = await fetch("/api/ideas");
    const ideas = await response.json();
    
    // Filter ideas created by current user
    myIdeas = ideas.filter(idea => idea.createdBy && idea.createdBy.id === currentUser.id);
    
    updateStats();
    renderMyIdeas();
  } catch (error) {
    console.error("Error fetching ideas:", error);
  }
}

// Update statistics
function updateStats() {
  const totalIdeas = myIdeas.length;
  const totalVotes = myIdeas.reduce((sum, idea) => sum + (idea.votes || 0), 0);
  const totalComments = myIdeas.reduce((sum, idea) => sum + (idea.comments || []).length, 0);
  const avgRating = totalIdeas > 0 
    ? (myIdeas.reduce((sum, idea) => sum + idea.rating, 0) / totalIdeas).toFixed(1)
    : '0.0';

  document.getElementById('my-total-ideas').textContent = totalIdeas;
  document.getElementById('my-total-votes').textContent = totalVotes;
  document.getElementById('my-total-comments').textContent = totalComments;
  document.getElementById('my-avg-rating').textContent = avgRating;
}

// Render ideas list
function renderMyIdeas() {
  const container = document.getElementById('my-ideas-list');
  const emptyState = document.getElementById('empty-state');
  const loadingState = document.getElementById('loading-state');
  
  loadingState.style.display = 'none';

  // Apply filters
  let filteredIdeas = [...myIdeas];
  
  const searchTerm = document.getElementById('search-my-ideas').value.toLowerCase();
  const categoryFilter = document.getElementById('filter-my-category').value;
  const stageFilter = document.getElementById('filter-my-stage').value;
  const sortMode = document.getElementById('sort-my-ideas').value;

  if (searchTerm) {
    filteredIdeas = filteredIdeas.filter(idea =>
      idea.title.toLowerCase().includes(searchTerm) ||
      idea.description.toLowerCase().includes(searchTerm)
    );
  }

  if (categoryFilter) {
    filteredIdeas = filteredIdeas.filter(idea => idea.category === categoryFilter);
  }

  if (stageFilter) {
    filteredIdeas = filteredIdeas.filter(idea => idea.stage === stageFilter);
  }

  // Sort ideas
  switch (sortMode) {
    case 'newest':
      filteredIdeas.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      break;
    case 'oldest':
      filteredIdeas.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      break;
    case 'votes':
      filteredIdeas.sort((a, b) => (b.votes || 0) - (a.votes || 0));
      break;
    case 'rating':
      filteredIdeas.sort((a, b) => b.rating - a.rating);
      break;
  }

  if (filteredIdeas.length === 0) {
    emptyState.style.display = 'block';
    container.innerHTML = '';
    return;
  }

  emptyState.style.display = 'none';
  container.innerHTML = filteredIdeas.map(idea => renderIdeaCard(idea)).join('');
}

// Render individual idea card
function renderIdeaCard(idea) {
  const screeningScore = ((idea.impact + idea.feasibility) / 2).toFixed(1);
  const createdDate = idea.createdAt ? new Date(idea.createdAt).toLocaleDateString() : 'N/A';
  
  return `
    <div class="card fade-in" style="margin-bottom: 20px;">
      <div class="card-header">
        <div>
          <h3 style="font-size: 20px; margin-bottom: 8px;">${escapeHtml(idea.title)}</h3>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <span class="badge-pro badge-primary">${idea.category}</span>
            <span class="badge-pro">${idea.stage}</span>
            <span class="badge-pro">⭐ ${idea.rating}/5</span>
            <span class="badge-pro">📊 ${screeningScore}</span>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-sm btn-secondary" onclick="editIdea('${idea.id}')">
            ✏️ Edit
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteIdea('${idea.id}')">
            🗑️ Delete
          </button>
        </div>
      </div>
      <div class="card-body">
        <p style="margin-bottom: 16px; color: var(--ink);">${escapeHtml(idea.description)}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--border);">
          <div style="display: flex; gap: 20px; font-size: 14px; color: var(--muted);">
            <span>👍 ${idea.votes || 0} votes</span>
            <span>💬 ${(idea.comments || []).length} comments</span>
            <span>📅 ${createdDate}</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <span class="badge-pro">Impact: ${idea.impact}/5</span>
            <span class="badge-pro">Feasibility: ${idea.feasibility}/5</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Show new idea modal
function showNewIdeaModal() {
  document.getElementById('new-idea-modal').style.display = 'flex';
}

// Close new idea modal
function closeNewIdeaModal() {
  document.getElementById('new-idea-modal').style.display = 'none';
  document.getElementById('new-idea-form').reset();
}

// Submit new idea
document.getElementById('new-idea-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const ideaData = {
    title: document.getElementById('new-idea-title').value.trim(),
    description: document.getElementById('new-idea-description').value.trim(),
    category: document.getElementById('new-idea-category').value,
    stage: document.getElementById('new-idea-stage').value,
    impact: parseInt(document.getElementById('new-idea-impact').value),
    feasibility: parseInt(document.getElementById('new-idea-feasibility').value),
    rating: parseInt(document.getElementById('new-idea-rating').value)
  };

  try {
    const response = await fetch('/api/ideas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': currentUser.id
      },
      body: JSON.stringify(ideaData)
    });

    if (response.ok) {
      closeNewIdeaModal();
      await fetchMyIdeas();
      showNotification('Idea created successfully!', 'success');
    } else {
      const error = await response.json();
      showNotification(error.message || 'Failed to create idea', 'error');
    }
  } catch (error) {
    console.error('Error creating idea:', error);
    showNotification('Failed to create idea', 'error');
  }
});

// Edit idea
function editIdea(id) {
  const idea = myIdeas.find(i => i.id === id);
  if (!idea) return;

  // Populate form
  document.getElementById('new-idea-title').value = idea.title;
  document.getElementById('new-idea-description').value = idea.description;
  document.getElementById('new-idea-category').value = idea.category;
  document.getElementById('new-idea-stage').value = idea.stage;
  document.getElementById('new-idea-impact').value = idea.impact;
  document.getElementById('new-idea-feasibility').value = idea.feasibility;
  document.getElementById('new-idea-rating').value = idea.rating;

  // Show modal
  showNewIdeaModal();

  // Change form submission handler
  const form = document.getElementById('new-idea-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    
    const updatedData = {
      title: document.getElementById('new-idea-title').value.trim(),
      description: document.getElementById('new-idea-description').value.trim(),
      category: document.getElementById('new-idea-category').value,
      stage: document.getElementById('new-idea-stage').value,
      impact: parseInt(document.getElementById('new-idea-impact').value),
      feasibility: parseInt(document.getElementById('new-idea-feasibility').value),
      rating: parseInt(document.getElementById('new-idea-rating').value)
    };

    try {
      const response = await fetch(`/api/ideas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        closeNewIdeaModal();
        await fetchMyIdeas();
        showNotification('Idea updated successfully!', 'success');
        
        // Reset form handler
        form.onsubmit = null;
        location.reload();
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to update idea', 'error');
      }
    } catch (error) {
      console.error('Error updating idea:', error);
      showNotification('Failed to update idea', 'error');
    }
  };
}

// Delete idea
async function deleteIdea(id) {
  if (!confirm('Are you sure you want to delete this idea?')) return;

  try {
    const response = await fetch(`/api/ideas/${id}`, {
      method: 'DELETE',
      headers: {
        'X-User-Id': currentUser.id
      }
    });

    if (response.ok) {
      await fetchMyIdeas();
      showNotification('Idea deleted successfully!', 'success');
    } else {
      const error = await response.json();
      showNotification(error.message || 'Failed to delete idea', 'error');
    }
  } catch (error) {
    console.error('Error deleting idea:', error);
    showNotification('Failed to delete idea', 'error');
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'};
    color: white;
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-lg);
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Setup filters
document.getElementById('search-my-ideas').addEventListener('input', renderMyIdeas);
document.getElementById('filter-my-category').addEventListener('change', renderMyIdeas);
document.getElementById('filter-my-stage').addEventListener('change', renderMyIdeas);
document.getElementById('sort-my-ideas').addEventListener('change', renderMyIdeas);

// Close modal on outside click
document.getElementById('new-idea-modal').addEventListener('click', (e) => {
  if (e.target.id === 'new-idea-modal') {
    closeNewIdeaModal();
  }
});

// Initialize
document.getElementById('loading-state').style.display = 'flex';
fetchMyIdeas();
