/**
 * Vaultly Chrome Extension - Background Service Worker
 * Handles extension lifecycle, messaging, and storage
 */

const VAULTLY_APP_URL = 'https://vaultly.app';
const STORAGE_KEY = 'vaultly_session';
const CONTEXT_MENU_ID = 'vaultly-autofill';

/**
 * Initialize extension on install or update
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open welcome page on first install
    chrome.tabs.create({ url: VAULTLY_APP_URL + '/welcome?from=extension' });
  } else if (details.reason === 'update') {
    console.log('[Vaultly] Extension updated to version 2.0.0');
  }

  // Create context menu items
  createContextMenus();
});

/**
 * Create context menus
 */
function createContextMenus() {
  // Remove existing menus
  chrome.contextMenus.removeAll(() => {
    // Add autofill menu
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: 'Autofill with Vaultly',
      contexts: ['editable'],
    });

    // Add open vault menu
    chrome.contextMenus.create({
      id: 'vaultly-open-vault',
      title: 'Open Vaultly Vault',
      contexts: ['all'],
    });

    // Add generate password menu
    chrome.contextMenus.create({
      id: 'vaultly-generate',
      title: 'Generate Password',
      contexts: ['all'],
    });
  });
}

/**
 * Handle context menu clicks
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case CONTEXT_MENU_ID:
      sendMessageToContent(tab.id, { action: 'autofill' });
      break;
    case 'vaultly-open-vault':
      chrome.tabs.create({ url: VAULTLY_APP_URL + '/passwords' });
      break;
    case 'vaultly-generate':
      chrome.tabs.create({ url: VAULTLY_APP_URL + '?action=generate' });
      break;
  }
});

/**
 * Handle messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSession') {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      sendResponse(result[STORAGE_KEY] || null);
    });
    return true; // Keep channel open for async response
  }

  if (request.action === 'setSession') {
    chrome.storage.local.set({ [STORAGE_KEY]: request.data }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'clearSession') {
    chrome.storage.local.remove(STORAGE_KEY, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'fillPassword') {
    sendMessageToContent(sender.tab.id, {
      action: 'fillPassword',
      username: request.username,
      password: request.password,
    });
    sendResponse({ success: true });
    return true;
  }
});

/**
 * Send message to content script
 */
function sendMessageToContent(tabId, message) {
  chrome.tabs.sendMessage(tabId, message).catch((error) => {
    console.error('[Vaultly] Error sending message to content script:', error);
  });
}

/**
 * Listen for updates from Vaultly app
 */
chrome.webRequest?.onBeforeRequest.addListener(
  (details) => {
    // Handle auth updates from app
    if (details.url.includes('vaultly.app') && details.url.includes('auth')) {
      console.log('[Vaultly] Auth event detected');
    }
  },
  { urls: ['*://vaultly.app/*'] }
);

/**
 * Handle tab updates
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
  // Update badge when switching tabs
  updateBadge(activeInfo.tabId);
});

/**
 * Update extension badge
 */
function updateBadge(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    if (tab && tab.url) {
      const url = new URL(tab.url);
      const domain = url.hostname;

      // Set badge color
      chrome.action.setBadgeBackgroundColor({ color: '#3b82f6' });

      // You can set a badge count or text here if needed
      // chrome.action.setBadgeText({ text: '1' });
    }
  });
}

console.log('[Vaultly] Background service worker initialized');
