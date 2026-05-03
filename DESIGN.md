# AI Doubt Solver — Design Brief

## Visual Direction
Refined academic minimalism meets modern tech. Dark, focused UI designed for late-night studying. Zero decoration, maximum clarity. Every surface intentionally differentiated.

## Tone & Differentiation
Thoughtful. Clean. Purposeful. Unlike generic dark apps, surfaces are deliberately layered (header, sidebar, content, input panel each have distinct visual treatment). Teal accent strategically used for engagement—not scattered everywhere—reinforcing the tutor role. Typography hierarchy through geometric display font + clean body font, not size alone.

## Color Palette (OKLCH)

| Token | Light | Dark (Primary) | Usage |
|-------|-------|----------------|-------|
| Background | — | 0.13 0.01 240 | Main canvas |
| Foreground | — | 0.93 0.01 240 | Primary text |
| Card | — | 0.165 0.015 240 | Message bubbles, conversation items |
| Border | — | 0.28 0.012 240 | Dividers, input borders |
| Primary / Accent | — | 0.68 0.18 195 | CTA buttons, active states, speaker labels (AI) |
| Destructive | — | 0.55 0.22 25 | Delete, error states |
| Success | — | 0.65 0.18 145 | Submission confirmation |
| Muted | — | 0.22 0.015 240 | Secondary backgrounds, disabled states |

## Typography

| Role | Font | Scale | Weight |
|------|------|-------|--------|
| Display | Space Grotesk | 28–48px | 600–700 |
| Body | General Sans | 14–16px | 400–600 |
| Mono | Geist Mono | 12–14px | 400 |

Display font for headings & hero text. Body for labels, chat content, and UI. Mono for code blocks within markdown.

## Structural Zones

| Zone | Background | Border | Shadow | Purpose |
|------|-----------|--------|--------|----------|
| Header | `bg-card` | `border-b border-border` | `shadow-md` | User profile, logo, logout |
| Sidebar | `bg-card` | None or `border-r border-border` | `surface-elevated` | Conversation list, search, new button |
| Main Content | `bg-background` | None | None | Chat display, markdown rendering |
| Input Panel | `bg-card` | `border-t border-border` | `surface-elevated` | Text/image/voice tabs, submit button |

## Shape Language
Subtle radii (4–6px) on all interactive elements. Cards and buttons use `rounded-sm` or `rounded-md`. Input fields: `rounded-md`. Full radius on pills (badges, tags if present).

## Spacing & Rhythm
Base unit: 4px. Content padding: 1.5rem (6 units). Message bubbles: 1rem horizontal, 0.75rem vertical. Gap between messages: 1rem. Input panel height: ~200–280px depending on mode.

## Component Patterns
- **Buttons**: Primary (teal bg, dark text), Secondary (muted bg, light text), Destructive (red bg). All have `transition-focus` on hover.
- **Messages**: Left-aligned (user) / right-aligned (AI) with speaker label and timestamp. User: `bg-muted`, AI: `bg-primary`.
- **Input modes**: Tabs above textarea/upload/voice. One active at a time.
- **Code blocks**: `bg-muted` with `font-mono`, bordered.

## Motion
Smooth transitions (0.2s) on interactive elements. Fade-in for new messages. No bouncing, no delays. Entrance animation on page load: subtle fade (200ms).

## Constraints
- Never use raw hex or named colors—OKLCH only.
- No full-page gradients or decoration.
- No emoji; use minimal iconography (Lucide or similar).
- Accessibility: Minimum 4.5:1 contrast on all text; teal accent tested AA+ against dark backgrounds.
- Mobile: Stack sidebar below header on `sm:` breakpoint. Input panel remains anchored.

## Signature Detail
Message bubbles with distinct left border (AI: teal, User: muted). Reinforces speaker identity without cluttering the interface. Markdown headings render in display font, maintaining hierarchy even in chat.
