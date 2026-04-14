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
- [ ] Write RLS policies for `contacts`, `groups`, `group_members`
- [ ] Remove `.tether.test` email domain from any allowlists
- [ ] Confirm `items.household_id` nullable migration didn't break anything in prod
- [ ] Smoke test contacts flow with real accounts
- [ ] Smoke test groups flow with real accounts
