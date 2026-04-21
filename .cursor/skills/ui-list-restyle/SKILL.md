---
name: ui-list-restyle
description: Restyles list pages with a bright, friendly, compact UI while preserving existing logic. Use when redesigning list/table/card screens, especially admin/user listing pages.
---

# UI List Restyle

## Goal
Make list pages feel friendly and modern for mixed audiences (students, parents, teachers) without changing behavior.

## Non-Negotiables
- Preserve all existing logic: API calls, filters, selection, actions, permissions, pagination.
- Do not remove working features.
- Favor readability and scan speed over visual complexity.

## Styling Direction
- Use bright pastel Tailwind colors (violet/sky/emerald/amber/rose).
- Default to non-gradient surfaces.
- Use soft borders and small shadows.
- Keep corner radius moderate (`rounded-md`, `rounded-lg`, `rounded-xl`).

## Layout Pattern
1. One cohesive top toolbar:
   - title + summary chips
   - search + filter
   - view toggle
   - primary action button
2. Table view:
   - clear column grouping with light background tints
   - zebra rows + subtle hover
   - replace old shared table classes (e.g. `table-rounded`) with explicit Tailwind table styles
   - include subtle vertical separators between cells; keep separators light and disable on last column
   - if the screen must keep `.table-rounded`, adjust the shared `.table-rounded` rules in `src/assets/styles/style.css` so all those tables get the same light vertical grid (do not fork one-off border colors per page unless necessary)
3. Card view:
   - compact card size
   - square thumbnail
   - prioritize contact info (name, phone, email, address)
   - trim secondary metadata unless requested

## Icon Policy
- Prefer `@remixicon/react` component icons for controls and metadata rows.
- Keep icon sizes consistent (`size-3.5`, `size-4`, `size-5`).

## Final QA
- Re-check that logic paths are unchanged.
- Run lints for edited files.
- Ensure responsive behavior remains usable on small screens.
- Confirm table visuals were truly restyled (not only header/toolbar changes).
