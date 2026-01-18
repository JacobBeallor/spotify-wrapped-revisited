# Add section navigation and anchor links

---
**id:** 003  
**priority:** P2  
**size:** S  
**epic:** UI/UX Improvements  
**created:** 2026-01-18  
**tags:** enhancement, ux, quick-win

---

## Title

Add section navigation with anchor links for quick jumping

## Dependencies

**blocked_by:** []  
**blocks:** []  
**parallel_with:** [001]

## Context

The dashboard has multiple sections (Summary, Trends, Top Artists, Top Tracks, Patterns, Artist Evolution) but no easy way to navigate between them. Users have to scroll manually which is tedious on long pages.

Adding section navigation improves discoverability and makes the dashboard feel more organized and professional.

## Acceptance Criteria

- [ ] Add unique IDs to major section components
- [ ] Create sticky navigation bar or floating menu with section links
- [ ] Smooth scroll to sections on click
- [ ] Highlight active section as user scrolls (using IntersectionObserver)
- [ ] Works on mobile (hamburger menu or horizontal scroll tabs)
- [ ] Doesn't obstruct content

## Implementation Notes

**Approach:**
- Add `id` attributes to section wrapper divs
- Create SectionNav component with links
- Use `IntersectionObserver` API to detect active section
- Use CSS `scroll-behavior: smooth` or JS smooth scroll
- Make nav sticky (`position: sticky`)

**Key files:**
- `app/page.tsx` — Add section IDs to divs
- `components/SectionNav.tsx` (new) — Navigation component
- `app/globals.css` — Styling for sticky nav, scroll offset

**Sections to include:**
- Summary
- Listening Trends  
- Top Artists
- Top Tracks
- Listening Patterns (DOW/Hour)
- Artist Evolution

**Considerations:**
- `scroll-margin-top` CSS to account for sticky header offset
- Mobile: consider horizontal scrolling tabs or collapsible menu
- Active state styling to show current section
- Smooth scroll polyfill for Safari (if needed)

## Test Plan

- [ ] Verify all section links work and scroll smoothly
- [ ] Test active section highlighting as user scrolls
- [ ] Test on mobile: nav should be usable
- [ ] Test sticky behavior doesn't obstruct content
- [ ] Test with different viewport sizes
- [ ] Test accessibility (keyboard navigation, screen readers)

## Status History

- 2026-01-18: Created → Ready

