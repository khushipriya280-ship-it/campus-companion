# Campus Buddy — Build Plan

This is a large product (auth + 8 feature modules + dashboard + calendar + settings). I'll build it in phases so we get a polished, working app fast and layer features on top.

## Phase 1 — Foundation (this turn)
- Enable Lovable Cloud (auth + database).
- Design system in `src/styles.css`: Poppins font, your color palette as oklch tokens, light + dark mode, soft shadows, glass utility, gradients.
- App shell: responsive sidebar (desktop) + bottom nav (mobile), top bar with search/notifications/profile.
- Auth: Login, Sign Up, Forgot Password, Reset Password, email confirmation flow, protected `_authenticated` routes.
- `profiles` table (full_name, avatar_url, university, course) auto-created on signup via trigger.
- Dashboard skeleton with greeting, date, stat cards, quick actions (wired to routes), empty states.

## Phase 2 — Core trackers
- Assignments (CRUD, priority, deadline, status, progress, grid/list, search/filter/sort, overdue=red).
- Attendance (subjects + classes, % calc, classes-needed-for-75%, circular charts).
- Exams (CRUD, countdown, prep status).

## Phase 3 — Career + planning
- Projects (CRUD, progress, links).
- Internships (Kanban board by status).
- Portfolio (skills, certs, links, completion %).
- Calendar (month view aggregating all events).

## Phase 4 — Polish
- Notifications panel (derived from due dates + attendance threshold).
- Settings (profile, dark mode toggle, notification prefs, account, security).
- File upload (Cloud storage) for assignments/resume.
- Final pass: skeletons, toasts, confirm dialogs, FAB, transitions, a11y, SEO meta per route.

## Tech notes
- TanStack Start + Router (file routes under `src/routes/`), TanStack Query for data, shadcn/ui, Tailwind v4, Recharts for charts, lucide-react icons, sonner toasts, framer-motion for transitions.
- All DB tables: RLS on, scoped to `auth.uid()`, explicit GRANTs.
- Server-only writes through `createServerFn` with `requireSupabaseAuth` where useful; most CRUD direct from browser client under RLS.

## One question before I start
Do you want me to **proceed phase-by-phase** (you'll see Phase 1 working before I build Phase 2, etc.), or **batch Phases 1–2 together** in the first build for a faster first usable version?

I'll start Phase 1 as soon as you approve (or tell me to batch).