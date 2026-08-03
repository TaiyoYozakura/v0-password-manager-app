/**
 * Vaultly Chrome Extension - Content Script
 * Injected into web pages to enable autofill and form detection
 */

const VAULTLY_APP_URL = 'https://vaultly.app';

/**
 * Listen for messages from background script and popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'autofill') {
    handleAutofill();
    sendResponse({ success: true });
  }

  if (request.action === 'fillPassword') {
    fillPasswordFields(request.username, request.password);
    sendResponse({ success: true });
  }

  if (request.action === 'detectForms') {
    const forms = detectPasswordForms();
    sendResponse({ forms });
  }
});

/**
 * Handle autofill action
 */
function handleAutofill() {
  const forms = detectPasswordForms();

  if (forms.length === 0) {
    showNotification('No password forms found on this page');
    return;
  }

  if (forms.length === 1) {
    // Single form - request password from vault
    requestPasswordFromVault();
  } else {
    // Multiple forms - show selection UI
    showFormSelector(forms);
  }
}

/**
 * Detect password forms on the page
 */
function detectPasswordForms() {
  const forms = [];
  const passwordInputs = document.querySelectorAll('input[type="password"]');

  passwordInputs.forEach((input, index) => {
    const form = input.closest('form') || input.parentElement;
    const emailInput = form?.querySelector('input[type="email"]') ||
                       form?.querySelector('input[name*="email" i]') ||
                       form?.querySelector('input[name*="user" i]');

    forms.push({
      id: index,
      passwordInput: input,
      emailInput: emailInput,
      formElement: form,
      domain: window.location.hostname,
    });
  });

  return forms;
}

/**
 * Request password from Vaultly vault via popup
 */
function requestPasswordFromVault() {
  const domain = window.location.hostname;

  // Send message to background script to open vault for this domain
  chrome.runtime.sendMessage(
    {
      action: 'openVaultForDomain',
      domain: domain,
    },
    (response) => {
      if (!response?.success) {
        showNotification('Failed to open Vaultly vault');
      }
    }
  );
}

/**
 * Fill password fields
 */
function fillPasswordFields(username, password) {
  const emailInputs = document.querySelectorAll(
    'input[type="email"], input[name*="email" i], input[name*="user" i]'
  );
  const passwordInputs = document.querySelectorAll('input[type="password"]');

  let filled = false;

  // Fill email/username
  if (emailInputs.length > 0 && username) {
    emailInputs[0].value = username;
    emailInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    emailInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
    filled = true;
  }

  // Fill password
  if (passwordInputs.length > 0 && password) {
    passwordInputs[0].value = password;
    passwordInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    passwordInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
    filled = true;
  }

  if (filled) {
    showNotification('Password filled successfully', 'success');

    // Auto-submit if there's a submit button
    const submitButton = document.querySelector(
      'button[type="submit"], button[name*="submit" i], input[type="submit"]'
    );

    if (submitButton) {
      // Show prompt before auto-submit
      setTimeout(() => {
        if (confirm('Auto-submit form?')) {
          submitButton.click();
        }
      }, 500);
    }
  }
}

/**
 * Show form selector UI (for multiple forms)
 */
function showFormSelector(forms) {
  const selectorHTML = `
    <div id="vaultly-form-selector" class="vaultly-modal-overlay">
      <div class="vaultly-modal">
        <h3>Select Password Form</h3>
        <div class="vaultly-forms-list">
          ${forms
            .map(
              (form, index) => `
            <button class="vaultly-form-item" data-index="${index}">
              <span>Form ${index + 1}</span>
              <small>${form.domain}</small>
            </button>
          `
            )
            .join('')}
        </div>
        <button id="vaultly-cancel-btn" class="vaultly-btn-cancel">Cancel</button>
      </div>
    </div>
  `;

  // Insert selector into page
  const container = document.createElement('div');
  container.innerHTML = selectorHTML;
  document.body.appendChild(container);

  // Add event listeners
  document.querySelectorAll('.vaultly-form-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      requestPasswordFromVault();
      container.remove();
    });
  });

  document.getElementById('vaultly-cancel-btn').addEventListener('click', () => {
    container.remove();
  });
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  const notificationHTML = `
    <div id="vaultly-notification" class="vaultly-notification vaultly-notification-${type}">
      <span>${message}</span>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = notificationHTML;
  document.body.appendChild(container);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    container.remove();
  }, 3000);
}

/**
 * Inject CSS styles
 */
function injectStyles() {
  const styles = `
    .vaultly-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    .vaultly-modal {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      min-width: 300px;
      max-width: 500px;
    }

    .vaultly-modal h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }

    .vaultly-forms-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    .vaultly-form-item {
      padding: 12px 16px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      font-size: 14px;
    }

    .vaultly-form-item:hover {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .vaultly-form-item small {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }

    .vaultly-btn-cancel {
      width: 100%;
      padding: 10px 16px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: white;
      color: #374151;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .vaultly-btn-cancel:hover {
      background: #f3f4f6;
    }

    .vaultly-notification {
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 16px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      z-index: 999999;
      animation: slideIn 0.3s ease-out;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .vaultly-notification-info {
      background: #dbeafe;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }

    .vaultly-notification-success {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }

    .vaultly-notification-error {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;

  const style = document.createElement('style');
  style.textContent = styles;
  document.head.appendChild(style);
}

// Initialize on page load
injectStyles();
console.log('[Vaultly] Content script loaded');
