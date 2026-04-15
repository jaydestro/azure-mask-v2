const isMaskedKeyName = 'isMasked';
const maskEnabledClassName = 'az-mask-enabled';
const sensitiveDataRegex = /^([a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12})$/i;
const sensitiveDataClassName = 'azdev-sensitive';
const sensitiveDataMarkerAttribute = 'data-az-mask-sensitive';
const blurCss = 'filter: blur(10px) !important; pointer-events: none !important;';
const tagNamesToMatch = ['DIV', 'SPAN', 'A', 'TD', 'P', 'LI']; // uppercase

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

// Check if element text matches sensitive data patterns
function isSensitive(text) {
  const t = text.trim();
  // GUID exact match
  if (sensitiveDataRegex.test(t)) return true;
  // Email match
  if (/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(t)) return true;
  return false;
}

// Check if an element has a direct child text node containing sensitive data.
// This avoids false negatives when textContent includes descendants
// (e.g. Fluent UI TooltipHost renders the GUID twice: once visible, once in a hidden div).
function hasDirectSensitiveText(el) {
  for (const child of el.childNodes) {
    if (child.nodeType === Node.TEXT_NODE && isSensitive(child.nodeValue)) {
      return true;
    }
  }
  return false;
}

function getDirectText(el) {
  let directText = '';
  for (const child of el.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      directText += child.nodeValue;
    }
  }
  return directText.trim();
}

function normalizeText(text) {
  return (text || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s*\(.*\)$/, '');
}

function isVisible(el) {
  return !el.hidden && el.getClientRects().length > 0;
}

function markSensitiveElement(el) {
  if (!el || !isVisible(el)) {
    return;
  }

  el.classList.add(sensitiveDataClassName);
  el.setAttribute(sensitiveDataMarkerAttribute, '1');
  el.style.setProperty('filter', 'blur(10px)', 'important');
  el.style.setProperty('pointer-events', 'none', 'important');
}

function firstMatchingElement(root, predicate) {
  const candidates = [root, ...root.querySelectorAll('a, div, span, td, p, li')];
  for (const candidate of candidates) {
    if (candidate.nodeType !== Node.ELEMENT_NODE) {
      continue;
    }
    if (!isVisible(candidate)) {
      continue;
    }
    if (predicate(candidate)) {
      return candidate;
    }
  }
  return null;
}

function findAdjacentValue(labelEl, predicate) {
  const labelTexts = new Set(['subscription', 'subscription id', 'resource group']);
  const bases = [
    labelEl,
    labelEl.parentElement,
    labelEl.parentElement && labelEl.parentElement.parentElement,
    labelEl.parentElement &&
      labelEl.parentElement.parentElement &&
      labelEl.parentElement.parentElement.parentElement
  ].filter(Boolean);

  for (const base of bases) {
    const ordered = Array.from(
      base.querySelectorAll('a, div, span, td, th, dt, dd, p, li, label')
    );
    const startIndex = ordered.indexOf(labelEl);
    if (startIndex !== -1) {
      for (let index = startIndex + 1; index < ordered.length; index++) {
        const candidate = ordered[index];
        if (!isVisible(candidate)) {
          continue;
        }

        const candidateLabel = normalizeText(
          getDirectText(candidate) || candidate.textContent
        );
        if (labelTexts.has(candidateLabel)) {
          break;
        }

        if (!labelEl.contains(candidate) && predicate(candidate)) {
          return candidate;
        }
      }
    }
  }

  return null;
}

function findValueForLabel(labelText, predicate) {
  const candidates = document.querySelectorAll('div, span, td, th, dt, dd, label');
  for (const el of candidates) {
    const ownText = normalizeText(getDirectText(el) || el.textContent);
    if (ownText !== labelText) {
      continue;
    }

    const adjacentMatch = findAdjacentValue(el, predicate);
    if (adjacentMatch) {
      return adjacentMatch;
    }
  }

  return null;
}

function blurImportantPortalFields() {
  Array.from(
    document.querySelectorAll('.ms-TooltipHost[role="none"], div[role="none"], span[role="none"]')
  )
    .filter(hasDirectSensitiveText)
    .forEach(markSensitiveElement);

  const subscriptionIdEl = findValueForLabel(
    'subscription id',
    candidate =>
      candidate.matches('.ms-TooltipHost[role="none"], div[role="none"], span[role="none"]') &&
      hasDirectSensitiveText(candidate)
  );
  if (subscriptionIdEl) {
    markSensitiveElement(subscriptionIdEl);
  }

  const subscriptionNameEl = findValueForLabel(
    'subscription',
    candidate =>
      candidate.tagName === 'A' &&
      /\/subscriptions\/[0-9a-f]{8}-[0-9a-f]{4}/i.test(candidate.href || '')
  );
  if (subscriptionNameEl) {
    markSensitiveElement(subscriptionNameEl);
  }

  const resourceGroupEl = findValueForLabel(
    'resource group',
    candidate =>
      candidate.tagName === 'A' &&
      /\/resourceGroups\//i.test(candidate.href || '')
  );
  if (resourceGroupEl) {
    markSensitiveElement(resourceGroupEl);
  }
}

// add class to elements already on the screen
Array.from(document.querySelectorAll(tagNamesToMatch.join()))
  .filter(e => shouldCheckContent(e) && (isSensitive(e.textContent) || hasDirectSensitiveText(e)))
  .forEach(markSensitiveElement);

blurImportantPortalFields();

// add class to elements that are added to DOM later
const observer = new MutationObserver(mutations => {
  mutations
    .filter(
      m =>
        shouldCheckContent(m.target, m.type) &&
        (isSensitive(m.target.textContent.trim()) || (m.target.childNodes && hasDirectSensitiveText(m.target)))
    )
    .forEach(m => {
      const node = m.type === 'characterData' ? m.target.parentNode : m.target;
      if (node.classList) {
        markSensitiveElement(node);
      }
    });

  blurImportantPortalFields();
});
const config = {
  attributes: false,
  characterData: true,
  childList: true,
  subtree: true
};
observer.observe(document.body, config);

// Periodic re-scan for SPA navigation (portal dynamically renders blades)
setInterval(() => {
  Array.from(document.querySelectorAll(tagNamesToMatch.join()))
    .filter(e => !e.classList.contains(sensitiveDataClassName) && shouldCheckContent(e) && (isSensitive(e.textContent) || hasDirectSensitiveText(e)))
    .forEach(markSensitiveElement);
  blurImportantPortalFields();
}, 2000);

function shouldCheckContent(target, mutationType) {
  return (
    mutationType === 'characterData' ||
    (target && tagNamesToMatch.some(tn => tn === target.tagName))
  );
}

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
