# Tether — UX Design Document

> This document captures UX and interaction design decisions for Tether. It is a living document — update it as decisions evolve. For backend/data decisions see SPEC.md.

---

## Core Design Philosophy

**"End every day with a clean slate."**

Tether is not a task manager. It is a life rhythm tool. The emotional goal is that a user opens the app in the morning, sees what matters today, works through it, and closes the app at night feeling settled — not overwhelmed. A good day and a bad day should feel different in the app. The clean slate is the finish line.

This philosophy drives every interaction decision below.

---

## Navigation — Tab Structure

### Decision: Today / This Week / This Month
Replace the original All / Recurring / Events tabs.

| Tab | Shows |
|---|---|
| **Today** | Items due today + overdue items |
| **This Week** | Items due within the current week |
| **This Month** | Items due within the current month, events, longer cycles |

**Why:** All/Recurring/Events is a data model view — it's how a developer thinks about the data. Today/Week/Month is how a human thinks about their time. The new structure maps to natural planning horizons.

**Overdue items** always surface in Today regardless of which tab is active. Overdue items should never be easy to ignore, but they also shouldn't pile up as a guilt spiral — see Dismiss behavior below.

---

## Swipe Gestures

| Gesture | Action |
|---|---|
| Swipe right | Complete |
| Swipe left | Snooze (triggers prompt) |
| Hold | Expand checklist |

---

## Snooze Behavior

### Decision: Snooze prompt with 1 Day default + increment + Dismiss + Cancel

When a user swipes left, a bottom sheet slides up with:

- **− / +** controls defaulting to **1 Day** — tap + to add more days
- **Dismiss** button
- **Cancel** button

### Snooze
"I'm going to do this, just not today." Short term deferral. The item disappears from Today and reappears at the snoozed date at midnight local time (see Reset Time below).

### Dismiss
"I'm not doing this anytime soon — let the schedule handle it." The item is removed from the active list without being deleted. It reappears automatically at its next natural due date based on its recurrence schedule. No overdue flag. No guilt. The rhythm of the task brings it back when it's relevant again.

**Why dismiss exists:** If a user won't get to something this week, snoozing it repeatedly is friction and guilt. Dismiss acknowledges reality without punishing the user or losing the task.

### Cancel
Oops — put it back, do nothing.

---

## Daily Reset

### Decision: Midnight local time (configurable)
All snoozed items reset and reappear at midnight local time. The default is midnight but this should be configurable in settings — some users (early risers, night owls) may prefer 6am or another time.

**Why local time matters:** The app should respect where the user actually is, not UTC.

---

## The Clean Slate Moment

When a user has completed or dismissed everything in their Today tab, show a satisfying empty state:

- The Tether anchor logo
- A message like *"You're tethered and ready for tomorrow."*
- Subtle animation — nothing over the top

**Why this matters:** This is the emotional payoff. It's the difference between a utility and an app people love. Most task apps make you feel like you're never done. Tether makes you feel like you won the day.

---

## Avatar System

- OAuth users (Google, Microsoft, Apple) — pull profile photo automatically
- Users without a photo — color picker + initials
- ~8–10 curated colors that look good against white initials (no full color wheel)
- Avatar color/initials configured in the user menu (top right)
- Avatars appear on assigned tasks and event attendee lists
- Multiple attendees shown as stacked circles

**Why initials + color:** It makes each family member visually distinct at a glance. When shared households ship, it becomes immediately obvious whose tasks are whose without reading names.

---

## Add Button

### Decision: Bottom floating action button
Move the + from the top right to a bottom center floating action button.

**Why:** Tether is mobile-first. The top right corner is the hardest place to reach with one thumb. Bottom center is the most natural tap target on any phone size.

---

## Onboarding

First-time users should not land on a blank list with no context. Onboarding should:

- Briefly explain the three swipe gestures (right = complete, left = snooze, hold = checklist)
- Suggest adding a first item
- Feel light — not a 5-screen tutorial

*Details TBD when onboarding is built.*

---

## Task Completion — Recurring Tasks

When a recurring task is completed it should **disappear from the list** and reappear when it is next due. It should not reset and stay visible.

**Why:** Seeing a task you just completed still on your list undermines the clean slate feeling. Done means gone — until next time.

---

## Decisions Parking Lot
*Ideas raised but not yet decided*

- Snooze options mapped to tab structure (Tomorrow / This Week / Next Week) instead of day increment
- Smarter snooze default based on task rhythm (weekly task defaults to 1 week, monthly to 1 month)
- Configurable snooze reset time per user
- Urgency / importance signaling beyond due date
- Notification at end of day celebrating a clean slate
