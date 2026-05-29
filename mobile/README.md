# Kitchen Queue Mobile

This folder contains an Expo-based mobile application for the Kitchen Queue project.

## Features

- Authentication: login, register, and account activation.
- Profile management with editable user details.
- Kitchen queue with live polling for order status updates.
- Order creation screen that mirrors web flow.
- Menu management with create, edit, delete, and availability toggling.
- Shared REST API integration with the Django backend.

## Setup

1. Open a terminal in `mobile/`.
2. Run `npm install`.
3. Start the app with `npm start`.
4. Open on your emulator or device.

## Backend configuration

The mobile app reads `expo.extra.apiBase` from `mobile/app.json` and falls back to the Expo debugger host or a local LAN IP.
If you are using Expo Tunnel mode, set `mobile/app.json` extra `apiBase` to a URL reachable from your device, for example a tunnel URL from ngrok or a public backend host.

## Notes

- The mobile app uses polling for seamless synchronization across web and mobile platforms.
- If you want to support a real device, use the host machine IP address rather than `localhost`.
