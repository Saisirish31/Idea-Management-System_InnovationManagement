// Authentication Check
const currentUser = JSON.parse(localStorage.getItem("imsCurrentUser"));
if (!currentUser) {
  window.location.href = "login.html";
}

// Initialize navigation
document.getElementById('nav-menu').innerHTML = renderNavigationMenu();
document.getElementById('breadcrumbs-container').innerHTML = renderBreadcrumbs([
  { label: 'Dashboard', page: 'index' },
  { label: 'Analytics' }
]);

let ideas = [];

// Fetch all ideas
async function fetchAnalyticsData() {
  try {
    const response = await fetch("/api/ideas");
    ideas = await response.json();
    
    updateOverviewStats();
    renderCategoryChart();
    renderStageChart();
    renderTopVotedIdeas();
    renderTopContributors();
    renderRatingChart();
    renderActivityTimeline();
  } catch (error) {
    console.error("Error fetching analytics data:", error);
  }
}

// Update overview statistics
function updateOverviewStats() {
  const totalIdeas = ideas.length;
  const contributors = new Set(ideas.map(i => i.createdBy?.id).filter(Boolean)).size;
  const totalVotes = ideas.reduce((sum, idea) => sum + (idea.votes || 0), 0);
  const totalComments = ideas.reduce((sum, idea) => sum + (idea.comments || []).length, 0);

  document.getElementById('total-ideas').textContent = totalIdeas;
  document.getElementById('active-contributors').textContent = contributors;
  document.getElementById('total-votes').textContent = totalVotes;
  document.getElementById('total-comments').textContent = totalComments;
}

// Render category distribution chart
function renderCategoryChart() {
  const categories = { Product: 0, Process: 0, Marketing: 0, Social: 0 };
  ideas.forEach(idea => {
    if (categories.hasOwnProperty(idea.category)) {
      categories[idea.category]++;
    }
  });

  const total = ideas.length || 1;
  const colors = {
    Product: '#2551d7',
    Process: '#10b981',
    Marketing: '#f59e0b',
    Social: '#ef4444'
  };

  const html = Object.entries(categories).map(([category, count]) => {
    const percentage = ((count / total) * 100).toFixed(1);
    return `
      <div style="flex: 1; min-width: 200px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-weight: 600; color: var(--ink);">${category}</span>
          <span style="color: var(--muted);">${count} (${percentage}%)</span>
        </div>
        <div style="height: 32px; background: var(--bg); border-radius: 8px; overflow: hidden; position: relative;">
          <div style="height: 100%; width: ${percentage}%; background: ${colors[category]}; transition: width 0.5s ease;"></div>
          <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: 700; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${percentage}%</span>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('category-chart').innerHTML = html;
}

// Render stage distribution chart
function renderStageChart() {
  const stages = {
    'Idea': { count: 0, color: '#6366f1' },
    'Screening': { count: 0, color: '#3b82f6' },
    'Prototype': { count: 0, color: '#10b981' },
    'Implementation': { count: 0, color: '#f59e0b' }
  };

  ideas.forEach(idea => {
    if (stages.hasOwnProperty(idea.stage)) {
      stages[idea.stage].count++;
    }
  });

  const total = ideas.length || 1;
  const maxCount = Math.max(...Object.values(stages).map(s => s.count), 1);

  const html = Object.entries(stages).map(([stage, data]) => {
    const percentage = ((data.count / total) * 100).toFixed(1);
    const barHeight = (data.count / maxCount) * 100;
    
    return `
      <div style="flex: 1; text-align: center;">
        <div style="height: 200px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 16px;">
          <div style="width: 80%; background: linear-gradient(to top, ${data.color}, ${data.color}99); border-radius: 8px 8px 0 0; height: ${barHeight}%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; padding: 12px; transition: height 0.5s ease;">
            <span style="font-size: 24px; font-weight: 700; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">${data.count}</span>
          </div>
        </div>
        <div style="font-weight: 700; color: var(--ink); margin-bottom: 4px;">${stage}</div>
        <div style="color: var(--muted); font-size: 14px;">${percentage}% of total</div>
      </div>
    `;
  }).join('');

  document.getElementById('stage-chart').innerHTML = `
    <div style="display: flex; gap: 20px;">${html}</div>
  `;
}

// Render top voted ideas
function renderTopVotedIdeas() {
  const topIdeas = [...ideas]
    .sort((a, b) => (b.votes || 0) - (a.votes || 0))
    .slice(0, 5);

  if (topIdeas.length === 0) {
    document.getElementById('top-voted-ideas').innerHTML = '<p style="color: var(--muted);">No ideas yet</p>';
    return;
  }

  const html = topIdeas.map((idea, index) => `
    <div style="display: flex; align-items: center; gap: 16px; padding: 12px; border-radius: var(--radius-sm); background: var(--bg); margin-bottom: 12px;">
      <div style="width: 32px; height: 32px; background: linear-gradient(135deg, var(--primary), var(--primary-light)); color: white; border-radius: 50%; display: grid; place-items: center; font-weight: 700;">
        ${index + 1}
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 600; color: var(--ink); margin-bottom: 4px;">${escapeHtml(idea.title)}</div>
        <div style="font-size: 13px; color: var(--muted);">${idea.category} • ${idea.stage}</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 20px; font-weight: 700; color: var(--primary);">${idea.votes || 0}</div>
        <div style="font-size: 12px; color: var(--muted);">votes</div>
      </div>
    </div>
  `).join('');

  document.getElementById('top-voted-ideas').innerHTML = html;
}

// Render top contributors
function renderTopContributors() {
  const contributorStats = {};
  
  ideas.forEach(idea => {
    if (idea.createdBy && idea.createdBy.id) {
      const id = idea.createdBy.id;
      if (!contributorStats[id]) {
        contributorStats[id] = {
          name: idea.createdBy.name || 'Unknown',
          email: idea.createdBy.email || '',
          count: 0,
          votes: 0
        };
      }
      contributorStats[id].count++;
      contributorStats[id].votes += (idea.votes || 0);
    }
  });

  const topContributors = Object.values(contributorStats)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (topContributors.length === 0) {
    document.getElementById('top-contributors').innerHTML = '<p style="color: var(--muted);">No contributors yet</p>';
    return;
  }

  const html = topContributors.map((contributor, index) => {
    const initials = contributor.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    
    return `
      <div style="display: flex; align-items: center; gap: 16px; padding: 12px; border-radius: var(--radius-sm); background: var(--bg); margin-bottom: 12px;">
        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981, #34d399); color: white; border-radius: 50%; display: grid; place-items: center; font-weight: 700;">
          ${initials}
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 600; color: var(--ink); margin-bottom: 2px;">${escapeHtml(contributor.name)}</div>
          <div style="font-size: 12px; color: var(--muted);">${escapeHtml(contributor.email)}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 18px; font-weight: 700; color: var(--success);">${contributor.count}</div>
          <div style="font-size: 11px; color: var(--muted);">${contributor.votes} votes</div>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('top-contributors').innerHTML = html;
}

// Render rating distribution chart
function renderRatingChart() {
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  ideas.forEach(idea => {
    if (idea.rating >= 1 && idea.rating <= 5) {
      ratingCounts[idea.rating]++;
    }
  });

  const maxCount = Math.max(...Object.values(ratingCounts), 1);

  const html = Object.entries(ratingCounts).map(([rating, count]) => {
    const percentage = ideas.length > 0 ? ((count / ideas.length) * 100).toFixed(1) : 0;
    const barWidth = (count / maxCount) * 100;
    
    return `
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
        <div style="width: 80px; font-weight: 600; color: var(--ink);">
          ${'⭐'.repeat(parseInt(rating))} ${rating}
        </div>
        <div style="flex: 1; height: 32px; background: var(--bg); border-radius: 8px; overflow: hidden; position: relative;">
          <div style="height: 100%; width: ${barWidth}%; background: linear-gradient(90deg, #f59e0b, #fbbf24); transition: width 0.5s ease;"></div>
          <span style="position: absolute; top: 50%; left: 12px; transform: translateY(-50%); font-weight: 600; color: var(--ink); font-size: 14px;">${count} ideas (${percentage}%)</span>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('rating-chart').innerHTML = html;
}

// Render activity timeline
function renderActivityTimeline() {
  const sortedIdeas = [...ideas]
    .filter(idea => idea.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  if (sortedIdeas.length === 0) {
    document.getElementById('activity-timeline').innerHTML = '<p style="color: var(--muted);">No activity yet</p>';
    return;
  }

  const html = sortedIdeas.map(idea => {
    const date = new Date(idea.createdAt);
    const timeAgo = getTimeAgo(date);
    const creatorName = idea.createdBy?.name || 'Unknown';
    
    return `
      <div style="display: flex; gap: 16px; padding: 16px; border-left: 3px solid var(--primary); margin-bottom: 16px; background: var(--bg); border-radius: 0 8px 8px 0;">
        <div style="min-width: 100px;">
          <div style="font-size: 13px; color: var(--muted);">${timeAgo}</div>
          <div style="font-size: 12px; color: var(--muted);">${date.toLocaleDateString()}</div>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 600; color: var(--ink); margin-bottom: 4px;">${escapeHtml(idea.title)}</div>
          <div style="font-size: 14px; color: var(--muted); margin-bottom: 8px;">Created by ${escapeHtml(creatorName)}</div>
          <div style="display: flex; gap: 8px;">
            <span class="badge-pro badge-primary">${idea.category}</span>
            <span class="badge-pro">${idea.stage}</span>
            <span class="badge-pro">👍 ${idea.votes || 0}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('activity-timeline').innerHTML = html;
}

// Get time ago string
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'Just now';
}

// Export report
function exportReport() {
  const report = {
    generatedAt: new Date().toISOString(),
    generatedBy: currentUser.name,
    summary: {
      totalIdeas: ideas.length,
      contributors: new Set(ideas.map(i => i.createdBy?.id).filter(Boolean)).size,
      totalVotes: ideas.reduce((sum, idea) => sum + (idea.votes || 0), 0),
      totalComments: ideas.reduce((sum, idea) => sum + (idea.comments || []).length, 0)
    },
    ideas: ideas
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  showNotification('Report exported successfully!', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? 'var(--success)' : 'var(--primary)'};
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

// Initialize
fetchAnalyticsData();
