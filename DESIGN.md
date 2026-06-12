---
name: Academic Governance System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#464555'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#960014'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc1d25'
  on-tertiary-container: '#ffd0cc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin: 32px
  sidebar-width: 260px
---

## Brand & Style

The design system is engineered for efficiency, clarity, and institutional trust. It serves school administrators who manage complex data—student records, faculty schedules, and financial reports. The aesthetic is **Corporate / Modern**, prioritizing information density without sacrificing legibility. 

The emotional response should be one of "calm control." By utilizing a restrained color palette and generous whitespace, the UI reduces cognitive load, allowing users to focus on critical tasks. The visual language is intentional and systematic, reflecting the organized nature of educational administration.

## Colors

The palette is anchored by **Indigo**, a color associated with stability and logic. This primary hue is reserved for high-priority actions and active navigation states. 

- **Primary (#4F46E5):** Used for primary buttons, selection states, and brand-identifiable accents.
- **Surface & Background:** A clear distinction is made between the "canvas" (F9FAFB) and "content containers" (FFFFFF) to create a natural hierarchy.
- **Semantic Colors:** Emerald is used exclusively for positive confirmations (e.g., "Fee Paid"), while Rose is reserved for critical alerts (e.g., "Absent" or "Overdue").
- **Typography:** We use Deep Slate for high-contrast headings to ensure readability, while Slate-Gray provides a softer, accessible experience for long-form data and body text.

## Typography

The design system utilizes **Inter** for its exceptional legibility on digital screens and its neutral, systematic character. 

Hierarchy is established through weight and scale. Headings use semi-bold and bold weights with tighter letter spacing for a compact, authoritative look. Body text remains at a 14px standard (body-md) for data density in tables and forms, while labels use medium or semi-bold weights to distinguish themselves from data values. For mobile devices, headline sizes scale down to prevent awkward line breaks while maintaining the same weight-based hierarchy.

## Layout & Spacing

The system follows a strict **8px square grid** to ensure mathematical harmony across all components.

- **Layout Model:** A fixed sidebar (260px) is paired with a fluid main content area. The content uses a 12-column grid system for large screens, transitioning to a single-column stack on mobile.
- **Responsive Breakpoints:** 
  - **Desktop (1280px+):** 32px outer margins, 24px gutters.
  - **Tablet (768px - 1279px):** 24px outer margins, 16px gutters. Sidebar may collapse to an icon-only rail.
  - **Mobile (Below 768px):** 16px outer margins, 16px gutters. Sidebar moves to a hidden "hamburger" drawer.
- **Vertical Rhythm:** All vertical gaps between elements (labels to inputs, card headers to content) must be multiples of 8px.

## Elevation & Depth

This design system avoids heavy shadows and skeuomorphism, opting for **Tonal Layers** and **Low-Contrast Outlines**.

Depth is primarily communicated through the use of borders and background contrast. 
- **Level 0 (Background):** The F9FAFB base layer.
- **Level 1 (Surface):** White cards used for the majority of content. These feature a 1px solid border (#E5E7EB).
- **Level 2 (Popovers/Modals):** Floating elements use a very soft, highly diffused shadow (0px 10px 15px -3px rgba(0, 0, 0, 0.05)) to suggest they are temporarily layered above the interface.

Interactive elements like buttons do not use shadows but instead rely on background color shifts on hover.

## Shapes

The shape language is **Soft**, utilizing a 0.25rem (4px) base radius. This provides a professional look that is slightly more approachable than sharp corners without feeling overly consumer-grade or playful.

- **Standard Elements (Inputs, Buttons):** 4px radius.
- **Containers (Cards, Modals):** 8px radius (`rounded-lg`).
- **Outer Shells (Sidebar, Main Wrap):** 12px radius (`rounded-xl`).
- **Icons:** Use a 2px stroke width with slightly rounded terminals to match the font's geometry.

## Components

### Buttons
- **Primary:** Solid Indigo background, white text. No shadow.
- **Secondary:** White background, 1px border (#E5E7EB), Slate-Gray text.
- **Ghost:** No border or background. Indigo text for actions, Slate-Gray for navigation.

### Input Fields
Inputs use a white background with a 1px border. On focus, the border changes to Indigo with a subtle 2px outer glow (ring) of the same color at 20% opacity. Labels are always placed above the field in `label-sm` weight.

### Data Tables
Tables are the heart of the dashboard.
- **Structure:** Horizontal dividers only (1px solid #E5E7EB). No vertical lines.
- **Header:** Light gray background (#F9FAFB) with uppercase, semi-bold text (`label-sm`).
- **Cells:** Standard 14px body text. High-priority columns (like Student Name) can use medium weight.

### Chips/Badges
Small containers with 12px horizontal padding. Used for status indicators.
- **Success:** Emerald text on light Emerald tint (10% opacity).
- **Warning:** Amber text on light Amber tint.
- **Critical:** Rose text on light Rose tint.

### Cards
Cards are flat with a #E5E7EB border. They should include a standard 24px internal padding (lg) to maintain the "generous whitespace" philosophy.