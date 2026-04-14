# Tether — UX Design Reference

> Implemented interaction and design decisions. This is a reference doc — not a wishlist. For upcoming features see BACKLOG.md.

---

## Core Design Philosophy

**"End every day with a clean slate."**

Tether is not a task manager. It is a life rhythm tool. The emotional goal is that a user opens the app in the morning, sees what matters today, works through it, and closes the app at night feeling settled — not overwhelmed. A good day and a bad day should feel different in the app. The clean slate is the finish line.

---

## Two Object Types: Tasks and Events

### Task
Something you **do**. Recurring or one-time. Can have an optional specific time. Can be flagged urgent.

Examples: Pick up Jimmy, Grocery shopping, Mow the lawn, Pay bills, Take vitamins, Quarterly taxes.

**Recurrence options:**
- Every X days (interval — counts from last completion)
- Weekly on specific days (Mon, Wed, Fri etc.)
- Monthly on the Nth weekday (1st Monday, last Friday etc.)
- One-time on a specific date

**Fields:** name, recurrence, optional time, urgent flag, checklist, assignee

### Event
Something you **attend**. Always has a start date. Optional start time, end date/time (supports multi-day). Has attendees, RSVP, and a bring list.

Examples: Jimmy's hockey tournament, Christmas dinner, Super Bowl party, Dentist appointment, School recital.

**Fields:** name, start date (required), start/end time (optional), end date (optional), event icon, attendees, bring list, guests-can-invite toggle, allow-additions toggle

---

## Add Flow

Tapping + shows a type chooser:
- **Add Task**
- **Add Event**

No ambiguity. Recurrence types and events are separate modals.

---

## Item Visual Language — Row Icons

| Icon | Meaning |
|------|---------|
| 🔴 Red dot | Urgent task |
| 🟢 Green dot | Regular task, no specific time |
| 🕐 Clock | Timed task — has a start time |
| Event icon | Event — user picks icon at creation |

**Event icons:** 📅 ⭐ 🎉 🚗 🏥 ⚽ 🍽️ ✈️ 🎓

---

## Sort Order

Within each tab, items sort:
1. 🔴 Urgent tasks — always first
2. 📅 Events and timed tasks — chronological by time
3. ⚪ Untimed tasks — by due date

---

## Navigation — Tab Structure

| Tab | Shows |
|-----|-------|
| **Today** | Items due today + overdue |
| **This Week** | Rolling 7 days from today |
| **This Month** | Rolling 30 days from today |

Overdue items always surface in Today regardless of active tab.

---

## Swipe Gestures

| Gesture | Action |
|---------|--------|
| Swipe right | Complete task / Dismiss event |
| Swipe left | Snooze (opens snooze sheet) |
| Hold | Expand checklist panel |

---

## Snooze Behavior

Left swipe opens a bottom sheet:
- **− / +** stepper defaulting to 1 day
- **Snooze** — item disappears, reappears at snoozed date at midnight
- **Dismiss** — removed from active list, reappears at next natural due date. No overdue flag.
- **Cancel** — do nothing

**Snooze** = "I'll do this, just not today."
**Dismiss** = "Let the schedule handle it."

---

## Completion Behavior

- **Recurring tasks** — right swipe marks done, resets to next occurrence. Completion recorded in `tether_completions` with user + due date attribution.
- **One-time tasks** — right swipe archives (status = completed). Never hard deleted. Hidden from all tabs. Available for future history UI.
- **Events** — right swipe dismisses (status = dismissed). Left swipe snoozed until next day.

### Early completion confirm
- Task due tomorrow or later → confirm sheet always fires
- Task due today with start time > 60 min away → confirm sheet fires
- Incomplete checklist on complete → confirm sheet shows unchecked count

### Last checkbox auto-prompt
Checking the final item in a checklist auto-opens "Complete the task?" confirm sheet.

---

## Event Interactions

- **Appear on Today** when their date is today (or when invited, regardless of date)
- **Appear on Week** for their full duration
- **Auto-expire** when end time passes
- **Right swipe** → dismiss entirely (regardless of duration)
- **Left swipe** → snooze: off Today, stays on Week, returns at midnight

### RSVP
Invited events show Accept / Tentative / Decline pills. Tentative shows optional note field.
- Accept → event moves to normal date-based visibility
- Decline → removed from list
- Right swipe on invitation → "Decline this invite?" confirm

### Event detail sheet
Opens from events list. Shows icon + name + date/time in header.
- **Owner:** no RSVP pills, attendee list with statuses, bring list, edit/delete
- **Guest:** RSVP pills, attendee list, bring list with claim buttons

---

## Events Banner + List

Always-visible banner below the tab hint: "X events this week" / "No events this week." Taps to events list sheet.

Events list sheet: Future / Past toggle, month-grouped rows.

---

## Clean Slate Moment

When Today is empty:
- Anchor icon
- "You're tethered." heading
- "Nothing left for today. Rest easy — you've got this."

---

## Avatar System

- OAuth users — profile photo pulled automatically
- Users without a photo — initials displayed
- Avatars appear on assigned task rows and event attendee lists
- Tap avatar on a task row to reassign

---

## Household

- One active household per person
- Invite by email — existing users get in-app notification
- Accept / Decline flow
- All household items visible to all members on joining
- Items assignable to any member, tap avatar to reassign
- Household name is display only

---

## Urgency Flag

Tasks can be flagged urgent. Urgent tasks sort to top of Today. Visual: red dot replacing green dot.

---

## Daily Reset

Snoozed items reappear at midnight local time.
