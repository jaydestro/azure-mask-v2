const isMaskedKeyName = 'isMasked';
const maskEnabledClassName = 'az-mask-enabled';
const guidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
const sensitiveDataClassName = 'azdev-sensitive';
const blurCss = 'filter: blur(10px) !important; pointer-events: none !important;';

// add CSS style to blur
const style = document.createElement('style');
style.appendChild(document.createTextNode(''));
document.head.appendChild(style);

// Core blur rule
style.sheet.insertRule(
  `.${maskEnabledClassName} .${sensitiveDataClassName} { ${blurCss} }`
);

// Azure portal Essentials blade - blur all values
style.sheet.insertRule(
  `.${maskEnabledClassName} .fxc-essentials-value { ${blurCss} }`
);
style.sheet.insertRule(
  `.${maskEnabledClassName} .fxc-essentials-item-value { ${blurCss} }`
);
style.sheet.insertRule(
  `.${maskEnabledClassName} [class*="essentials"] [class*="value"] { ${blurCss} }`
);
style.sheet.insertRule(
  `.${maskEnabledClassName} [class*="essentials"] a { ${blurCss} }`
);

// User identity
style.sheet.insertRule(
  `.${maskEnabledClassName} .fxs-avatarmenu-username { display: none !important; }`
);
style.sheet.insertRule(
  `.${maskEnabledClassName} .fxs-mecontrol-flyout { ${blurCss} }`
);
style.sheet.insertRule(
  `.${maskEnabledClassName} #mectrl_currentAccount_secondary { ${blurCss} }`
);
style.sheet.insertRule(
  `.${maskEnabledClassName} .fxs-avatarmenu-tenant-image { display: none !important; }`
);
style.sheet.insertRule(
  `.${maskEnabledClassName} .fxs-avatarmenu-tenant-image-container::after {
    content: "";
    display: inline-block;
    background: url(${chrome.runtime.getURL('icons/default-avatar.png')}) no-repeat;
    width: 28px;
    height: 28px;
    border-radius: 28px;
  }`
);

// Input boxes (keys, connection strings)
style.sheet.insertRule(
  `.${maskEnabledClassName} input.azc-bg-light { ${blurCss} }`
);

// Internal MS elements
style.sheet.insertRule(
  `.${maskEnabledClassName} a.fxs-topbar-reportbug { display: none !important; }`
);
style.sheet.insertRule(
  `.${maskEnabledClassName} div.fxs-topbar-internal { display: none !important; }`
);

// QnA Maker
style.sheet.insertRule(
  `.${maskEnabledClassName} textarea.bg-white { ${blurCss} }`
);
style.sheet.insertRule(
  `.${maskEnabledClassName} span.qna-cs-user-id { display: none !important; }`
);
style.sheet.insertRule(
  `.${maskEnabledClassName} div.directory-list-element-id { ${blurCss} }`
);

// ADF
style.sheet.insertRule(
  `.${maskEnabledClassName} .userEmail { display: none !important; }`
);
style.sheet.insertRule(
  `.${maskEnabledClassName} .user-email { ${blurCss} }`
);

// Enable/disable mask based on stored state
getStoredMaskedStatus(isMasked => {
  isMasked
    ? document.body.classList.add(maskEnabledClassName)
    : document.body.classList.remove(maskEnabledClassName);
});

// Simple scan: walk every text node, if it contains a GUID or email,
// add the blur class to its parent element
function scanForSensitiveText() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const text = walker.currentNode.nodeValue;
    if (!text) continue;
    if (guidRegex.test(text) || emailRegex.test(text)) {
      const el = walker.currentNode.parentElement;
      if (el && !el.classList.contains(sensitiveDataClassName)) {
        el.classList.add(sensitiveDataClassName);
      }
    }
  }
}

// Run scan on load, then periodically for SPA navigation
scanForSensitiveText();
setInterval(scanForSensitiveText, 1500);

// Also scan on DOM changes
const observer = new MutationObserver(scanForSensitiveText);
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
