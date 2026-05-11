# Tether — Backlog

Features and fixes agreed upon, not yet built. Roughly prioritized within each section.

---

## Events

- **Recurring events** — For AA meetings, book clubs, weekly team lunch. Recurrence fields on `items`, pre-generated instances per occurrence (each needs own `event_guests` + `potluck_items`). Bring list inherited from template by default. Edit affects this occurrence or all future.
- **Location — Places API** — Current implementation is plain text. Future: autocomplete via Supabase Edge Function proxy + address validation. Already has 🗺 Navigate button launching Google Maps.
- **Co-owners on events** — Creator can add co-owners who can edit/delete the event.

---

## Tasks

- **History UI** — Bar/pie chart per household member over 7 / 30 / 90 days. Data is accumulating in `tether_completions` now. Build when enough beta data exists.
- **Urgent flag quick-toggle** — Single tap to toggle urgent on a task row or checklist panel without opening the edit modal.

---

## Social

- **Add contacts by email** — "Add contact" flow: enter email → pending request sent → recipient sees pending invite → Accept / Decline / Block.
- **Delete contact** — Remove a contact from your contacts list. Soft delete via status field.
- **Resend contact request email** — If the notification email failed or wasn't received, allow resending without cancelling and re-creating the request.
- **Group creation** — Create group UI. Invite members by email or from contacts. All members are notified, see the group, and see each other. Joining auto-adds all members as mutual contacts. Use case: Extended Family, Closest Friends, Book Club.
- **Block system** — Asymmetric visibility. Blocked user can't see blocker anywhere. Full spec in `memory/project_social_graph.md`.

---

## Household

- **Onboarding** — First-run experience for new users. Explain swipe gestures, prompt first item. Light — not a 5-screen tutorial.
- **Pull profile photo from OAuth** — Store and display avatar from Google/Microsoft sign-in. Currently shows initials only.
- **Kids logins + parental controls** — Household sub-accounts for kids with restricted contacts.
- **Avatar color picker** — For users without an OAuth profile photo: pick from ~8 curated colors, shown with initials.

---

## Infrastructure

- **Push / email notifications** — Configurable per user. Needed for event invites, contact requests, RSVP updates. Platform TBD (Supabase Edge Functions + FCM / SendGrid likely). Notifications placeholder already in profile menu.
- **App file splitting** — `app.js` approaching 2,500+ lines, split around 3,000–4,000. Natural seams: `core.js` / `render.js` / `tasks.js` / `events.js` / `social.js` / `household.js`. No build step required — multiple `<script>` tags in order.

---

## Pre-Beta Launch

- **File splitting** — Split `app.js` (~4,000+ lines) into logical modules before open beta. Reduces session context cost and improves maintainability. Natural seams: `core.js` / `render.js` / `tasks.js` / `events.js` / `social.js` / `household.js` / `groups.js`. No build step — multiple `<script>` tags in order.
- **Walkthrough video** — Record a full feature walkthrough covering tasks, events, household, contacts, and occasions.
- **Voiceover** — Add narration to the walkthrough video.
- **Host video** — Publish walkthrough online (YouTube unlisted or similar) to share with beta invitees.

---

## Parking Lot
*Raised but not decided. Not actively being worked on.*

1. Configurable snooze reset time per user (default midnight, some may prefer 6am)
2. Smarter snooze default based on task rhythm — needs history data to work, revisit after beta
3. Business / team version of Tether — v2.0 or beyond
4. Sport-specific event icons — low priority, nice to have
5. Founders page on website listing early beta users by name (opt-in)
6. Holiday cross-reference on event creation ("Looks like this is near Thanksgiving — add a Thanksgiving event?")
7. Party Every Day API integration (nationaldaycalendar.com or similar)
8. Contact birthday → auto-Annual generation
