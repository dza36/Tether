# Tether — QA Document

> This document tracks regression tests to run on every deploy, and one-time QA items to complete before specific milestones. Update as features are added.

---

## Regression Tests
*Run these on every deploy before pushing to production.*

### Auth
- [ ] Google sign in completes and lands in app
- [ ] Microsoft sign in completes and lands in app
- [ ] Magic link email sign in completes and lands in app
- [ ] Sign out clears session and returns to auth screen
- [ ] Returning user auto signs in without prompting

### Core Item Actions
- [ ] Swipe right completes item — item disappears from Today immediately
- [ ] Completed interval task reappears when next due
- [ ] Swipe left opens snooze bottom sheet
- [ ] Snooze 1 day — item disappears and returns at correct date
- [ ] Snooze custom days — item returns at correct date
- [ ] Dismiss — item disappears and returns at next natural due date
- [ ] Cancel snooze — item stays in place
- [ ] Hold opens checklist panel

### Checklist Panel
- [ ] Add checklist item
- [ ] Check/uncheck checklist item
- [ ] Delete checklist item
- [ ] Reset all clears all checked items
- [ ] Edit item — modal opens pre-filled with current values
- [ ] Edit item — save updates name and details in place
- [ ] Delete item — confirmation prompt appears
- [ ] Delete item — item removed from list and database

### Tabs & Filtering
- [ ] Today tab shows only overdue and due today
- [ ] This Week tab shows rolling 7 days from today
- [ ] This Month tab shows rolling 30 days from today
- [ ] Overdue items always surface in Today regardless of tab
- [ ] Snoozed items hidden from all tabs
- [ ] Dismissed items hidden from all tabs
- [ ] Clean slate moment shows when Today is empty

### Add Item
- [ ] Interval item saves and appears in correct tab
- [ ] Fixed weekday item saves and appears in correct tab
- [ ] One-time event saves and appears in correct tab
- [ ] Save button disabled until valid name and interval entered

### Sub-line Display
- [ ] Interval items show "Completed [date] · Next due [date]"
- [ ] Weekday items show "Every [days] · Next due [date]"
- [ ] Events show full date

### Household
- [ ] Household create flow completes without error
- [ ] Created household loads on next app open
- [ ] Household sheet shows member list
- [ ] Invite by email saves to household_invites table
- [ ] Existing items assigned to household on creation
- [ ] Member avatar shows on task rows when in a household

---

## One-Time QA — Pre-Beta
*Complete these before sending to beta testers.*

### Households End-to-End
- [ ] Create household on Account A
- [ ] Invite Account B by email
- [ ] Sign in as Account B — invite banner appears
- [ ] Accept invite — Account B joins household
- [ ] Account B sees Account A's tasks
- [ ] Account A sees Account B's tasks
- [ ] Member avatars display correctly for both accounts

### Auth & Security
- [ ] Same email signed in via Google and Microsoft merges to one account *(automatic in Supabase)*
- [ ] Enable leaked password protection in Supabase → Authentication → Attack Protection
- [ ] Tighten RLS policy on household_members INSERT from `true` to `auth.uid() IS NOT NULL`
- [ ] Tighten RLS policy on notifications INSERT from `true` to `auth.uid() IS NOT NULL`
- [ ] Fix function search path warnings on `handle_new_user` and `update_updated_at`

### PWA
- [ ] Add to home screen on iPhone — app loads correctly
- [ ] Add to home screen on Android — app loads correctly
- [ ] App icon displays correctly (currently 404 — needs favicon.ico and icon-192.png)

### Beta Readiness
- [ ] Feedback bar phone number is correct
- [ ] Flag beta tester accounts as `is_founder = true` in users table
- [ ] Confirm beta testers can sign in and create items without hitting errors
- [ ] Confirm beta testers can create a household and invite a second member

---

## Known Issues (Pre-Beta)
| Issue | Severity | Status |
|---|---|---|
| favicon.ico and icon-192.png missing — 404 on load | Low | Open |
| apple-mobile-web-app-capable meta tag deprecated | Low | Open |
| RLS household_members INSERT policy too permissive | Medium | Open |
| Facebook OAuth not wired up | Low | Deferred |
| Apple OAuth not wired up | Low | Deferred |
| Email invites not actually sent — invite is in-app only | Medium | Open |

---

## Completed One-Time Items
- [x] Supabase auth wired up — Google + Microsoft + Magic Link
- [x] Cloud sync replacing localStorage
- [x] Duplicate DB entry bug fixed (missing _dbId on load)
- [x] household_members foreign key fixed to reference auth.users
- [x] household_members role column changed from enum to text
- [x] Infinite recursion RLS policy fixed on household_members
- [x] Account linking — automatic same-email merging confirmed default in Supabase
- [x] Founder account type added to users table
