<div align="center">
  
# Azure Mask (Az Mask)

</div>

> Originally created and maintained by [@clarkio](https://github.com/clarkio). This fork is maintained by [@jaydestro](https://github.com/jaydestro) to ensure the extension continues to work with modern browsers after the Manifest V2 deprecation.

This is a browser extension that will do its best to find and mask GUIDs (such as Subscription IDs), email addresses, keys, and connection strings with a blur. The intention of the extension is to make it easier to do screen recordings without revealing sensitive, personal, account information that may show up on screen. It will only run and apply against Azure portal URLs ([see manifest.json for specifics](https://github.com/jaydestro/azure-mask-v2/blob/master/src/manifest.json#L17)). It's available in Chromium based browsers and Firefox.

![screen shot](azure-mask-screen-shot.png)

## Features

* Blurs GUIDs (such as Subscription IDs)
* Blurs your account email
* Hides the "Report a Bug" button (if found)
* Toggle the mask on/off and store this state
* Apply the mask (if enabled) after Document Object Model (DOM) mutations

## Install the Extension

### Chrome / Edge

#### From Package

1. Go to [Releases](https://github.com/jaydestro/azure-mask-v2/releases) and download the latest `.zip` file (e.g. [`az-mask-2.0.0.zip`](https://github.com/jaydestro/azure-mask-v2/releases/download/v2.0.0/az-mask-2.0.0.zip))
2. Go to the folder you downloaded the zip and extract it.
3a. (Chrome) In Chrome go to [chrome://extensions](chrome://extensions)
3b. (Edge) In Edge go to [edge://extensions](edge://extensions)
4. Enable "Developer mode" (top-right in Chrome, bottom-left in Edge)
5. Click "Load unpacked"
6. Select the folder you extracted in step 2
7. Confirm any prompts

#### From Source

1 - `git clone git@github.com:jaydestro/azure-mask-v2.git`

2a - (Chrome) In Chrome, navigate to `chrome://extensions/`

2b - (Edge) In Edge, navigate to `edge://extensions/`

3a - (Chrome) In Chrome, check the "Developer mode" option in the top-right corner

3b - (Edge) In Edge, enable the "Developer mode" toggle on the bottom-left corner

4 - Click the "Load unpacked extension" button

5 - Navigate to where you cloned this repo and then choose `/azure-mask/src`


After following these steps you should now see the new extension icon in Chrome/Edge.

### Firefox

1. In Firefox go to [Az Mask add-on](https://addons.mozilla.org/en-US/firefox/addon/azure-mask/)
2. Click "Add to Firefox"
3. You'll see a pop up notification in the address bar from Firefox. Click "Add"
4. You'll see a confirmation that it was added. Click "Ok"

## TBD

- Resubmission to the [Chrome Web Store](https://chrome.google.com/webstore/) is pending.
- Resubmission to the [Edge Add-ons](https://microsoftedge.microsoft.com/addons/) store is pending.
