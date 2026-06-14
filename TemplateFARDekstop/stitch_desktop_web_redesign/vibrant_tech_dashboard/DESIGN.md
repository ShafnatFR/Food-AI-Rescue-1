---
name: Vibrant Tech Dashboard
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#564334'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#8a7362'
  outline-variant: '#ddc1ae'
  surface-tint: '#914c00'
  primary: '#914c00'
  on-primary: '#ffffff'
  primary-container: '#ff8a00'
  on-primary-container: '#613100'
  inverse-primary: '#ffb77f'
  secondary: '#5c5e63'
  on-secondary: '#ffffff'
  secondary-container: '#e1e2e8'
  on-secondary-container: '#626469'
  tertiary: '#006d3b'
  on-tertiary: '#ffffff'
  tertiary-container: '#00c16d'
  on-tertiary-container: '#004725'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc4'
  primary-fixed-dim: '#ffb77f'
  on-primary-fixed: '#2f1500'
  on-primary-fixed-variant: '#6f3900'
  secondary-fixed: '#e1e2e8'
  secondary-fixed-dim: '#c5c6cc'
  on-secondary-fixed: '#191c20'
  on-secondary-fixed-variant: '#44474b'
  tertiary-fixed: '#5bffa0'
  tertiary-fixed-dim: '#30e286'
  on-tertiary-fixed: '#00210e'
  on-tertiary-fixed-variant: '#00522b'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 32px
  gutter-lg: 24px
  card-gap: 16px
  sidebar-width: 280px
---

## Brand & Style

This design system embodies a **Modern / Corporate** aesthetic with a distinct **AI-forward** edge. It is optimized for efficiency and clarity, targeting professional users who manage complex data and high-impact logistics. The visual language balances a warm, mission-driven core with a cold, precise technological wrapper.

The brand personality is authoritative yet optimistic. It uses a clean, high-contrast interface to signal reliability, while vibrant accent colors and soft depth effects inject energy and "smart" interactivity. The overall emotional response should be one of "Intelligent Empowerment"—feeling like a sophisticated tool that is easy to navigate.

## Colors

The palette is anchored by a **Vibrant Orange (#FF8A00)**, used strategically for primary actions and brand presence. This is paired with a **Deep Charcoal (#1A1D21)** for high-contrast typography and dark-themed "AI modules" to ground the design in professional tech.

- **Primary:** Vibrant Orange for growth, energy, and primary calls-to-action.
- **Secondary:** Deep Charcoal for dark containers and heavy-weight headlines.
- **Success/AI:** A bright Emerald Green (#00D177) is used for "Approved" states and AI-validated data points.
- **Surface:** A series of cool grays and off-whites provide a clean, "scientific" backdrop for the data cards.

## Typography

The typography system uses a tri-font approach to differentiate between brand impact, readability, and technical data.

- **Headlines:** Uses **Hanken Grotesk** in heavy weights. It provides a sharp, contemporary "tech" feel that remains highly professional.
- **Body:** Uses **Plus Jakarta Sans** for its high x-height and friendly, open counters, ensuring long-form data reports are comfortable to read.
- **Data & Labels:** Uses **JetBrains Mono** for secondary labels and metadata (e.g., timestamps, IDs). The monospaced nature emphasizes the "AI/Machine" aspect of the platform.

## Layout & Spacing

The design follows a **12-column fixed grid** for desktop, centered within the viewport to maintain focus on the dashboard content. A sidebar-driven navigation model is used to maximize vertical space for data tables and card grids.

- **Desktop:** 280px fixed sidebar with a fluid content area that caps at 1440px wide.
- **Margins & Gutters:** Generous 32px margins ensure the "clean" aesthetic is maintained. 24px gutters separate dashboard widgets.
- **Rhythm:** An 8px base unit controls all spacing, with most card internal padding set to 24px (3x) to create a spacious, high-end feel.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Subtle Ambient Shadows**. 

1. **Background:** The base layer is a very light neutral gray (#F8F9FA).
2. **Cards:** Pure white surfaces with a very soft, diffused shadow (0px 4px 20px, 4% opacity black) to separate them from the background.
3. **AI Modules:** Deep charcoal or primary-tinted surfaces are used to denote "special" AI processing areas, creating a "recessed" or "elevated" focal point.
4. **Interactivity:** Elements gain a slightly tighter, darker shadow on hover to simulate physical "lift."

## Shapes

The shape language uses **Rounded** corners to soften the professional grid and make the AI tech feel more approachable.

- **Primary Containers:** 1rem (16px) radius for dashboard cards and major sections.
- **Inputs & Small Components:** 0.5rem (8px) radius for buttons and form fields.
- **Tags & Status:** Full pill-shape (circular ends) for status indicators to distinguish them from interactive buttons.

## Components

- **Buttons:** Primary buttons use the brand orange with white text. They should have a subtle gradient (top-to-bottom) to give them a tactile, "pressable" quality.
- **AI Score Cards:** These are the centerpiece. Use high-contrast dark backgrounds with neon green accents for data points (percentages, scores) to highlight machine-generated insights.
- **Dashboard Widgets:** Use a consistent header style with an icon, title, and "info" tooltip. 
- **Input Fields:** Minimalist styling with a 1px border. On focus, the border should change to the brand orange with a soft glow effect.
- **Chips/Badges:** Small, pill-shaped indicators. Use a light tint of the status color (e.g., light green background for success text) for readability.
- **Side Navigation:** Uses high-contrast active states. The active menu item should have a vertical brand-orange "indicator" bar on the left or right edge.