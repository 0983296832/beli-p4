---
name: ui-user-detail-restyle
description: Restyles user detail pages (admin/teacher/student/TA) with the friendly violet/emerald panel layout while preserving behavior. Use when editing files matching src/pages/users/**/*Detail.tsx.
---

# UI User Detail Restyle

## Goal
Align all `*Detail.tsx` under `src/pages/users/` with the same visual system as `AdministratorDetail.tsx` without changing business rules.

## Non-negotiables
- Keep `getDetail` / `handleDelete` / service calls / `useParams` / `useEffect` dependencies intact.
- Keep `Confirm` wiring and toast + navigate after delete.
- Preserve `DrawerStatistic` `objectId`, `type`, and `extraFilter.filterings` exactly per role (e.g. `admin_id:eq`, `teacher_id:eq`, `student_id:eq`, `ta_id:eq`).
- Respect `detail?.user_ability?.can_delete` / `can_edit` when the original screen did; if a screen always showed actions, keep that behavior.
- Keep `replaceNewlineWithBr` for description HTML.

## Layout recipe
1. Root: `div.pb-24` → `max-w-6xl mx-auto` → single white card `rounded-3xl border border-violet-200 shadow-sm`.
2. Top bar: violet-50, title stack + icon outline buttons (delete rose, edit emerald), Remix only.
3. Body: `p-5 lg:p-6`, `flex-col lg:flex-row gap-6`.
4. Aside: profile + `aspect-square` avatar + chips.
5. Main column: grid `lg:grid-cols-12` — personal info `lg:col-span-7`, management `lg:col-span-5` (adjust spans if one column is empty).
6. Optional sections (last attendance, etc.) full width below the grid row.
7. Description block (rose-tinted) then footer close button (`emerald` + `RiArrowLeftLine`).

## Icons
- Profile / identity: `RiUserLine`, `RiUser3Line`, `RiCalendarLine`, `RiPhoneLine`, `RiMailLine`, `RiMapPin2Line`
- Management header: `RiBarChart2Line`
- Attendance-style blocks: `RiCalendarCheckLine` when relevant
- Description: `RiFileTextLine`
- Actions: `RiDeleteBin6Line`, `RiEdit2Line`, footer `RiArrowLeftLine`

## QA
- Compare click handlers and navigate paths to the pre-change file.
- Run lints on edited detail files.
- Quick responsive check: stack on small screens, two columns on `lg+`.
