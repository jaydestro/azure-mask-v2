# Azure Mask Changelog

## 2.0.0 (2026-04-14)

### Breaking

- Migrated from Manifest V2 to Manifest V3 (MV2 extensions are no longer supported by Chrome or Edge)
- Forked from [clarkio/azure-mask](https://github.com/clarkio/azure-mask) to [jaydestro/azure-mask-v2](https://github.com/jaydestro/azure-mask-v2)
- Removed all deprecated pre-2.0.0 extension packages

### Fixed

- Resolved `CRX_REQUIRED_PROOF_MISSING` error caused by MV2 deprecation
- Replaced deprecated `browser_action` with `action`
- Replaced deprecated `chrome.tabs.executeScript()` with `chrome.scripting.executeScript()` API
- Moved host URL patterns from `permissions` to `host_permissions` per MV3 requirements
- Added `scripting` permission required by the new `chrome.scripting` API

### Changed

- Extension is now fully compatible with both Chrome and Microsoft Edge (Chromium)
- Version bumped to 2.0.0 to reflect the MV3 migration

---

## Legacy versions (from [clarkio/azure-mask](https://github.com/clarkio/azure-mask))

## 1.1.10 (2021-08-07)

### Added

- Support for Azure Data Portal (adf.azure.com) (Thanks to @jiyongseong in [#70](https://github.com/clarkio/azure-mask/pull/70) and [#71](https://github.com/clarkio/azure-mask/pull/71))

### Fixed

- Support for azure.us (Thanks to @husamhilal in [#72](https://github.com/clarkio/azure-mask/pull/72))

## 1.1.8 (2021-04-17)

### Added

- Hiding of sensitive data in QnA maker portal (Thanks to @taqabubaker in [#63](https://github.com/clarkio/azure-mask/pull/63))

## 1.1.7 (2021-04-17)

### Added

- Email masking in account/user drop-down menu (Thanks to @
  mhdbouk in [#65](https://github.com/clarkio/azure-mask/pull/65))

## 1.1.6 (2021-04-17)

### Added

- Avatar masking (Thanks to @sinedied in [#67](https://github.com/clarkio/azure-mask/pull/67))

## 1.1.5 (2019-04-22)

### Changed

- Name to "Az Mask" as "Azure Mask" was taken down due to trademark infringement ("Azure")
- Regex used to find sensitive data to the simplified version looking for text with a signature following the Subscription ID pattern

### Added

- Ability to hide tooltips/title attribute for masked elements using css `pointer-events: none;`

<a name="1.1.4"></a>

## 1.1.4 (2018-08-15)

### Added

- Add support for government portal URLs [#44](https://github.com/clarkio/azure-mask/pull/44)
