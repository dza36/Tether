# Tether

> Stay tethered to what matters.

A lightweight recurring task + event tracker. Swipe right to complete, swipe left to snooze, hold to open a checklist.

## Deploy to Azure Static Web Apps

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Tether v1 — initial release"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tether.git
git push -u origin main
```

### Step 2 — Create Azure Static Web App
1. Go to portal.azure.com
2. Search "Static Web Apps" → Create
3. Name: `tether`
4. Region: Central US
5. Plan: Free
6. Source: GitHub → authorize → select your repo + `main` branch
7. Build preset: Custom
8. App location: `/`
9. Output location: `/`
10. Review + Create

Azure auto-generates the GitHub Action. Your app is live in ~2 minutes.

### Step 3 — Custom domain (optional)
In Azure Static Web Apps → Custom domains → add `tether.yourdomain.com`
Then add a CNAME in Cloudflare pointing to your `.azurestaticapps.net` URL.

## Features
- Recurring tasks: interval (every N days/weeks/months/years) or fixed weekday
- One-time events with countdown
- Swipe right → complete (resets countdown)
- Swipe left → snooze 1 day
- Hold → checklist mode (add, check, delete items)
- Data persists via localStorage
- PWA ready (add to home screen)
- Overdue items highlighted red
- Sorts by urgency

## Tech
Plain HTML/CSS/JS. Zero dependencies. Zero build step.

## Roadmap
- User accounts + cloud sync
- Push notifications
- Google Calendar / Apple Calendar integration
- React Native app (iOS + Android)
- Pro subscription ($2.99/mo or $19.99/yr)
