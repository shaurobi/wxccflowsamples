# Voice Trigger Workflows

This project is intended as a rapid prototyping and/or demonstration tool to provide agents with the capability to trigger workflows (i.e., trigger webhooks) from the telephony channel on Webex Contact Center (WxCC) agent desktop.  

## Introduction

The WxCC digital channels provide a capability to trigger workflows that is missing from the telephony channel.  This project provides agents with an experience similar to the digital channels but for the telephony channel.

Running this project creates a web component widget that gets deployed in the header of the WxCC agent desktop.  The widget is only rendered when the agent has an active (selected) telephony task.  The configuration for the widget is done by setting the configJSON variable in the WxCC desktop layout.  The decision to use the desktop layout for the widget's configuration was made to allow for rapid prototyping of the widget.  This project is not recommended for production use but could be used as a starting point for building a similar production widget.

The widget supports the following HTML input types.
- input
- select
- hidden
- datetime (uses browser native datetime-local capability, chrome works best)

> Note:  The widget does not return a status code or success/fail message to the agent after triggering the workflow, however the status code and response body can be found in the browser console. 

> Note:  The taskMap and CAD data is not update after the call is connected.  This could easily be done if needed by calling the desktop SDK.


## Getting Started

## [Watch the Video: Deploying voice-trigger-workflows](https://app.vidcast.io/share/fa542647-a44e-4636-b54c-bc27e430bf13)

Requirements: Node.js, npm, WxCC Tenant, and cloud storage/cdn

1. Download this project or ```git clone https://github.com/dwfinnegan/voice-trigger-workflows```
2. From the project directory run ```npm install```
3. Run ```npm run serve``` to run the dev server and sandbox
   - open http://localhost:8081/ in a browser 
   - follow instructions from video above on how to use the sandbox

4. Run ```npm run build``` to build the widget for deployment
   - copy the file public/voice-trigger-workflow.js to your preferred cloud storage
   - deploy desktop layout sample_configs/desktopLayout.json to your webex contact center tenant

5. Create your own custom configJSON layout


## configJSON

The configJSON variable used in the desktop layout is a JSON array of objects.  Each object in the array corresponds to a workflow in the widget menu.  It is also valid to have an object (workflow) with no parameters.


Each object has the following key/value pairs:
 - **name** (string) - The text for the name of the workflow shown in the widget
 - **url** (string) - The url called when the workflow is triggered
 - **parameters** (array) - Array of data fields
   - **type** (string) - the html type of input, valid options are "input", "select" or "datetime"
   - **name** (string) - the key used when posting this data to the url
   - **label** (string) - The text shown for this input
   - **values** (array of strings) - Only used for select type.  Sets the select dropdown fields.
   - **value** (string) - Only used for hidden type. Sets the value for the hidden key/value pair



Below is a sample config of three workflows:
  - **Password Reset** has two parameters (input & select)
  - **Schedule a Callback** has a single parameter (datetime & hidden)
  - **Update Account** has no parameters


```
[
  {
    "name": "Password Reset",
    "url": "https://some-web-site.com/some-web-hook",
    "parameters": [
      {
        "type": "input",
        "name": "message",
        "label": "Send a message"
      },
      {
        "type": "select",
        "name": "channel",
        "label": "Choose a Channel",
        "values": ["sms", "email", "phone"]
      }
    ] 
  },
  {
    "name": "Schedule a Callback",
    "url": "https://some-web-site.com/some-web-hook",
    "parameters": [
      {
        "type": "datetime",
        "name": "scheduledTime",
        "label": "Enter callback Date & Time"
      },
      {
        "type": "hidden",
        "name": "emailAddress",
        "value": "jdoe@example.com"
      }
    ]
  },
  {
    "name": "Update Account",
    "url": "https://some-web-site.com/some-web-hook"
  }
]
```



## Changelog

#### [1.0.1] - 2023-02-01

- Added hidden type to sliently pass a Key/Value pair

#### [1.0.0] - 2022-12-21

- Initial project commit