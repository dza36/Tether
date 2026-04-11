# Tether — UX Design Document

> This document captures UX and interaction design decisions for Tether. It is a living document — update it as decisions evolve. For backend/data decisions see SPEC.md.

---

## Core Design Philosophy

**"End every day with a clean slate."**

Tether is not a task manager. It is a life rhythm tool. The emotional goal is that a user opens the app in the morning, sees what matters today, works through it, and closes the app at night feeling settled — not overwhelmed. A good day and a bad day should feel different in the app. The clean slate is the finish line.

This philosophy drives every interaction decision below.

---

## Two Object Types: Tasks and Events

Tether has two fundamentally different object types. They look different, behave differently, and are created differently.

### Task
Something you do. Recurring or one-time. Can have an optional specific time. Can be flagged urgent.

Examples: Pick up Jimmy, Grocery shopping, Mow the lawn, Pay bills, Take vitamins, Quarterly taxes.

**Recurrence options:**
- Every X days (interval — counts from last completion)
- Weekly on specific days (Mon, Wed, Fri etc.)
- Monthly on the Nth weekday (1st Monday, last Friday etc.)
- Yearly on a specific date
- One-time on a specific date

**Fields:** name, recurrence, optional time, urgent flag, checklist, assignee

### Event
Something you attend. Always has a start date and time. Optional end date/time (supports multi-day events). Has attendees, RSVP, and a bring list.

Examples: Jimmy's hockey tournament, Christmas dinner, Super Bowl party, Dentist appointment, School recital.

**Fields:** name, start date + time (required), end date + time (optional), event icon, attendees, bring list, guest invite permissions, co-owners

---

## Add Flow

Tapping + shows two clear choices:
- **Add Task**
- **Add Event**

No ambiguity. No mixing of recurrence types and events in the same modal.

---

## Item Visual Language — Row Icons

Each row shows an icon on the left instead of a plain dot. The icon communicates the type and urgency at a glance:

| Icon | Meaning |
|---|---|
| 🔴 Red dot | Urgent task — drop everything |
| 🟢 Green dot | Regular task — no specific time |
| 🕐 Clock | Timed task — happens at a specific time today |
| Event icon | Event — something you attend (user picks icon) |

**Event icons** — user picks one when creating the event:
- ⭐ Star — generic special moment
- 🎉 Party hat — celebration, birthday, gathering
- 🚗 Car — road trip, travel, pickup/dropoff
- 🏥 Medical — doctor, dentist, appointment
- ⚽ Sports — kids games, tournaments
- 🍽️ Fork & knife — dinner, restaurant, date night
- ✈️ Plane — travel, vacation
- 🎓 Cap — school events, recitals, ceremonies

---

## Sort Order

Items sort in this priority order within each tab:

1. 🔴 **Urgent tasks** — always at the top regardless of time
2. 📅 **Events and timed tasks** — chronological by time
3. ⚪ **Untimed tasks** — sorted by due date

---

## Navigation — Tab Structure

### Decision: Today / This Week / This Month
Replace the original All / Recurring / Events tabs.

| Tab | Shows |
|---|---|
| **Today** | Items due today + overdue items |
| **This Week** | Rolling 7 days from today |
| **This Month** | Rolling 30 days from today |

**Why:** All/Recurring/Events is a data model view — it's how a developer thinks about the data. Today/Week/Month is how a human thinks about their time.

**Overdue items** always surface in Today regardless of which tab is active.

---

## Events — Expanded Panel

When a user taps an event row it expands to show:

1. **RSVP** — Going / Can't make it buttons. Once selected, shows current status clearly.
2. **Attendees** — list of who's going, who declined, who's pending
3. **What to bring** — collapsible if items exist, always expandable. Owner adds requests, attendees claim them or add their own. Claimed items show under the claimer's name.
4. **Invite** — owner can invite household members or enter an email
5. **Edit / Delete** — only visible to event owner or co-owners
6. **Co-owner** — creator can add co-owners to help organize

**Guest invite permissions** — owner controls whether attendees can invite additional people.

---

## Swipe Gestures

| Gesture | Action |
|---|---|
| Swipe right | Complete (tasks only — events use RSVP) |
| Swipe left | Snooze (triggers prompt) |
| Hold | Expand checklist (tasks) / not applicable for events |
| Tap | Expand event panel (events only) |

---

## Snooze Behavior

### Decision: Snooze prompt with 1 Day default + increment + Dismiss + Cancel

When a user swipes left, a bottom sheet slides up with:

- **− / +** controls defaulting to **1 Day** — tap + to add more days
- **Dismiss** button
- **Cancel** button

### Snooze
"I'm going to do this, just not today." Short term deferral. The item disappears from Today and reappears at the snoozed date at midnight local time.

### Dismiss
"I'm not doing this anytime soon — let the schedule handle it." The item is removed from the active list without being deleted. It reappears automatically at its next natural due date. No overdue flag. No guilt.

### Cancel
Oops — put it back, do nothing.

---

## Daily Reset

### Decision: Midnight local time (configurable)
All snoozed items reset and reappear at midnight local time. Configurable in settings — some users may prefer 6am.

---

## The Clean Slate Moment

When a user has completed or dismissed everything in Today:

- The Tether anchor logo
- Message: *"You're tethered and ready for tomorrow."*
- Subtle animation

---

## Avatar System

- OAuth users — profile photo pulled automatically
- Users without a photo — color picker + initials (~8–10 curated colors)
- Avatars appear on assigned tasks and event attendee lists
- Tap avatar on a task row to reassign

---

## Household

- One household per person for now (multiple supported at data model level for future)
- Invite by email (existing users get in-app notification, new users get email)
- Accept / Decline flow
- All household items visible to all members immediately on joining
- Items assignable and assumable by any member
- Kids have own logins with parental controls on contacts
- Household name is display only — UUIDs handle uniqueness

---

## Add Button

Move + from top right to bottom center floating action button. Mobile-first — bottom center is the most natural thumb target.

---

## Urgency Flag

Tasks can be flagged urgent. Urgent tasks always sort to the top of Today regardless of due time. Visual indicator: red dot replacing the green dot.

---

## User Priority / Item Flagging
*To build* — users can flag items as urgent from the checklist panel or item row. Single tap to toggle.

---

## Onboarding

First-time users should not land on a blank list. Onboarding should:
- Briefly explain swipe gestures
- Suggest adding a first item
- Feel light — not a 5-screen tutorial

*Details TBD.*

---

## Decisions Parking Lot
*Ideas raised but not yet decided*

- Configurable snooze reset time per user
- Smarter snooze default based on task rhythm
- Notification at end of day celebrating a clean slate
- Business/team version of Tether (same codebase, different branding)
- Monthly recurrence: Nth weekday (1st Monday, last Friday etc.)
- Yearly recurrence option
- One-time task on specific date
- Sport-specific icons for event type picker
- Founders page on website listing early beta users by name (opt-in)

