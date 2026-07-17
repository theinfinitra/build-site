# infinitra.build

Landing page and application form for the Infinitra Build program.

**Live at:** build.theinfinitra.com

## Files

```
build-site/
├── index.html        ← Landing page (curriculum + apply CTA)
├── apply.html        ← Application form (one-question-at-a-time)
├── config.js         ← Cohort settings, deadlines, form endpoint
├── apps-script.js    ← Google Apps Script code (paste into Sheets)
└── README.md         ← This file
```

## Setup

### 1. Google Sheets (form backend)

1. Create a Google Sheet named "Infinitra Build Applications"
2. Create two tabs: **Applications** and **Waitlist**
3. In the **Applications** tab, add headers in Row 1:
   ```
   Timestamp | Name | Phone | Email | Location | Current Situation | Why Build | Hard Thing | Source
   ```
4. In the **Waitlist** tab, add headers in Row 1:
   ```
   Timestamp | Email
   ```
5. Go to **Extensions → Apps Script**
6. Delete the default code, paste the contents of `apps-script.js`
7. Click **Deploy → New Deployment**
8. Select **Web app**
9. Set "Execute as" → **Me**
10. Set "Who has access" → **Anyone**
11. Click **Deploy** → Copy the URL
12. Paste the URL into `config.js` (both `formEndpoint` and `waitlistEndpoint`)

### 2. GitHub Pages (hosting)

1. Create a new **public** GitHub repo (e.g., `infinitra-build`)
2. Push this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin git@github.com:YOUR_ORG/infinitra-build.git
   git push -u origin main
   ```
3. Go to repo **Settings → Pages**
4. Source: Deploy from a branch → `main` / `/ (root)`
5. Save

### 3. Custom domain (GoDaddy)

1. In GoDaddy DNS, add a CNAME record:
   - **Name:** `build`
   - **Value:** `YOUR_USERNAME.github.io`
   - **TTL:** 600
2. In GitHub Pages settings, set Custom domain to `build.theinfinitra.com`
3. Check "Enforce HTTPS" (may take a few minutes to provision)

### 4. Copy the AWS badge

Copy `aws-partner-advanced-tier.png` into the same folder as `index.html`:
```bash
cp /path/to/aws-partner-advanced-tier.png .
```

## Configuration

Edit `config.js` to manage cohorts:

```js
const CONFIG = {
  cohort: {
    name: "September 2026",
    startDate: "2026-09-15",
    applicationDeadline: "2026-08-31",  // Auto-closes after this date
    seats: 10,
  },
  applications: {
    open: true,  // Manual kill switch
    // ...
  },
  formEndpoint: "YOUR_GOOGLE_APPS_SCRIPT_URL",
  waitlistEndpoint: "YOUR_GOOGLE_APPS_SCRIPT_URL",
};
```

### Between cohorts:
1. Set `applications.open: false` (or let deadline auto-close)
2. When next cohort is ready, update dates and set `open: true`

### Close early (seats full):
Set `applications.open: false` in `config.js` and push.

## Testing locally

Just open `index.html` in a browser. The form works without a backend — it just won't save anywhere until you configure the Google Apps Script URL.

To test form submission, use the curl command in `apps-script.js` comments.
