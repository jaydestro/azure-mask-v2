const isMaskedKeyName = 'isMasked';
const maskEnabledClassName = 'az-mask-enabled';
const guidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
const sensitiveDataClassName = 'azdev-sensitive';
const blurCss = 'filter: blur(10px) !important; pointer-events: none !important;';

// Labels in the Essentials blade whose adjacent value should be blurred
const sensitiveLabels = ['subscription', 'subscription id', 'resource group'];

// Inject CSS rules
const css = `
  .${maskEnabledClassName} .${sensitiveDataClassName} { ${blurCss} }
  .${maskEnabledClassName} .fxs-avatarmenu-username { display: none !important; }
  .${maskEnabledClassName} .fxs-mecontrol-flyout { ${blurCss} }
  .${maskEnabledClassName} #mectrl_currentAccount_secondary { ${blurCss} }
  .${maskEnabledClassName} .fxs-avatarmenu-tenant-image { display: none !important; }
  .${maskEnabledClassName} .fxs-avatarmenu-tenant-image-container::after {
    content: ""; display: inline-block;
    background: url(${chrome.runtime.getURL('icons/default-avatar.png')}) no-repeat;
    width: 28px; height: 28px; border-radius: 28px;
  }
  .${maskEnabledClassName} input.azc-bg-light { ${blurCss} }
  .${maskEnabledClassName} a.fxs-topbar-reportbug { display: none !important; }
  .${maskEnabledClassName} div.fxs-topbar-internal { display: none !important; }
  .${maskEnabledClassName} textarea.bg-white { ${blurCss} }
  .${maskEnabledClassName} span.qna-cs-user-id { display: none !important; }
  .${maskEnabledClassName} div.directory-list-element-id { ${blurCss} }
  .${maskEnabledClassName} .userEmail { display: none !important; }
  .${maskEnabledClassName} .user-email { ${blurCss} }
`;
const styleEl = document.createElement('style');
styleEl.textContent = css;
document.head.appendChild(styleEl);

// Enable/disable mask based on stored state
getStoredMaskedStatus(isMasked => {
  isMasked
    ? document.body.classList.add(maskEnabledClassName)
    : document.body.classList.remove(maskEnabledClassName);
});

// 1) Walk text nodes — blur parent if it contains a GUID or email
function scanTextNodes() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const text = walker.currentNode.nodeValue;
    if (!text || text.trim().length < 5) continue;
    if (guidRegex.test(text) || emailRegex.test(text)) {
      const el = walker.currentNode.parentElement;
      if (el && !el.classList.contains(sensitiveDataClassName)) {
        el.classList.add(sensitiveDataClassName);
      }
    }
  }
}

// 2) Find Essentials blade labels (Subscription, Subscription ID, Resource group)
//    and blur the value element next to them
function scanEssentialsLabels() {
  const allElements = document.querySelectorAll('div, span, td, th, dt, dd, li, label');
  for (const el of allElements) {
    if (el.classList.contains('azdev-label-checked')) continue;
    // Only check leaf-ish text
    const text = el.textContent.trim().toLowerCase().replace(/\s*\(.*\)/, '');
    if (!sensitiveLabels.includes(text)) continue;
    el.classList.add('azdev-label-checked');

    // Try to find the sibling value: next element sibling, or parent's next sibling
    let valueEl = el.nextElementSibling;
    if (!valueEl && el.parentElement) {
      valueEl = el.parentElement.nextElementSibling;
    }
    if (!valueEl && el.parentElement && el.parentElement.parentElement) {
      valueEl = el.parentElement.parentElement.nextElementSibling;
    }
    if (valueEl && !valueEl.classList.contains(sensitiveDataClassName)) {
      valueEl.classList.add(sensitiveDataClassName);
    }
  }
}

function fullScan() {
  scanTextNodes();
  scanEssentialsLabels();
}

// Run immediately, then periodically for SPA navigation
fullScan();
setInterval(fullScan, 2000);

// Also run on DOM changes
const observer = new MutationObserver(fullScan);
observer.observe(document.body, {
  childList: true,
  characterData: true,
  subtree: true
});

function getStoredMaskedStatus(callback) {
  chrome.storage.local.get(isMaskedKeyName, items => {
    const { isMasked } = items;
    if (typeof isMasked !== 'boolean') {
      // default to true
      chrome.storage.local.set({ [isMaskedKeyName]: true }, () =>
        callback(true)
      );
    } else {
      callback(isMasked);
    }
  });
}
