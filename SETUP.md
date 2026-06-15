# Manmie Bar — Admin Setup Guide

Your app now has two pages:

- **index.html** — the visitor-facing app (Akèy, Meni, Kòmand, Rezèv, Galri, Enfò)
- **admin.html** — your private admin panel (menu management, text editing, contact info, gallery)

To make changes from the admin panel appear live for **everyone**, you need a free Firebase Realtime Database. Takes about 10 minutes, one-time setup.

## Step 1 — Create a Firebase project

1. Go to https://console.firebase.google.com
2. Click **Add project** → name it (e.g. "manmie-bar") → follow the prompts (you can disable Google Analytics)
3. Once created, click the **Web icon (`</>`)** to add a web app → give it a nickname → **Register app**
4. Firebase will show a `firebaseConfig` object — copy it, you'll need it in Step 3

## Step 2 — Create the Realtime Database

1. In the left sidebar, click **Build → Realtime Database**
2. Click **Create Database**
3. Choose a location, then select **Start in test mode** (for now — this allows reads/writes without login so the admin panel works immediately)
4. Click **Enable**

> ⚠️ **Test mode opens your database to anyone with the URL.** This is fine to get started, but for real production use, see "Securing your database" below.

## Step 3 — Add your config to the app

1. Open **firebase-config.js** in this project
2. Replace the placeholder values with the config object from Step 1. It looks like:

```js
window.firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "manmie-bar.firebaseapp.com",
  databaseURL: "https://manmie-bar-default-rtdb.firebaseio.com",
  projectId: "manmie-bar",
  storageBucket: "manmie-bar.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

3. Save the file.

## Step 4 — Set your admin password

1. Open **admin.html**
2. Find this line near the bottom (in the `<script>` section):

```js
var ADMIN_PASSWORD = "manmie2026"; // <-- CHANGE THIS to your own password
```

3. Replace `"manmie2026"` with your own password.

## Step 5 — Deploy

Upload all files (index.html, admin.html, firebase-config.js, manifest.json, sw.js, icons/) to your host (Netlify, GitHub Pages, etc.) — same as before.

## Using the admin panel

Visit `yoursite.com/admin.html`, enter your password, and you can:

- **Meni** — add, edit, or delete menu items (name, price, description, category, photo)
- **Tèks** — edit the homepage welcome text, opening hours, and the "Enfò" page banner text
- **Kontak** — edit address, phone, WhatsApp, Facebook
- **Galri** — add or remove gallery photos

Every change saves to Firebase instantly and appears for all visitors within seconds (the visitor app listens for live updates).

There's also a small "Administrasyon" link at the bottom of the **Enfò** tab in the visitor app that goes to admin.html — you may want to remove that link later if you don't want it publicly visible (it's still password-protected, but hiding the link adds a layer of obscurity).

## Securing your database (recommended before going fully live)

Test mode rules expire after 30 days and allow anyone to read/write. For a simple upgrade, go to **Realtime Database → Rules** and use:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

This keeps reads/writes open (since the admin page only has a simple password, not real Firebase auth) but won't expire. For stronger security later, you could add Firebase Authentication and restrict `.write` to logged-in admin accounts — let me know if you want help with that down the road.

## Notes

- Photos are stored as base64 strings directly in the database. The free Realtime Database tier has a 1GB storage limit — fine for a reasonable number of menu/gallery photos, but if you add many large images you may eventually want Firebase Storage instead. Resize/compress photos before uploading if possible.
- The shopping cart, MonCash order form, and table reservation form remain local to each visitor's device (as before) — these aren't meant to sync across devices.
