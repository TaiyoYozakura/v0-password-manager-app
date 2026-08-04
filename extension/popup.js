/**
 * Vaultly Chrome Extension - Popup Script
 * Handles the popup UI and user interactions
 */

const VAULTLY_APP_URL = 'https://vaultly.app';
const STORAGE_KEY = 'vaultly_session';

/**
 * Initialize popup
 */
async function initializePopup() {
  const root = document.getElementById('root');
  
  try {
    // Check if user is logged in
    const session = await chrome.storage.local.get(STORAGE_KEY);
    const isLoggedIn = session[STORAGE_KEY]?.isLoggedIn || false;

    if (isLoggedIn) {
      renderDashboard(root, session[STORAGE_KEY]);
    } else {
      renderLoginPrompt(root);
    }
  } catch (error) {
    console.error('[Vaultly] Error initializing popup:', error);
    renderError(root, 'Failed to initialize extension');
  }
}

/**
 * Render login prompt
 */
function renderLoginPrompt(root) {
  root.innerHTML = `
    <div class="popup-container">
      <div class="popup-header">
        <div class="popup-logo">🔐 Vaultly</div>
      </div>
      <div class="popup-content">
        <h2>Password Manager</h2>
        <p>Secure password storage with end-to-end encryption</p>
        <div class="popup-buttons">
          <button id="login-btn" class="btn btn-primary">Open Vaultly</button>
          <button id="settings-btn" class="btn btn-secondary">Settings</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('login-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: VAULTLY_APP_URL });
    window.close();
  });

  document.getElementById('settings-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: VAULTLY_APP_URL + '/settings' });
    window.close();
  });
}

/**
 * Render dashboard with password options
 */
function renderDashboard(root, session) {
  const currentUrl = new URL(document.currentScript.src);
  const domain = currentUrl.hostname;

  root.innerHTML = `
    <div class="popup-container">
      <div class="popup-header">
        <div class="popup-logo">🔐 Vaultly</div>
        <button id="logout-btn" class="btn-icon" title="Logout">✕</button>
      </div>
      <div class="popup-content">
        <div class="domain-info">
          <strong>${domain}</strong>
        </div>
        <div class="popup-buttons">
          <button id="autofill-btn" class="btn btn-primary">Autofill Password</button>
          <button id="view-vault-btn" class="btn btn-secondary">View Vault</button>
          <button id="generate-btn" class="btn btn-secondary">Generate Password</button>
        </div>
        <div class="popup-footer">
          <small>User: ${session.email || 'Unknown'}</small>
        </div>
      </div>
    </div>
  `;

  document.getElementById('autofill-btn').addEventListener('click', () => {
    sendMessageToContent({ action: 'autofill' });
    window.close();
  });

  document.getElementById('view-vault-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: VAULTLY_APP_URL + '/passwords' });
    window.close();
  });

  document.getElementById('generate-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: VAULTLY_APP_URL + '?action=generate' });
    window.close();
  });

  document.getElementById('logout-btn').addEventListener('click', async () => {
    await chrome.storage.local.remove(STORAGE_KEY);
    initializePopup();
  });
}

/**
 * Render error state
 */
function renderError(root, message) {
  root.innerHTML = `
    <div class="popup-container">
      <div class="popup-header">
        <div class="popup-logo">🔐 Vaultly</div>
      </div>
      <div class="popup-content error">
        <p>${message}</p>
        <button id="retry-btn" class="btn btn-primary">Retry</button>
        <button id="open-vault-btn" class="btn btn-secondary">Open Vaultly</button>
      </div>
    </div>
  `;

  document.getElementById('retry-btn').addEventListener('click', initializePopup);
  document.getElementById('open-vault-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: VAULTLY_APP_URL });
    window.close();
  });
}

/**
 * Send message to content script
 */
function sendMessageToContent(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, message).catch((error) => {
        console.error('[Vaultly] Error sending message to content script:', error);
      });
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePopup);
} else {
  initializePopup();
}
