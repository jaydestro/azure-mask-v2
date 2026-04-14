# Privacy Policy — Az Mask

**Last updated:** April 14, 2026

## Overview

Az Mask is a browser extension that masks sensitive information (such as GUIDs, subscription IDs, and email addresses) displayed in the Azure portal. It is designed to help users safely share their screen or record demos without exposing personal or account-level details.

## Data Collection

Az Mask does **not** collect, transmit, store, or share any personal data, browsing history, or usage analytics. The extension has no server-side component and makes no network requests.

## Local Storage

The extension uses `chrome.storage.local` solely to persist the user's mask toggle preference (on/off). This data never leaves your device.

## Permissions

| Permission | Purpose |
|---|---|
| `activeTab` | Access the current tab to toggle mask CSS classes |
| `storage` | Save the mask on/off toggle state locally |
| `scripting` | Inject mask toggle commands into the active tab |
| `host_permissions` | Restrict the extension to run only on Azure portal domains |

## Host Permissions

The extension only activates on the following domains:

- `*.portal.azure.com`
- `portal.azure.us`
- `portal.azure.cn`
- `functions.azure.com`
- `*.qnamaker.ai`
- `adf.azure.com`
- `ms-adf.azure.com`

It does not run on any other websites.

## Third Parties

Az Mask does not integrate with any third-party services, analytics platforms, or advertising networks.

## Changes

If this privacy policy is updated, the changes will be reflected in this file with an updated date.

## Contact

For questions about this privacy policy, please open an issue at [github.com/jaydestro/azure-mask-v2](https://github.com/jaydestro/azure-mask-v2/issues).
