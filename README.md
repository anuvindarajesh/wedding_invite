# Nidheesh & Lekshmi — Wedding Reception Invitation

An elegant, interactive digital wedding invitation web application built with **React**, **Vite**, and **Tailwind CSS**. 

The design combines traditional Kerala aesthetic elements (deep forest greens, kasavu gold accents, and kolam motifs) with modern interactive animations (3D sliding palace doors, synchronized golden snowfall particles, live countdown timer, and seamless Google Sheets RSVP integration).

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Google Form & Google Sheets RSVP Setup](#google-form--google-sheets-rsvp-setup)
  - [Step 1: Create the Google Form](#step-1-create-the-google-form)
  - [Step 2: Link the Form to Google Sheets](#step-2-link-the-form-to-google-sheets)
  - [Step 3: Find Your Google Form Entry IDs](#step-3-find-your-google-form-entry-ids)
  - [Step 4: Update `RSVP_CONFIG` in Code](#step-4-update-rsvp_config-in-code)
  - [Step 5: Prevent Duplicate Rows on RSVP Edit (Auto-Update Script)](#step-5-prevent-duplicate-rows-on-rsvp-edit-auto-update-script)
- [Customizing Event Details](#customizing-event-details)
- [Project Structure](#project-structure)
- [Deployment & Free Hosting](#deployment--free-hosting)
  - [Option 1: Netlify Drop (No Git required, ~30s)](#option-1-netlify-drop-no-git-required-30s)
  - [Option 2: Vercel (GitHub integration)](#option-2-vercel-github-integration)
  - [Option 3: GitHub Pages](#option-3-github-pages)
  - [Connecting a Custom Domain](#connecting-a-custom-domain)

---

## Features

- **Royal Entrance Doors**: Sliding double-door opening with brass seam, gold perimeter trim, and traditional royal seal medallion that parts to reveal the invitation.
- **Animated Kolam & Emblem**: SVG geometric Kolam stroke-animation that dynamically draws its loops centered behind the wedding emblem.
- **Golden Stardust Snowfall**: Lightweight HTML5 canvas particle system with natural sine-wave oscillation and wind drift in champagne gold, synchronized to trigger right as the Kolam draws.
- **Scroll-Triggered Reveals**: Smooth intersection-observer scroll reveals across family blessings, venue details, countdown timer, and RSVP.
- **Live Countdown Timer**: Real-time days, hours, minutes, and seconds countdown to the wedding date.
- **Zero-Backend RSVP via Google Forms / Sheets**: Direct frontend submission via `fetch` with `mode: 'no-cors'`. Responses land in a live Google Sheet without requiring a server or database.
- **Calendar & Maps Integration**: 1-click links to add the reception directly to Google Calendar and open venue navigation in Google Maps.

---

## Quick Start

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation & Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```

Open your browser at `http://localhost:5173` to view the website.

### Production Build

```bash
npm run build
```
The optimized static build files will be generated in `dist/`.

### Linting

```bash
npm run lint
```

---

## Google Form & Google Sheets RSVP Setup

The website's RSVP form connects directly to **Google Forms**, which in turn saves each response into a **Google Sheet**. No custom server or API key is required.

### Step 1: Create the Google Form

1. Go to [Google Forms](https://forms.google.com/) and create a new blank form (e.g. *“Nidheesh & Lekshmi RSVP”*).
2. Add **3 questions**:
   - **Question 1**: `Your name` (Question type: **Short answer**)
   - **Question 2**: `Attendance` (Question type: **Multiple choice** or **Short answer**)
     - Option 1: `Joyfully accept`
     - Option 2: `Regretfully decline`
   - **Question 3**: `Number of guests` (Question type: **Short answer**)

### Step 2: Link the Form to Google Sheets

1. In Google Forms, click the **Responses** tab at the top.
2. Click the green **"Link to Sheets"** button (or the Google Sheets icon).
3. Select **"Create a new spreadsheet"** and click **Create**.
4. A new Google Sheet opens with columns: `Timestamp`, `Your name`, `Attendance`, and `Number of guests`.

### Step 3: Find Your Google Form Entry IDs

Google Forms identifies each question with an ID starting with `entry.XXXXX`. Finding them takes ~30 seconds using the pre-filled link method:

1. In your Google Form editor, click the **three vertical dots (⋮)** in the top right corner.
2. Select **"Get pre-filled link"**.
3. In the pre-filled form that opens, type placeholder text into each field:
   - Name field: type `NAME`
   - Attendance field: select `Joyfully accept`
   - Guests field: type `GUESTS`
4. Click **"Get link"** at the bottom, then click **"Copy link"**.
5. Paste that link into any text editor. It looks like this:
   ```text
   https://docs.google.com/forms/d/e/1FAIpQLScXXXXXXXXXXXX/viewform?usp=pp_url&entry.2050193851=NAME&entry.2065188826=Joyfully+accept&entry.764510313=GUESTS
   ```
6. Extract the 4 values:
   - **Form URL**: Take the base URL before `/viewform` and append `/formResponse`:  
     `https://docs.google.com/forms/d/e/1FAIpQLScXXXXXXXXXXXX/formResponse`
   - **Name Entry ID**: The number before `=NAME` (e.g. `entry.2050193851`)
   - **Attendance Entry ID**: The number before `=Joyfully+accept` (e.g. `entry.2065188826`)
   - **Guests Entry ID**: The number before `=GUESTS` (e.g. `entry.764510313`)

### Step 4: Update `RSVP_CONFIG` in Code

Open [`src/App.jsx`](./src/App.jsx#L18-L27) and update the `RSVP_CONFIG` object near the top of the file:

```javascript
const RSVP_CONFIG = {
  formUrl: 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse',
  nameEntry: 'entry.2050193851',
  attendanceEntry: 'entry.2065188826',
  guestsEntry: 'entry.764510313',
}
```

---

### Step 5: Prevent Duplicate Rows on RSVP Edit (Auto-Update Script)

By default, Google Forms appends a **new row** for every submission. If a guest submits an RSVP and later edits their response, Google Forms creates a duplicate row instead of updating their previous row.

You can fix this inside your Google Sheet in 2 minutes:

1. Open your linked **Google Sheet**.
2. In the top menu, go to **Extensions** > **Apps Script**.
3. Replace any code in the editor with this script:

```javascript
function onFormSubmit(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var lastRowIndex = data.length; // Row number of the newest submission
  if (lastRowIndex <= 2) return;  // Only header or first entry

  var lastRow = data[lastRowIndex - 1];
  var latestTimestamp = lastRow[0];
  var latestName = String(lastRow[1]).trim().toLowerCase(); // Column B: Name
  var latestAttendance = lastRow[2];                         // Column C: Attendance
  var latestGuests = lastRow[3];                             // Column D: Guests

  if (!latestName) return;

  // Search earlier rows to see if this guest already submitted
  for (var i = 1; i < lastRowIndex - 1; i++) {
    var existingName = String(data[i][1]).trim().toLowerCase();
    if (existingName === latestName) {
      // 1. Update the previous row with new response and timestamp
      sheet.getRange(i + 1, 1).setValue(latestTimestamp + " (Updated)");
      sheet.getRange(i + 1, 3).setValue(latestAttendance);
      sheet.getRange(i + 1, 4).setValue(latestGuests);

      // 2. Delete the duplicate row at the bottom
      sheet.deleteRow(lastRowIndex);
      return;
    }
  }
}
```

4. Click the **Save icon (💾)** at the top.
5. In the left sidebar of Apps Script, click **Triggers** (the clock icon ⏰).
6. Click **+ Add Trigger** (bottom right):
   - **Choose which function to run**: `onFormSubmit`
   - **Select event source**: `From spreadsheet`
   - **Select event type**: `On form submit`
   - Click **Save** (grant standard permissions if prompted).

Now, whenever a guest submits an updated RSVP with the same name, their existing row in the Google Sheet is automatically updated in real time, keeping your spreadsheet clean with **one row per guest**.

---

## Customizing Event Details

All core event constants are grouped at the top of [`src/App.jsx`](./src/App.jsx):

```javascript
// Date and time of the reception (used for the countdown timer)
const EVENT = new Date('2027-02-07T16:00:00+05:30')

// Physical venue address (used for copy-to-clipboard and display)
const ADDRESS = 'KG Convention Centre, Punalur, Kollam, Kerala'

// Google Maps directions search URL
const MAPS = 'https://www.google.com/maps/search/?api=1&query=KG+Convention+Centre+Punalur+Kollam+Kerala'

// Google Calendar 1-click event link
const CAL = 'https://calendar.google.com/calendar/render?action=TEMPLATE&...'
```

- **Emblem image**: Placed in [`public/emblem.png`](./public/emblem.png).
- **Favicon**: Configured in [`index.html`](./index.html) pointing to `/emblem.png`.
- **Colors & Fonts**: Defined in the Tailwind configuration in [`index.html`](./index.html) and custom animations in [`src/index.css`](./src/index.css).

---

## Project Structure

```text
wedding_invite/
├── index.html                         # HTML shell, fonts, favicon, and Tailwind config
├── package.json                       # Dependencies and npm scripts
├── vite.config.js                     # Vite configuration
├── public/
│   ├── emblem.png                     # Main wedding monogram / emblem
│   └── emblem-nobg.png                # Transparent background emblem variant
└── src/
    ├── main.jsx                       # React root entry point
    ├── index.css                      # Custom styles (door 3D transitions, kolam, buttons)
    └── App.jsx                        # Core application:
                                       #  - DoorEntrance (sliding palace doors)
                                       #  - Snowfall (canvas golden particle effect)
                                       #  - Kolam (animated SVG stroke drawing)
                                       #  - Hero (couple names & reception intro)
                                       #  - Family (blessings & parents' details)
                                       #  - Details (date, time, countdown, maps link)
                                       #  - Rsvp (Google Forms & Sheets integration)
                                       #  - Closing (warm regards & share button)
```

---

## Deployment & Free Hosting

Since this is a client-side static site, it can be hosted for **free** on any static web host with SSL (HTTPS) enabled:

### Option 1: Netlify Drop *(No Git required, ~30s)*

1. Run `npm run build` in `wedding_invite/`.
2. Visit [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag and drop the `dist/` folder onto the browser page.
4. Your website is live immediately with a free HTTPS URL.

### Option 2: Vercel *(Recommended for GitHub users)*

1. Push this project to a **GitHub** repository.
2. Sign in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Set **Root Directory** to `wedding_invite` (if your repository root contains the subfolder).
5. Click **Deploy**. Vercel will build and publish your site with continuous deployment on every Git push.

### Option 3: GitHub Pages

1. In `vite.config.js`, set `base: '/<REPO_NAME>/'`.
2. Install `gh-pages`: `npm install -D gh-pages`.
3. Add `"deploy": "gh-pages -d dist"` to `package.json` scripts.
4. Run `npm run build && npm run deploy`.

### Connecting a Custom Domain

To use a personal domain (e.g. `nidheesh-lekshmi.com` or `nidheeshwedlekshmi.in`):
1. In Vercel or Netlify, go to **Project Settings** > **Domains**.
2. Add your custom domain name.
3. Add the 2 DNS records (CNAME and A record) provided by the dashboard in your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.).
4. Free SSL certificates are provisioned automatically within minutes.
