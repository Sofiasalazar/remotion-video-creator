# Design Spec: Video Creator

---

## 1. Tool Overview

- **What it does:** AI-powered social media video creator that lets users describe a concept, pick a template, customize text and colors, preview in real time via Remotion Player, and export as MP4 or PNG frames.
- **Target user:** Small business owners, marketers, and content creators who need quick branded video clips (15-30s) for social media without professional video editing software.
- **Key differentiator:** Real-time browser-based video preview and export with no account, no backend, and optional AI script generation -- all running locally in the browser.

---

## 2. Layout

### Desktop (1024px+)

```
+---------------------------------------------------------------+
| HEADER: Logo | Tool Title | Token Counter | Settings (gear)   |
+---------------------------------------------------------------+
| DATA NOTICE BANNER                                            |
+---------------------------------------------------------------+
|                    |                                           |
|   LEFT PANEL       |   MAIN AREA                              |
|   (380px fixed)    |   (fluid)                                |
|                    |                                           |
|   Step 1: Concept  |   Remotion Player Preview                |
|   Step 2: Template  |   (16:9 aspect ratio, centered)         |
|   Step 3: Customize |                                          |
|   Step 4: Export    |                                          |
|                    |                                           |
|                    |   Timeline / Duration Bar                 |
|                    |                                           |
+---------------------------------------------------------------+
| FOOTER CTA                                                    |
+---------------------------------------------------------------+
```

- **Left panel:** Scrollable wizard-style form, fixed width 380px, with `#0A0A0A` background and `#262626` right border.
- **Main area:** Fluid width, contains the Remotion Player preview centered vertically and horizontally.
- **Header:** Fixed top, 56px height.
- **Footer:** Sticky bottom, 48px height.

### Tablet (768px - 1023px)

- Left panel collapses to 320px.
- Preview area scales proportionally.

### Mobile (<768px)

- Single-column layout. Left panel stacks above the preview.
- Wizard steps become a collapsible accordion -- only the active step is expanded.
- Preview scales to full width with maintained 16:9 aspect ratio.
- Export buttons become full-width.

---

## 3. Component Specs

### 3.1 Header

| Element | Detail |
|---------|--------|
| **Logo** | Agenticsis robot SVG (white fill, 32x32px), left-aligned |
| **Tool title** | "Video Creator" -- Inter 600, 18px, `#F5F5F5` |
| **Token counter** | Right side, see Section 4.3 |
| **Settings gear icon** | 20px, `#A3A3A3`, opens Settings Modal on click |
| **Background** | `#0A0A0A` |
| **Border** | Bottom border 1px `#262626` |
| **Height** | 56px |

### 3.2 Data Notice Banner

- **Position:** Directly below header, full width.
- **Background:** `#262626` with 1px bottom border `#262626`.
- **Icon:** Info icon (circle-i), `#8b5cf6`, 16px, left of text.
- **Copy:** "This app has no database. Your video project lives only in this browser tab. Refreshing or closing will erase everything. Export before leaving."
- **Text:** Inter 400, 13px, `#A3A3A3`.
- **Dismiss:** Small "x" button on the right, `#A3A3A3`. Once dismissed, banner hides for the session (not persisted).
- **Padding:** 10px 16px.

### 3.3 Left Panel -- Wizard Steps

The left panel contains four sequential steps. Each step has a header bar that shows the step number, title, and completion status. The active step is expanded; completed steps show a summary and can be re-expanded by clicking.

**Step indicator pattern:**
- Step number circle: 24px diameter. Active = `#8b5cf6` fill with white number. Completed = `#84cc16` fill with white checkmark. Upcoming = `#262626` fill with `#A3A3A3` number.
- Step title: Inter 600, 14px, `#F5F5F5` (active/completed) or `#A3A3A3` (upcoming).
- Connector line between steps: 2px wide, `#262626` (incomplete) or `#8b5cf6` (completed), runs vertically on the left.

---

#### Step 1: Concept

**Purpose:** User describes what the video is about.

| Element | Detail |
|---------|--------|
| **Label** | "Describe your video" -- Inter 600, 14px, `#F5F5F5` |
| **Textarea** | 100% width, 120px height, `#0A0A0A` background, `#262626` border, `#F5F5F5` text, Inter 400 14px. Placeholder: "e.g., A 20-second product launch video for our new AI analytics dashboard. Highlight speed, accuracy, and ease of use." |
| **Duration selector** | Row of two pill buttons: "15 seconds" and "30 seconds". Active pill: `#8b5cf6` bg, white text. Inactive: `#262626` bg, `#A3A3A3` text. Default: 15 seconds. |
| **AI Enhance button** | Full width, 40px height. Label: "Enhance with AI" (if API key is set) or "Enhance with AI (set API key first)" (disabled state, `#262626` bg, `#A3A3A3` text). Active state: gradient `from-violet-600 to-purple-600`, white text, Inter 600 14px. On click: sends concept to Anthropic API, returns a polished script that auto-fills Step 3 text fields. Loading state: spinner icon + "Generating script..." |
| **"Next" button** | Full width, 40px height, `#8b5cf6` bg, white text, Inter 600 14px. Disabled (`#262626` bg) until textarea has content. |

---

#### Step 2: Template Style

**Purpose:** User picks a visual template for the video.

| Element | Detail |
|---------|--------|
| **Label** | "Choose a template" -- Inter 600, 14px, `#F5F5F5` |
| **Template grid** | 2-column grid of template cards, 8px gap |

**Template cards (5 total):**

Each card:
- Size: fills column width, ~160px height.
- Background: `#141414`.
- Border: 2px `#262626`. Selected state: 2px `#8b5cf6` with subtle violet glow (`box-shadow: 0 0 12px rgba(139, 92, 246, 0.3)`).
- Corner radius: 12px.
- Content: Centered icon/illustration (40px, `#8b5cf6`) + template name below (Inter 600, 13px, `#F5F5F5`) + short description (Inter 400, 11px, `#A3A3A3`).
- Hover: border transitions to `#8b5cf6` at 50% opacity, 150ms ease.

**Templates:**

1. **Product Launch** -- Icon: rocket. Description: "Bold intro, feature highlights, CTA"
2. **Social Media Promo** -- Icon: megaphone. Description: "Eye-catching promo with dynamic text"
3. **Text Animation** -- Icon: type/text cursor. Description: "Kinetic typography, minimal and clean"
4. **Testimonial / Quote** -- Icon: quote marks. Description: "Customer quote with attribution"
5. **Company Intro** -- Icon: building/briefcase. Description: "Who you are, what you do, why it matters"

The 5th card spans full width of the 2-column grid.

**"Next" button:** Same style as Step 1. Disabled until a template is selected.

---

#### Step 3: Customize

**Purpose:** User edits the text, colors, and media for each scene of the selected template.

| Element | Detail |
|---------|--------|
| **Label** | "Customize your video" -- Inter 600, 14px, `#F5F5F5` |

**Scene editor:** Each template defines 3-5 scenes. Scenes are shown as a vertical list of collapsible cards.

**Scene card:**
- Header: "Scene 1: Intro" (or appropriate scene label). Inter 600, 13px, `#F5F5F5`. Chevron icon for expand/collapse.
- Background: `#141414`, border 1px `#262626`, border-radius 8px.
- Expanded content:
  - **Headline input:** Label "Headline" (Inter 500, 12px, `#A3A3A3`). Input field, full width, `#0A0A0A` bg, `#262626` border, `#F5F5F5` text, Inter 400 14px. Max 60 chars, character counter shown.
  - **Body text input:** Label "Body text" (same label style). Textarea, 80px height, same styling. Max 120 chars.
  - **Background color picker:** Small 24x24 color swatch + hex input. Default: `#0A0A0A`. Only allows dark backgrounds to maintain readability.
  - **Accent color picker:** Same pattern. Default: `#8b5cf6`.

**Pre-populated content:** If the user clicked "Enhance with AI" in Step 1, all scene text fields are pre-filled with AI-generated copy. Otherwise, placeholder text shows example content for the selected template.

**Global overrides section** (below scene cards):
- **Primary color:** Color picker, default `#8b5cf6`.
- **Accent color:** Color picker, default `#84cc16`.
- **Font style:** Dropdown with 3 options: "Clean (Inter)", "Bold (Inter Black)", "Elegant (serif placeholder)". Default: Clean.
- Changing a global override applies to all scenes that have not been individually customized.

**"Preview" button:** Full width, 40px, gradient `from-violet-600 to-purple-600`, white text. On click: renders the video in the Remotion Player (main area). The button text changes to "Update Preview" after first render.

---

#### Step 4: Export

**Purpose:** User downloads the finished video.

| Element | Detail |
|---------|--------|
| **Label** | "Export your video" -- Inter 600, 14px, `#F5F5F5` |
| **Format selector** | Two option cards, stacked vertically, 8px gap |

**Option card: MP4 Video**
- Icon: film icon, `#8b5cf6`, 24px.
- Title: "MP4 Video" -- Inter 600, 14px, `#F5F5F5`.
- Description: "Full video file, ready for social media" -- Inter 400, 12px, `#A3A3A3`.
- Border: 2px `#262626`, selected: 2px `#8b5cf6`.
- Background: `#141414`, border-radius 8px.

**Option card: PNG Frames**
- Icon: image icon, `#8b5cf6`, 24px.
- Title: "PNG Frames" -- Inter 600, 14px, `#F5F5F5`.
- Description: "Individual frames as images (ZIP download)" -- Inter 400, 12px, `#A3A3A3`.
- Same styling as above.

**Export button:** Full width, 48px height, gradient `from-violet-600 to-purple-600`, white text, Inter 700 16px. Label: "Download MP4" or "Download Frames" depending on selection.
- Loading state: progress bar fills inside the button (violet to lime gradient), percentage text.
- Completed state: button turns `#84cc16` bg, label changes to "Downloaded" with checkmark icon for 3 seconds, then resets.

**Note text:** Below export button. "Export uses your browser's MediaRecorder API. Processing time depends on video length and device performance." -- Inter 400, 12px, `#A3A3A3`.

---

### 3.4 Main Area -- Remotion Player Preview

| Element | Detail |
|---------|--------|
| **Container** | Centered in the main area, max-width 720px, 16:9 aspect ratio, `#000000` background, border-radius 12px, `#262626` border 1px |
| **Player** | Remotion `<Player>` component, fills container. Shows real-time preview of the video composition. |
| **Empty state** | Before any preview is generated (see Section 6) |
| **Playback controls** | Remotion's built-in controls at the bottom of the player: play/pause, seek bar, current time / total time. Styled to match brand (controls bar bg: `#141414`, seek bar track: `#262626`, seek bar fill: `#8b5cf6`, play button: `#F5F5F5`). |

**Below the player:**

| Element | Detail |
|---------|--------|
| **Duration label** | "0:00 / 0:15" or "0:00 / 0:30" -- Inter 500, 13px, `#A3A3A3`. Updates with playback. |
| **Aspect ratio indicator** | Small pill: "16:9" -- `#262626` bg, `#A3A3A3` text, 11px. |

---

### 3.5 Settings Modal

Triggered by the gear icon in the header.

| Element | Detail |
|---------|--------|
| **Overlay** | Full-screen, `rgba(0,0,0,0.7)` backdrop |
| **Modal** | 440px width, centered, `#141414` bg, `#262626` border 1px, border-radius 16px, padding 24px |
| **Title** | "Settings" -- Inter 700, 20px, `#F5F5F5` |
| **Close button** | "x" icon, top-right, `#A3A3A3`, hover `#F5F5F5` |

**API Key Input:**
- **Label:** "Anthropic API Key (optional)" -- Inter 600, 14px, `#F5F5F5`.
- **Sublabel:** "Enables AI-generated video scripts and enhanced copy" -- Inter 400, 12px, `#A3A3A3`.
- **Input:** Full width, type `password`, `#0A0A0A` bg, `#262626` border, `#F5F5F5` text, Inter 400 14px. Placeholder: "sk-ant-...". Toggle visibility icon (eye) on right side.
- **Privacy notice:** Directly below input. "Your API key is stored only in this browser. It is sent directly to Anthropic and never shared with Agenticsis or any third party." -- Inter 400, 12px, `#A3A3A3`. Small lock icon (`#8b5cf6`) left of text.
- **Save button:** "Save Key" -- 120px width, 36px height, `#8b5cf6` bg, white text. Saves to `localStorage`. On success: brief `#84cc16` flash + "Saved" label for 2 seconds.
- **Clear button:** "Clear Key" -- text-only button, `#A3A3A3`, 12px, below Save. Removes key from `localStorage`.

**Video Quality:**
- **Label:** "Export Quality" -- Inter 600, 14px, `#F5F5F5`.
- **Options:** Two radio-style pills: "720p" and "1080p". Default: 720p. Same pill styling as duration selector.

---

## 4. Required Blocks

### 4.1 API Key Input Block

- **Position:** Inside the Settings Modal (Section 3.5), accessed via the gear icon in the header.
- **Behavior:** Key saved to `localStorage` under key `agenticsis_video_creator_api_key`. Read on page load. Never sent to any server other than `api.anthropic.com`.
- **Copy:** "Your API key is stored only in this browser. It is sent directly to Anthropic and never shared with Agenticsis or any third party."
- **Note:** The tool works fully without an API key. The key only enables the "Enhance with AI" feature in Step 1. All manual text input and video creation works without it.

**Visual hint when no API key is set:** A small pill badge in the header next to the gear icon: "AI off" in `#A3A3A3` text, `#262626` bg. When key is set: "AI on" in `#84cc16` text, `rgba(132, 204, 22, 0.1)` bg.

### 4.2 Data Notice Block

- **Position:** Full-width banner below the header (Section 3.2).
- **Copy:** "This app has no database. Your video project lives only in this browser tab. Refreshing or closing will erase everything. Export before leaving."
- **Dismissible:** Yes, for the current session only.

### 4.3 Token + Cost Counter

- **Position:** Header, right side, left of the settings gear icon.
- **Visibility:** Only visible when an API key is set and at least one API call has been made. Hidden otherwise (no empty "0 tokens" display when AI is not in use).
- **Display format:** "142 tokens -- $0.002 (estimated)" -- Inter 400, 12px, `#A3A3A3`.
- **Icon:** Small sparkle/zap icon, `#8b5cf6`, 14px, left of text.
- **Updates:** After each "Enhance with AI" call. Accumulates across the session.
- **Pricing basis:** Anthropic Claude Haiku (or whichever model is used). Show "(estimated)" label.
- **Resets:** On page reload.

### 4.4 Footer CTA

- **Position:** Bottom of the page, full width, 48px height.
- **Background:** `#0A0A0A` with top border 1px `#262626`.
- **Copy:** "Want this tool for your brand? info@agenticsis.top -- we build AI-powered tools for your business."
- **Style:** Inter 400, 13px, `#A3A3A3`, centered.
- **Link:** `info@agenticsis.top` is a `mailto:info@agenticsis.top` link, `#8b5cf6` color, underline on hover.

---

## 5. Color and Typography Application

### Color Map

| UI Zone | Background | Text | Border | Accent |
|---------|-----------|------|--------|--------|
| Page background | `#0A0A0A` | -- | -- | -- |
| Header | `#0A0A0A` | `#F5F5F5` | bottom `#262626` | -- |
| Data notice banner | `#262626` | `#A3A3A3` | -- | `#8b5cf6` (icon) |
| Left panel | `#0A0A0A` | `#F5F5F5` | right `#262626` | -- |
| Cards (template, scene, export) | `#141414` | `#F5F5F5` | `#262626` | `#8b5cf6` (selected) |
| Input fields | `#0A0A0A` | `#F5F5F5` | `#262626` | `#8b5cf6` (focus) |
| Primary buttons | gradient `violet-600 to purple-600` | `#FFFFFF` | none | -- |
| Secondary buttons / pills (active) | `#8b5cf6` | `#FFFFFF` | none | -- |
| Secondary buttons / pills (inactive) | `#262626` | `#A3A3A3` | none | -- |
| Success states | `#84cc16` | `#FFFFFF` | none | -- |
| Preview container | `#000000` | -- | `#262626` | -- |
| Footer | `#0A0A0A` | `#A3A3A3` | top `#262626` | `#8b5cf6` (link) |
| Modal overlay | `rgba(0,0,0,0.7)` | -- | -- | -- |
| Modal | `#141414` | `#F5F5F5` | `#262626` | -- |

### Typography Scale

| Element | Font | Weight | Size | Color |
|---------|------|--------|------|-------|
| Tool title (header) | Inter | 600 | 18px | `#F5F5F5` |
| Step title | Inter | 600 | 14px | `#F5F5F5` |
| Section label | Inter | 600 | 14px | `#F5F5F5` |
| Field label | Inter | 500 | 12px | `#A3A3A3` |
| Body text / input text | Inter | 400 | 14px | `#F5F5F5` |
| Helper text / descriptions | Inter | 400 | 12px | `#A3A3A3` |
| Small labels (pills, badges) | Inter | 500 | 11px | varies |
| Button text (primary) | Inter | 600 | 14px | `#FFFFFF` |
| Button text (export, large) | Inter | 700 | 16px | `#FFFFFF` |
| Data notice | Inter | 400 | 13px | `#A3A3A3` |
| Footer CTA | Inter | 400 | 13px | `#A3A3A3` |
| Token counter | Inter | 400 | 12px | `#A3A3A3` |
| Modal title | Inter | 700 | 20px | `#F5F5F5` |

---

## 6. Empty State + Error States

### Empty State (before first preview)

The Remotion Player area shows a placeholder:

- **Background:** `#000000` with subtle radial gradient center glow (`rgba(139, 92, 246, 0.05)`).
- **Center content:**
  - Play icon outline, 64px, `#262626`.
  - Text below: "Describe your video, pick a template, and hit Preview" -- Inter 500, 16px, `#A3A3A3`.
  - Subtext: "Your video will appear here" -- Inter 400, 13px, `#A3A3A3` at 60% opacity.

### Error States

**General error styling:**
- Background: `rgba(239, 68, 68, 0.1)` (red-500 at 10%).
- Border: 1px `#ef4444`.
- Border-radius: 8px.
- Icon: Alert triangle, `#ef4444`, 16px.
- Text: Inter 400, 13px, `#ef4444`.
- Padding: 12px 16px.

**Specific error cases:**

| Scenario | Message | Location |
|----------|---------|----------|
| AI enhance fails (bad API key) | "Invalid API key. Check your key in Settings and try again." | Below the "Enhance with AI" button in Step 1 |
| AI enhance fails (network) | "Could not reach Anthropic. Check your connection and try again." | Same location |
| AI enhance fails (rate limit) | "Rate limit reached. Wait a moment and try again." | Same location |
| Export fails (browser incompatibility) | "Export failed. Your browser may not support MediaRecorder. Try Chrome or Edge." | Below the export button in Step 4 |
| Export fails (general) | "Export failed. Try reducing video quality in Settings and retry." | Same location |
| Empty concept submitted | "Describe your video concept before continuing." | Inline below textarea, Step 1 |
| No template selected | "Select a template to continue." | Inline below template grid, Step 2 |

**Input validation styling:**
- Invalid field: border changes to `#ef4444`. Error message appears directly below the field.
- Valid field: border remains `#262626` (no green border on valid -- keep it clean).

### Loading States

| Action | Indicator |
|--------|-----------|
| AI enhance generating | Button shows spinner + "Generating script..." -- button disabled, `#262626` bg |
| Preview rendering | Remotion Player shows a pulsing violet ring animation in center + "Rendering preview..." text |
| MP4 exporting | Export button shows progress bar fill (violet-to-lime gradient) + percentage |
| PNG frames exporting | Same progress bar pattern |

---

## 7. Interaction Summary

### User Flow (Happy Path)

1. User lands on the tool. Sees empty state with clear instruction.
2. (Optional) User clicks gear icon, enters Anthropic API key in Settings Modal, saves.
3. User types a video concept in Step 1 textarea.
4. (Optional) User clicks "Enhance with AI" to generate a polished script.
5. User selects duration (15s or 30s) and clicks "Next".
6. User picks a template from the grid in Step 2. Clicks "Next".
7. User customizes scene text and colors in Step 3. Clicks "Preview".
8. Remotion Player renders the video in real time. User can play, pause, seek.
9. User adjusts scenes and clicks "Update Preview" to iterate.
10. User moves to Step 4, selects MP4 or PNG, clicks "Download".
11. File downloads to their device.

### Keyboard and Accessibility

- All interactive elements are focusable and operable via keyboard (Tab, Enter, Space).
- Focus ring: 2px `#8b5cf6` outline with 2px offset.
- Color contrast: all text meets WCAG AA on their respective backgrounds.
- Buttons have `aria-label` where icon-only.
- Modal traps focus when open.

---

## 8. Template Scene Definitions

Each template pre-defines a set of scenes with default structure. These populate Step 3 when a template is selected.

### Product Launch (4 scenes)
1. **Intro** -- Full-screen headline with product name. Bold text zoom-in animation.
2. **Features** -- 3 feature bullet points, appearing sequentially with slide-in.
3. **Demo** -- Large centered text or key stat with background color shift.
4. **CTA** -- Call-to-action text with website/contact. Fade out.

### Social Media Promo (3 scenes)
1. **Hook** -- Attention-grabbing headline, large type, bounce-in animation.
2. **Value** -- Supporting copy with accent-colored keywords.
3. **CTA** -- Action line + contact/link. Slide up.

### Text Animation (3 scenes)
1. **Line 1** -- First text line, typewriter or word-by-word reveal.
2. **Line 2** -- Second text line, same animation style.
3. **Line 3** -- Third text line or tagline, scale-up emphasis.

### Testimonial / Quote (3 scenes)
1. **Quote** -- Large quotation marks + customer quote text. Fade in word by word.
2. **Attribution** -- Customer name, title, company. Slide in from bottom.
3. **CTA** -- Brand name or tagline. Subtle fade.

### Company Intro (4 scenes)
1. **Name** -- Company name, large and centered. Scale-in.
2. **What** -- One-line description of what the company does. Slide in.
3. **Why** -- Key differentiator or value proposition. Fade in.
4. **Contact** -- Website, email, or social handle. Fade out.

---

## 9. Responsive Breakpoint Summary

| Breakpoint | Layout | Left Panel | Preview |
|------------|--------|------------|---------|
| 1024px+ | Side-by-side | 380px fixed | Fluid, max 720px |
| 768-1023px | Side-by-side | 320px fixed | Fluid, scaled |
| <768px | Stacked | Full width, accordion steps | Full width, 16:9 maintained |

On mobile, the wizard step headers become tappable accordion triggers. Only one step is expanded at a time. The preview area sits between the wizard and the footer, scrollable into view.
