# PackFlow (no login) - HTML + CSS + JavaScript only

No React, no Node, no installer, no internet, **no login**.

## Start
1. Unzip anywhere. 2. **Double-click `index.html`** (Google Chrome or Microsoft Edge recommended).
3. First time only: type your company name. That's all.
(Optional: `run_server.bat` opens it at http://localhost:8080 - needs Python.)

## Sizing
- Everything scales smoothly with the screen: phones ~15px text, laptops ~17px, big monitors/TVs up to ~21px. Content is centred with a maximum width so it never stretches too far.
- **Aa button** (menu, or top bar on phones) or **Settings -> Display size**: Small / Normal / Large / Extra large. Your choice is remembered.
- Forms switch between 2 columns and 1 column based on the space they actually have (page, card or pop-up).
- Phones: tables turn into cards, pop-ups slide up from the bottom, buttons are at least 44px tall, 16px inputs (no zoom on iPhone).

## Menu
Desktop: **« Collapse menu / » Expand** (remembered). Phone/tablet: **☰** opens a slide-in menu; tap the dark area, ✕, Esc or any item to close.

## Data and safety (important)
- Saved automatically **inside the browser** (SQLite in IndexedDB). Always open it the same way in the same browser.
- Settings -> *Save a backup now* weekly (Home reminds you). Chrome/Edge can also *auto-save to a file* in a folder you pick.
- **There is no login**: anyone who can open this page on this computer sees the data. Lock your Windows account.

## Files
`index.html`, `css/styles.css`, `js/*.js` (calc, core = database + rules, db, ui, app, print, forms, pages/*), `js/vendor/` (SQLite engine as text), `tests/` (optional: `npm install && npm test`).
