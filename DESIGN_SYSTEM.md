# Loopify Design System & Style Guide

## Brand Identity

### Name & Positioning
**Loopify** is a premium, professional waste management platform using AI and sustainability principles.

- **Mission:** Transform waste into opportunity through intelligent classification and circular economy practices
- **Vision:** Make sustainability accessible, intelligent, and effortless for everyone
- **Values:** Precision, Trust, Impact, Accessibility, Sustainability

---

## Visual Design System

### Color Palette

#### Primary Color
- **Sage Green (#6b9e83)** — Natural, growth-oriented, trustworthy
- Used for: Buttons, links, active states, primary CTAs, accents
- Hover: #5a8e72 (darker)
- Disabled: 50% opacity

#### Backgrounds
- **Black (#000)** — Premium, sophisticated, modern
- **Deep Charcoal (#1a1a1a)** — Card backgrounds, surfaces
- **Very Dark Gray (#0d0d0d)** — Subtle backgrounds, containers
- **Dark Gray (#333)** — Borders, dividers

#### Text
- **Off-white (#f5f5f5)** — Primary text, high contrast
- **Medium Gray (#999)** — Secondary text, muted
- **Light Gray (#666)** — Tertiary text, hints

#### Utility Colors
- **Success:** Sage Green (#6b9e83)
- **Warning:** Amber (#fbbf24)
- **Danger:** Rose (#f43f5e)
- **Info:** Sky Blue (#0ea5e9)

#### Semantic Colors (WasteLens Categories)
- **Compostable:** Emerald Green (#10b981)
- **Recyclable:** Sky Blue (#0ea5e9)
- **Reusable:** Amber (#fbbf24)
- **Landfill:** Rose (#f43f5e)

### Typography

#### Font Family
```css
-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif
```

Rationale: System fonts for maximum clarity and platform consistency (Apple design principle)

#### Font Sizes & Weights

| Usage | Size | Weight | Line Height |
|-------|------|--------|-------------|
| Hero Title | 48px | 700 | 1.2 |
| Page Title | 36px | 700 | 1.3 |
| Section Title | 24px | 600 | 1.4 |
| Heading H3 | 20px | 600 | 1.4 |
| Heading H4 | 16px | 600 | 1.5 |
| Body | 14px | 400 | 1.6 |
| Small | 12px | 400 | 1.5 |
| Label | 12px | 500 | 1.5 |
| Tiny | 11px | 400 | 1.4 |

### Spacing System

```
Base unit: 4px
Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128
```

| Spacing | Size |
|---------|------|
| xs | 4px |
| sm | 8px |
| md | 12px |
| lg | 16px |
| xl | 24px |
| 2xl | 32px |
| 3xl | 48px |

### Border Radius

| Component | Radius |
|-----------|--------|
| Buttons | 8px |
| Cards | 12px |
| Inputs | 8px |
| Badges | 20px |
| Small elements | 6px |

### Shadows

#### Shadow System
```css
/* Light elevation */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

/* Medium elevation */
box-shadow: 0 8px 24px rgba(107, 158, 131, 0.15);

/* High elevation (hover states) */
box-shadow: 0 12px 48px rgba(107, 158, 131, 0.2);
```

---

## Component Library

### Buttons

#### Primary Button
```html
<button class="button-primary">Action</button>
```

Styles:
- Background: Sage Green (#6b9e83)
- Text: White
- Padding: 12px 24px
- Border Radius: 8px
- Font Weight: 500
- Hover: Darker green, lifted 2px
- Active: Return to baseline
- Disabled: 50% opacity, not-allowed cursor

#### Secondary Button
```html
<button class="button-secondary">Alternative</button>
```

Styles:
- Background: Transparent
- Border: 1.5px Sage Green
- Text: Sage Green
- Padding: 10px 20px
- Hover: 10% sage background, lifted 2px
- Disabled: 50% opacity

### Cards

#### Premium Card
```html
<div class="card-premium">Content</div>
```

Styles:
- Background: #1a1a1a
- Border: 1px #333
- Border Radius: 12px
- Padding: 24px
- Hover: Border changes to sage green, subtle shadow

### Input Fields

#### Premium Input
```html
<input class="input-premium" type="text" />
```

Styles:
- Background: #1a1a1a
- Border: 1px #333
- Color: #f5f5f5
- Padding: 12px 16px
- Focus: Sage border + 3px sage shadow
- Placeholder: #666

### Badges

#### Sage Badge
```html
<span class="badge-sage">Label</span>
```

Styles:
- Background: rgba(107, 158, 131, 0.15)
- Color: #6b9e83
- Padding: 6px 14px
- Border Radius: 20px
- Font Size: 12px
- Font Weight: 600
- Letter Spacing: 0.5px

---

## Micro-interactions & Animations

### Transitions
```css
transition: all 0.3s ease; /* Default */
transition: all 0.2s ease; /* Quick feedback */
transition: color 0.3s ease; /* Link hover */
transition: width 0.6s ease; /* Progress bars */
```

### Button Hover
```css
transform: translateY(-2px);
box-shadow: 0 8px 20px rgba(107, 158, 131, 0.25);
```

### Button Active
```css
transform: translateY(0);
```

### Link Hover
```css
color: #6b9e83;
```

### Input Focus
```css
outline: none;
border-color: #6b9e83;
box-shadow: 0 0 0 3px rgba(107, 158, 131, 0.1);
```

### Animations

#### Fade In (Page Load)
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}
```

#### Spinner (Loading)
```css
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  border: 2px solid rgba(107, 158, 131, 0.3);
  border-top-color: #6b9e83;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

#### Slide In (Result Display)
```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-in {
  animation: slideIn 0.4s ease-out;
}
```

---

## Layout & Grid

### Container Width
```
Max Width: 1280px (xl)
Padding: 16px (4 units)
```

### Responsive Breakpoints

| Breakpoint | Width | Usage |
|-----------|-------|-------|
| Mobile | < 768px | Phones |
| Tablet | 768px - 1024px | Tablets |
| Desktop | > 1024px | Desktops |

### Grid System
```
2-column grid on desktop (md:grid-cols-2)
1-column on mobile
Gap: 8px or 16px or 24px
```

---

## Navigation

### Top Navigation Bar
- Height: 56px (4px padding top/bottom)
- Background: Black with 50% backdrop blur
- Border: 1px #333
- Sticky positioning: top: 0, z-index: 50
- Logo: Sage text, left-aligned

---

## Cards & Containers

### Premium Card Style
- Background: #1a1a1a
- Border: 1px #333
- Border Radius: 12px
- Padding: 24px (mobile: 16px)
- Hover state: Border becomes sage, shadow appears

### Result Badge
- Background: rgba(107, 158, 131, 0.15)
- Border: 1px #6b9e83
- Padding: 24px
- Border Radius: 12px
- Text align: center

---

## Accessibility

### Color Contrast
- Text on Dark: Minimum 4.5:1 ratio (WCAG AA)
- Primary text: #f5f5f5 on #000 = 18:1 ✓
- Secondary text: #999 on #1a1a1a = 7:1 ✓
- Links: #6b9e83 on #000 = 5.2:1 ✓

### Touch Targets
- Minimum: 48px × 48px
- Preferred: 56px × 56px
- Padding around interactive elements: 8px

### Focus States
- All interactive elements have visible focus ring
- Focus color: Sage green with 3px border
- Not removed, always visible

### Keyboard Navigation
- Tab order: Left to right, top to bottom
- Logical flow through form fields
- Skip links where appropriate

---

## Typography Scale

### Hero Section
```
Title: 48px / 700 weight
Subtitle: 20px / 400 weight
Description: 16px / 400 weight
```

### Page Section
```
Title: 36px / 700 weight
Subtitle: 16px / 400 weight
```

### Card Section
```
Title: 24px / 600 weight
Body: 14px / 400 weight
Label: 12px / 600 weight
```

---

## Dark Mode Strategy

**Platform-wide Dark Mode:**
- Default: Dark mode enabled
- All text colors optimized for dark backgrounds
- No bright whites (use #f5f5f5)
- No harsh contrasts
- Subtle shadows and borders

---

## Icons & Emoji

### Category Icons
- Compostable: 🌱
- Recyclable: ♻️
- Reusable: 🔁
- Landfill: 🗑️

### Action Icons
- Camera: 📷
- Upload: 📁
- File: 💾
- Metrics: 📊
- Settings: ⚙️
- Home: 🏠

---

## Code Examples

### Button
```html
<button class="button-primary">Scan Waste</button>
<button class="button-secondary">Cancel</button>
```

### Card
```html
<div class="card-premium">
  <h3 class="text-lg font-semibold mb-4">Title</h3>
  <p class="text-muted">Content</p>
</div>
```

### Badge
```html
<span class="badge-sage">Active</span>
```

### Input
```html
<input class="input-premium" type="text" placeholder="Enter text" />
```

---

## Performance Guidelines

### Animation Best Practices
1. Use `transform` and `opacity` for animations (GPU-accelerated)
2. Avoid animating: width, height, left, right, etc.
3. Keep animations under 400ms for feedback
4. Use `will-change: transform` sparingly

### Image Guidelines
1. Optimize images before uploading (< 100KB)
2. Use appropriate formats (WebP, JPEG, PNG)
3. Implement lazy loading for below-fold images
4. Provide alt text for all images

---

## Consistency Checklist

- [ ] All buttons use primary or secondary style
- [ ] All cards use card-premium style
- [ ] All inputs use input-premium style
- [ ] All text uses defined font sizes
- [ ] All spacing uses 4px units
- [ ] All colors from defined palette
- [ ] All icons use emoji or SVGs
- [ ] All transitions smooth and professional
- [ ] All focus states visible
- [ ] All text has sufficient contrast

---

**Loopify Design System v1.0**
Last Updated: January 2026
