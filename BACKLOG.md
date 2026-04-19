# Tether — Backlog

Features and fixes agreed upon, not yet built. Roughly prioritized within each section.

---

## Events

- **Events list — 3-tab redesign** — Replace Future/Past toggle with three tabs:
  - *Future* — events you created + RSVPs where status is `going`. Show count.
  - *Past* — past-date or dismissed events. Show count.
  - *Pending* — future-dated invites regardless of snooze/dismiss/decline, always accessible to change RSVP. Show count.
- **Clone event** — "Clone" button in event detail sheet (owner only). Pre-populates creation modal with same name, icon, bring list, and guest list. Pick new date and save.
- **Recurring events** — For AA meetings, book clubs, weekly team lunch. Recurrence fields on `items`, pre-generated instances per occurrence (each needs own `event_guests` + `potluck_items`). Bring list inherited from template by default. Edit affects this occurrence or all future.
- **Location field** — Optional location on events (and possibly tasks). Display in detail sheet and row subline.

---

## Tasks

- **Celebration animation** — Fireworks canvas overlay with "⚓ All Clear" when the last Today item is completed. *(built — pending deploy test)*
- **History UI** — Bar/pie chart per household member over 7 / 30 / 90 days. Data is accumulating in `tether_completions` now. Build when enough beta data exists.
- **Urgent flag quick-toggle** — Single tap to toggle urgent on a task row or checklist panel without opening the edit modal.

---

## Social

- **Add contacts by email** — "Add contact" flow: enter email → pending request sent → recipient sees pending invite → Accept / Decline / Block.
- **Block system** — Asymmetric visibility. Blocked user can't see blocker anywhere. Full spec in `memory/project_social_graph.md`.

---

## Household

- **Onboarding** — First-run experience for new users. Explain swipe gestures, prompt first item. Light — not a 5-screen tutorial.
- **Kids logins + parental controls** — Household sub-accounts for kids with restricted contacts.
- **Co-owners on events** — Creator can add co-owners who can edit/delete the event.
- **Avatar color picker** — For users without an OAuth profile photo: pick from ~8 curated colors, shown with initials.

---

## Infrastructure

- **Push / email notifications** — Configurable per user. Needed for event invites, contact requests, RSVP updates. Platform TBD (Supabase Edge Functions + FCM / SendGrid likely).
- **App file splitting** — `app.js` at ~1,900 lines, split around 3,000–4,000. Natural seams: `core.js` / `render.js` / `tasks.js` / `events.js` / `social.js` / `household.js`. No build step required — multiple `<script>` tags in order.

---

## Parking Lot
*Raised but not decided. Not actively being worked on.*

1. Configurable snooze reset time per user (default midnight, some may prefer 6am)
2. Smarter snooze default based on task rhythm — needs history data to work, revisit after beta
3. Business / team version of Tether — v2.0 or beyond
4. Sport-specific event icons — low priority, nice to have
5. Founders page on website listing early beta users by name (opt-in)
