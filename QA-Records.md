# QA Records — Beta Test Data

Test data seeded for beta. **Remove before public launch.**

---

## Test Users (20)

All test accounts use `@tether.test` email addresses and hardcoded UUIDs starting with `11111111-`.

| # | UUID suffix | Display Name | Role |
|---|-------------|--------------|------|
| 1 | `...000001` | Taylor Swift | Closest Friends |
| 2 | `...000002` | Keanu Reeves | Closest Friends |
| 3 | `...000003` | Dolly Parton | Closest Friends |
| 4 | `...000004` | Snoop Dogg | Closest Friends |
| 5 | `...000005` | Oprah Winfrey | Closest Friends + Extended Family |
| 6 | `...000006` | Dwayne Johnson | Closest Friends + Work Peeps |
| 7 | `...000007` | Big Earl Fam | Extended Family |
| 8 | `...000008` | Aunt Edna Fam | Extended Family |
| 9 | `...000009` | Baby Dave Fam | Extended Family |
| 10 | `...000010` | Nana Joyce Fam | Extended Family |
| 11 | `...000011` | Cousin Randy Fam | Extended Family + Work Peeps |
| 12 | `...000012` | Annoying Andy | Work Peeps |
| 13 | `...000013` | Funny Gal Pam | Work Peeps |
| 14 | `...000014` | Coffee Breath Carl | Work Peeps |
| 15 | `...000015` | HR Karen | Work Peeps |
| 16 | `...000016` | Alpha Testy | Contact only |
| 17 | `...000017` | Beta Tested | Contact only |
| 18 | `...000018` | Gamma Testcase | Contact only |
| 19 | `...000019` | Delta Testworth | Contact only |
| 20 | `...000020` | Echo Testington | Contact only |

Full UUID prefix: `11111111-0001-0001-0001-00000000000X`

---

## Test Groups (3)

All groups owned by Danny (`b4800585-8760-47df-ba6f-ba81917fd7f1`), UUIDs starting with `22222222-`.

| UUID suffix | Group Name | Members |
|-------------|------------|---------|
| `...000001` | Closest Friends | 1–6 (Oprah + Dwayne overlap) |
| `...000002` | Extended Family | 5, 7–11 (Oprah + Cousin Randy overlap) |
| `...000003` | Work Peeps | 6, 11–15 (Dwayne + Cousin Randy overlap) |

---

## Cleanup SQL

Run this before launch to remove all beta test data:

```sql
-- Remove group memberships
DELETE FROM group_members
WHERE user_id::text LIKE '11111111%';

-- Remove groups
DELETE FROM groups
WHERE id::text LIKE '22222222%';

-- Remove contacts
DELETE FROM contacts
WHERE recipient_id::text LIKE '11111111%';

-- Remove public user profiles
DELETE FROM users
WHERE id::text LIKE '11111111%';

-- Remove auth users (run last)
DELETE FROM auth.users
WHERE id::text LIKE '11111111%';
```

---

## Other Beta-Only State

- `contacts` and `groups` / `group_members` tables are new — no production data in them yet, safe to truncate entirely if needed
- RLS policies not yet written for contacts/groups — **must be added before launch**

---

## Pre-Launch Checklist

- [ ] Delete all test users (SQL above)
- [x] Write RLS policies for `contacts`, `groups`, `group_members`
- [ ] Remove `.tether.test` email domain from any allowlists
- [ ] Confirm `items.household_id` nullable migration didn't break anything in prod
- [ ] Smoke test contacts flow with real accounts
- [ ] Smoke test groups flow with real accounts

---

## QA Test Plan

### 1 — Auth

| # | Test | Expected |
|---|------|----------|
| 1.1 | Sign in with Google | Lands on main app, avatar populates |
| 1.2 | Sign out | Auth screen shown, main app hidden |
| 1.3 | Return to tab after phone lock / app switch | Items reload automatically, no manual refresh needed |
| 1.4 | Open app on two devices simultaneously | Both show same data (note: Realtime not yet built — manual refresh required on second device) |

---

### 2 — Tasks: Create & Edit

| # | Test | Expected |
|---|------|----------|
| 2.1 | Add one-time task (name only) | Appears in Today |
| 2.2 | Add task with specific time | Clock icon on row, sorts above untimed tasks |
| 2.3 | Add urgent task | Red dot, sorts to top of Today |
| 2.4 | Add task with checklist items | Checklist accessible via hold gesture |
| 2.5 | Edit task — change name, recurrence, time | Changes persist after close and reload |
| 2.6 | Assign task to household member | Avatar shown on row |
| 2.7 | Tap avatar on row | Assign picker opens, selection updates row |

---

### 3 — Tasks: Recurrence

| # | Test | Expected |
|---|------|----------|
| 3.1 | Complete interval task (every 3 days) | Reappears 3 days later |
| 3.2 | Complete weekly task (Mon/Wed/Fri) | Reappears on next correct weekday |
| 3.3 | Complete monthly task (1st Monday) | Reappears on next 1st Monday |
| 3.4 | Complete a task early (due tomorrow) | Confirm sheet fires, completion anchors to due date not today |
| 3.5 | Complete a one-time task | Disappears from all tabs, status = completed |
| 3.6 | Confirm one-time task is NOT hard deleted | Query `tether_items` — row exists with `status = completed` |

---

### 4 — Tasks: Checklist

| # | Test | Expected |
|---|------|----------|
| 4.1 | Hold task row | Checklist panel expands |
| 4.2 | Check all items | Last checkbox auto-prompts "Complete the task?" |
| 4.3 | Confirm incomplete checklist on complete | Warning shows unchecked count |
| 4.4 | Complete task with partial checklist | Recorded in `tether_completions`, task resets |
| 4.5 | Complete task with full checklist | Recorded cleanly |

---

### 5 — Tasks: Snooze & Dismiss

| # | Test | Expected |
|---|------|----------|
| 5.1 | Left-swipe task | Snooze sheet opens |
| 5.2 | Snooze 1 day | Task gone from Today, returns tomorrow |
| 5.3 | Snooze 3 days | Returns in 3 days |
| 5.4 | Dismiss recurring task | Removed from active list, no overdue flag, reappears at next natural due date |
| 5.5 | Cancel snooze sheet | Nothing changes |

---

### 6 — Events: Create & Edit

| # | Test | Expected |
|---|------|----------|
| 6.1 | Add event (name + date only) | Saves, no time required |
| 6.2 | Add event with start + end time | Times display on row and in detail sheet |
| 6.3 | Add event with attendees via group | Group shows pre-checked members, uncheck removes from invite list |
| 6.4 | Add event with attendees via individual contact | Contact appears in attendee list |
| 6.5 | Add bring list items | Items appear in detail sheet |
| 6.6 | Toggle "guests can invite" off | Saved and reflected in detail sheet |
| 6.7 | Toggle "allow additions to bring list" off | Saved and reflected |
| 6.8 | Edit event — change name, date, icon | Changes persist |

---

### 7 — Events: List Sheet (3-tab)

| # | Test | Expected |
|---|------|----------|
| 7.1 | Tap events banner | Sheet opens on Future tab |
| 7.2 | Future tab | Shows events you created or RSVPed going/maybe, date ≥ today. Count in label. |
| 7.3 | Pending tab | Shows future invites with status = pending. Count in label. |
| 7.4 | Past tab | Shows dismissed + past-date events. Count in label. |
| 7.5 | Dismiss an event, reopen sheet | Event moves from Future to Past |
| 7.6 | RSVP badge visible on invited events | "Invited" / "Going" / "Maybe" badge on row |
| 7.7 | Tap event row | Event detail sheet opens |

---

### 8 — Events: Swipe & RSVP

| # | Test | Expected |
|---|------|----------|
| 8.1 | Right-swipe event on Today | Dismissed, disappears from Today |
| 8.2 | Left-swipe event on Today | Snooze sheet, snooze moves off Today, stays on Week |
| 8.3 | Right-swipe an invite | "Decline this invite?" confirm fires |
| 8.4 | Accept invite | Event moves to date-based visibility |
| 8.5 | Decline invite | Removed from list |
| 8.6 | Tentative RSVP | Shows note field |

---

### 9 — Events: Detail Sheet

| # | Test | Expected |
|---|------|----------|
| 9.1 | Open event detail (owner) | Header, meta, attendee list with statuses, bring list, edit/delete buttons |
| 9.2 | Claim bring list item | Item shows as claimed by you |
| 9.3 | Edit from detail sheet | Edit modal opens pre-populated |
| 9.4 | Delete from detail sheet | Confirm fires, event removed |

---

### 10 — Tabs & Sort Order

| # | Test | Expected |
|---|------|----------|
| 10.1 | Today tab | Overdue + today items only. Urgent first, then timed, then untimed. |
| 10.2 | This Week tab | Rolling 7 days. Overdue surfaces here too. |
| 10.3 | This Month tab | Rolling 30 days. |
| 10.4 | Completed one-time task | Invisible in ALL tabs |
| 10.5 | Snoozed task | Invisible until snooze date |

---

### 11 — Clean Slate

| # | Test | Expected |
|---|------|----------|
| 11.1 | Complete all Today items | Anchor icon + "You're tethered." heading shown |
| 11.2 | Open app with Today already empty | Same clean slate state |

---

### 12 — Household

| # | Test | Expected |
|---|------|----------|
| 12.1 | Create household | Name saved, user becomes admin |
| 12.2 | Invite member by email | In-app notification shown to recipient |
| 12.3 | Accept household invite | Member sees all household items |
| 12.4 | Decline household invite | No change to household |
| 12.5 | All members see shared items | Tasks and events visible to all after join |

---

### 13 — Contacts & Groups

| # | Test | Expected |
|---|------|----------|
| 13.1 | Open Groups from profile menu | Groups sheet shows all 3 test groups |
| 13.2 | Tap a group | Member list shown with back nav |
| 13.3 | Open Contacts from profile menu | Contacts grouped by group, ungrouped at bottom |
| 13.4 | Contact-only users visible | Alpha Testy, Beta Tested, etc. appear in ungrouped section |

---

### 14 — Data Integrity

| # | Test | Expected |
|---|------|----------|
| 14.1 | Completions recorded | After completing a recurring task, row in `tether_completions` with correct `due_date` |
| 14.2 | Early completion uses due date | Complete task due Friday on Wednesday — `tether_completions.due_date` = Friday |
| 14.3 | One-time task archived | `tether_items.status = completed`, row not deleted |
| 14.4 | Snooze persists on reload | Snoozed task stays gone after hard reload |
| 14.5 | Event guests saved | After creating event with attendees, rows exist in `event_guests` |

---

### 15 — RLS / Security

| # | Test | Expected |
|---|------|----------|
| 15.1 | No 500 errors on load | Console clean on items + event_guests queries |
| 15.2 | Household isolation | User without household cannot see another household's tasks |
| 15.3 | Event guest access | Invited user can see event after being added as guest |
| 15.4 | Contact access | Users only see their own contact records |
