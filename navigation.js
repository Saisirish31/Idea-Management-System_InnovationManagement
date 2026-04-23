// Navigation Component with History Management
class NavigationManager {
  constructor() {
    this.currentPage = this.getPageName();
    this.initializeNavigation();
    this.setupHistoryListener();
  }

  getPageName() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    return page.replace('.html', '');
  }

  initializeNavigation() {
    // Add state to history for current page
    if (!window.history.state || !window.history.state.page) {
      window.history.replaceState({ page: this.currentPage }, '', window.location.href);
    }
  }

  navigateTo(page, addToHistory = true) {
    const url = `${page}.html`;
    if (addToHistory) {
      window.history.pushState({ page: page }, '', url);
    }
    window.location.href = url;
  }

  setupHistoryListener() {
    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.page) {
        // Browser back/forward button clicked
        window.location.href = `${event.state.page}.html`;
      }
    });
  }

  goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.navigateTo('index');
    }
  }
}

// Initialize navigation manager
const navManager = new NavigationManager();

// Render navigation menu
function renderNavigationMenu() {
  const currentUser = JSON.parse(localStorage.getItem("imsCurrentUser"));
  if (!currentUser) return '';

  const pages = [
    { name: 'Dashboard', icon: '📊', page: 'index', active: ['index', ''] },
    { name: 'My Ideas', icon: '💡', page: 'my-ideas', active: ['my-ideas'] },
    { name: 'Categories', icon: '📁', page: 'categories', active: ['categories'] },
    { name: 'Analytics', icon: '📈', page: 'analytics', active: ['analytics'] },
    { name: 'Profile', icon: '👤', page: 'profile', active: ['profile'] },
    { name: 'About', icon: 'ℹ️', page: 'about', active: ['about'] }
  ];

  const currentPage = navManager.currentPage;
  
  return pages.map(p => {
    const isActive = p.active.includes(currentPage);
    return `
      <button 
        class="nav-link ${isActive ? 'active' : ''}" 
        onclick="navManager.navigateTo('${p.page}')"
        aria-label="${p.name}">
        <span class="nav-icon">${p.icon}</span>
        <span class="nav-text">${p.name}</span>
      </button>
    `;
  }).join('');
}

// Render breadcrumbs
function renderBreadcrumbs(items) {
  if (!items || items.length === 0) return '';
  
  return `
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      ${items.map((item, index) => {
        const isLast = index === items.length - 1;
        if (isLast) {
          return `<span class="breadcrumb-current">${item.label}</span>`;
        } else if (item.page) {
          return `
            <a href="#" onclick="navManager.navigateTo('${item.page}'); return false;" class="breadcrumb-link">
              ${item.label}
            </a>
            <span class="breadcrumb-separator">›</span>
          `;
        } else {
          return `
            <span class="breadcrumb-item">${item.label}</span>
            <span class="breadcrumb-separator">›</span>
          `;
        }
      }).join('')}
    </nav>
  `;
}

// Back button component
function createBackButton(defaultPage = 'index') {
  return `
    <button class="back-button" onclick="navManager.goBack()" aria-label="Go back">
      <span class="back-icon">←</span>
      <span>Back</span>
    </button>
  `;
}

// Initialize user profile display
function updateUserProfile() {
  const currentUser = JSON.parse(localStorage.getItem("imsCurrentUser"));
  if (!currentUser) return;

  const initials = currentUser.name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const userInitialsEl = document.getElementById("user-initials");
  const userInitialsLargeEl = document.getElementById("user-initials-large");
  const userNameDisplayEl = document.getElementById("user-name-display");
  const userEmailDisplayEl = document.getElementById("user-email-display");

  if (userInitialsEl) userInitialsEl.textContent = initials;
  if (userInitialsLargeEl) userInitialsLargeEl.textContent = initials;
  if (userNameDisplayEl) userNameDisplayEl.textContent = currentUser.name;
  if (userEmailDisplayEl) userEmailDisplayEl.textContent = currentUser.email;
}

// User menu toggle
function setupUserMenu() {
  if (window.__imsUserMenuManaged) {
    return;
  }

  const userMenuBtn = document.getElementById("user-menu-btn");
  const userDropdown = document.getElementById("user-dropdown");
  const logoutBtn = document.getElementById("logout-btn");

  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", () => {
      userDropdown.classList.add("hidden");
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("imsCurrentUser");
      window.location.href = "login.html";
    });
  }

  window.__imsUserMenuManaged = true;
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    updateUserProfile();
    setupUserMenu();
  });
} else {
  updateUserProfile();
  setupUserMenu();
}
