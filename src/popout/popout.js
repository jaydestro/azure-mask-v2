let allMasksEnabled = true;

let allMasksCheckbox = document.getElementById('toggle-all-masks');
allMasksCheckbox.addEventListener('click', toggleAllMasks);

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (!tabs[0]) return;
  const tabId = tabs[0].id;
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId, allFrames: true },
      func: () => document.body.classList.contains('az-mask-enabled')
    },
    (results) => {
      if (results && results.length > 0 && results[0].result !== undefined) {
        allMasksEnabled = results[0].result;
        allMasksCheckbox.checked = allMasksEnabled;
      }
    }
  );
});

function toggleAllMasks() {
  allMasksEnabled = !allMasksEnabled;
  chrome.storage.local.set({ isMasked: allMasksEnabled }, () => {
    allMasksEnabled ? injectEnableAllMasks() : injectDisableAllMasks();
  });
}

function injectEnableAllMasks() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id, allFrames: true },
      func: () => document.body.classList.add('az-mask-enabled')
    });
  });
}

function injectDisableAllMasks() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id, allFrames: true },
      func: () => {
        document.body.classList.remove('az-mask-enabled');
        document.querySelectorAll('.azdev-sensitive').forEach(el => el.classList.remove('azdev-sensitive'));
        document.querySelectorAll('.azdev-label-checked').forEach(el => el.classList.remove('azdev-label-checked'));
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  var y = document.getElementById('index_link');
  y.addEventListener('click', openIndex);
});

function openIndex() {
  chrome.tabs.create({ active: true, url: 'https://aka.ms/publicportal' });
}
