# Theme System Documentation

## Overview
Aplikasi Progres Tracker sekarang mendukung 2 tema warna:
1. **Pink Theme** (default) - Warna pink/magenta yang energik
2. **Sky Blue Theme** - Warna biru langit yang menenangkan

## How to Switch Theme
Klik icon di Navbar:
- 🌤️ = Switch ke Sky Blue theme
- 💗 = Switch ke Pink theme

Theme preference disimpan otomatis di localStorage.

## CSS Variables

### Pink Theme
```css
--primary-light: #FF6B9D
--primary: #E91E63
--primary-dark: #C2185B
--gradient-start: #FF6B9D
--gradient-end: #E91E63
--primary-rgb: 233, 30, 99
```

### Sky Blue Theme
```css
--primary-light: #4FC3F7
--primary: #29B6F6
--primary-dark: #0288D1
--gradient-start: #4FC3F7
--gradient-end: #29B6F6
--primary-rgb: 41, 182, 246
```

## Usage in CSS
```css
/* Solid color */
color: var(--primary);
background: var(--primary-light);
border-color: var(--primary-dark);

/* Gradient */
background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);

/* With opacity (rgba) */
background: rgba(var(--primary-rgb), 0.1);
border: 2px solid rgba(var(--primary-rgb), 0.2);
box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
```

## Files Updated
All CSS files have been converted to use CSS variables:
- ✅ All component CSS files
- ✅ All page CSS files
- ✅ All style files
- ✅ TodoList.js (column colors)

## Technical Implementation
1. **ThemeContext** (`client/src/context/ThemeContext.js`)
   - Manages theme state
   - Saves to localStorage
   - Applies `data-theme` attribute to `<html>`

2. **App.js**
   - Wrapped with `<ThemeProvider>`

3. **Navbar.js**
   - Toggle button with `useTheme()` hook

4. **App.css**
   - Theme variable definitions
   - Applied via `:root[data-theme="..."]`

## Testing
1. Open app in browser
2. Click theme toggle in navbar
3. Verify all colors change (navbar, footer, buttons, cards, etc.)
4. Refresh page - theme should persist
5. Check localStorage: key `appTheme` should be "pink" or "sky"
