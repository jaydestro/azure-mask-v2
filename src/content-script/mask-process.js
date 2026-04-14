const isMaskedKeyName = 'isMasked';
const maskEnabledClassName = 'az-mask-enabled';
const sensitiveDataRegex = /^\s*([a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12})\s*$/i;
const guidContainsRegex = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;
/* ** Original regex prior to 2019-04-18 **
 * const sensitiveDataRegex = /^\s*([a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12})|((([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})))\s*$/;
 *
 */
const sensitiveDataClassName = 'azdev-sensitive';
const blurCss = 'filter: blur(10px); pointer-events: none;';
const tagNamesToMatch = ['DIV', 'SPAN', 'A', 'TD', 'P']; // uppercase

// add CSS style to blur
const style = document.createElement('style');
style.appendChild(document.createTextNode(''));
document.head.appendChild(style);

style.sheet.insertRule(
  `.${maskEnabledClassName} .azdev-sensitive { ${blurCss} }`
);
style.sheet.insertRule(
  `.${maskEnabledClassName} .fxs-avatarmenu-username { display: none }`
); // hide name instead of blurring
style.sheet.insertRule(
  `.${maskEnabledClassName} input.azc-bg-light { ${blurCss} }`
); // input boxes used for keys, connection strings, etc
style.sheet.insertRule(
  `.${maskEnabledClassName} a.fxs-topbar-reportbug { display:none; }`
); // report a bug button (MS internal only)
style.sheet.insertRule(
  `.${maskEnabledClassName} div.fxs-topbar-internal { display:none; }`
); // "Preview" element in top navigation bar (MS internal only)
style.sheet.insertRule(
  `.${maskEnabledClassName} .fxs-mecontrol-flyout { ${blurCss} }`
); // user account menu
style.sheet.insertRule(
  `.${maskEnabledClassName} #mectrl_currentAccount_secondary { ${blurCss} }`
); // user account dropdown email address
style.sheet.insertRule(
  `.${maskEnabledClassName} .fxs-avatarmenu-tenant-image { display:none; }`
); // user avatar
style.sheet.insertRule(
  `.${maskEnabledClassName} .fxs-avatarmenu-tenant-image-container::after {
    content: "";
    display: inline-block;
    background: url(${chrome.runtime.getURL('icons/default-avatar.png')}) no-repeat;
    width: 28px;
    height: 28px;
    border-radius: 28px;
  }`
); // replacement avatar (bundled locally)
style.sheet.insertRule(
  `.${maskEnabledClassName} textarea.bg-white { ${blurCss} }`
); // deployment box in (QnA maker portal)
style.sheet.insertRule(
  `.${maskEnabledClassName} span.qna-cs-user-id { display: none }`
); // hide user id in profile side menu (QnA maker portal)
style.sheet.insertRule(
  `.${maskEnabledClassName} div.directory-list-element-id { ${blurCss} }`
); // profile side menu in (QnA maker portal)
style.sheet.insertRule(
  `.${maskEnabledClassName} .userEmail { display:none; }`
); // hide name instead of blurring (ADF)
style.sheet.insertRule(
  `.${maskEnabledClassName} .user-email { ${blurCss} }`
); // user account dropdown email address (ADF)

getStoredMaskedStatus(isMasked => {
  isMasked
    ? document.body.classList.add(maskEnabledClassName)
    : document.body.classList.remove(maskEnabledClassName);
});

// Finds the smallest element that directly owns a GUID text node
function markGuidElements(root) {
  if (!root) return;
  const sel = tagNamesToMatch.join(',');

  // 1) Check all target elements in this DOM tree
  let elements;
  try {
    elements = root.querySelectorAll ? root.querySelectorAll('*') : [];
  } catch (e) { return; }

  for (const el of elements) {
    // Traverse into shadow roots
    if (el.shadowRoot) {
      markGuidElements(el.shadowRoot);
    }

    if (!el.classList || el.classList.contains(sensitiveDataClassName)) continue;

    // Check each direct child text node of this element
    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE && guidContainsRegex.test(child.textContent)) {
        el.classList.add(sensitiveDataClassName);
        break;
      }
    }
  }
}

function fullScan() {
  markGuidElements(document.body);

  // Also scan all iframes we can access
  try {
    const iframes = document.querySelectorAll('iframe');
    for (const iframe of iframes) {
      try {
        if (iframe.contentDocument && iframe.contentDocument.body) {
          markGuidElements(iframe.contentDocument.body);
        }
      } catch (e) { /* cross-origin, skip */ }
    }
  } catch (e) { /* skip */ }
}

fullScan();

// Aggressive initial scanning for SPA lazy rendering, then slow down
let scanCount = 0;
const initialScan = setInterval(() => {
  fullScan();
  scanCount++;
  if (scanCount >= 20) { // 10 seconds of fast scanning
    clearInterval(initialScan);
    setInterval(fullScan, 3000); // then every 3s
  }
}, 500);

// add class to elements that are added to DOM later
const observer = new MutationObserver(() => {
  fullScan();
});
const config = {
  attributes: false,
  characterData: true,
  childList: true,
  subtree: true
};
observer.observe(document.body, config);

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
