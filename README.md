# Tether

> Stay tethered to what matters.

A household task and event tracker built as a PWA. Swipe to complete, swipe to snooze, hold to open a checklist. Shared in real time across all your devices.

**Live at [get-tethered.app](https://get-tethered.app)**

---

## What's live

### Tasks
- **Recurring types** — every N days/weeks/months/years, fixed weekdays, monthly by Nth weekday (e.g. 1st Monday)
- **One-time tasks** — single due date, archived on completion
- **Urgent flag** — sorts to top of Today, red dot indicator
- **Checklist** — hold to expand, add/check/delete items, reset all
- **Assignee** — tap avatar on row to assign to any household member
- **Optional start time** — timed tasks sort chronologically within their tab

### Events
- **Create** with name, icon, date, optional start/end time, optional end date (multi-day)
- **Attendees** — invite household contacts at creation or from the detail sheet
- **RSVP** — Going / Tentative / Can't make it; owners skip RSVP on their own events
- **Bring list** — owner requests items, guests claim or add their own
- **Swipe right** to dismiss, **swipe left** to snooze

### Tabs
| Tab | Shows |
|-----|-------|
| **Today** | Due today + overdue |
| **This Week** | Rolling 7 days |
| **This Month** | Rolling 30 days |

Overdue items always surface in Today regardless of active tab.

### Swipe gestures
| Gesture | Action |
|---------|--------|
| Swipe right | Complete task / Dismiss event |
| Swipe left | Snooze (bottom sheet, 1–N days) |
| Hold | Expand checklist panel |

### Household
- Create a household, invite members by email
- All household items visible to all members
- In-app invite banner and accept/decline flow
- Member avatars on task rows and event attendee lists

### Social
- Contacts list — accepted contacts can be invited to events
- Groups — organize contacts for batch inviting

### Account
- Sign in via Google, Microsoft, or magic link email
- Configurable background color (hex, persisted per device)
- Real-time sync — changes on any device push to all connected clients instantly

---

## Tech

Plain HTML / CSS / JS. Zero dependencies. Zero build step.

| Layer | Stack |
|-------|-------|
| Frontend | HTML + CSS + vanilla JS |
| Backend | Supabase (Postgres + Auth + Realtime) |
| Hosting | Azure Static Web Apps |
| Deploy | GitHub Actions on push to `main` |
| Domain | get-tethered.app (Cloudflare DNS) |

---

## Deploy

Push to `main` — GitHub Actions builds and deploys to Azure Static Web Apps automatically. Version number is stamped at build time via `git rev-list --count HEAD`.

---

## Roadmap

See [BACKLOG.md](BACKLOG.md).
