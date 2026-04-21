---
name: ui-user-form-restyle
description: Restyles user add/edit form screens with a friendly violet/emerald panel layout while preserving all form behavior. Use when editing user management form pages such as admin/teacher/student/TA add or edit screens.
---

# UI User Form Restyle

## Goal
Make user add/edit forms feel friendly, compact, and modern while keeping behavior unchanged.

## Non-Negotiables
- Preserve logic: detail fetch, field mapping, validation, submit payloads, permissions, toasts, and navigation.
- Do not remove existing fields or alter API contracts.
- Keep mobile usability intact when applying desktop grid layouts.

## Layout Pattern
1. Outer shell: `mx-auto w-full max-w-6xl pb-24`.
2. Main card: `rounded-3xl border border-violet-200 bg-white shadow-sm overflow-hidden`.
3. Header strip: `bg-violet-50 border-b border-violet-200` with eyebrow + title + back button.
4. Two-column body on desktop: avatar/summary panel (left) + form sections (right).
5. Fixed bottom action bar with cancel + primary submit (add/update).

## Section Styling
- Use pastel section cards (`violet`, `emerald`, `amber`, `fuchsia`, `rose`) with soft borders.
- Prefer compact spacing (`p-3`/`p-4`, small gaps) for scan speed.
- Replace legacy `card/card-header` patterns on these pages.

## Icon Policy
- Prefer `@remixicon/react` icons for section headers and action buttons.
- Keep icon sizing consistent (`size-4` or `size-5`).

## Apply Checklist
- [ ] Business logic unchanged.
- [ ] No field removed.
- [ ] Header + section cards restyled.
- [ ] Action bar fixed and consistent.
- [ ] Lints checked for edited TSX files.
