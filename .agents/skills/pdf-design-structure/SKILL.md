# PDF Style Application Guide

This document defines how PDF styling rules should be applied structurally inside the rendering engine.

The purpose is not to define themes or colors, but to explain how each style property affects layout, spacing, rendering behavior, and document structure.

---

# Page

```toml
[page]
size = "A4"
margin = 48
background = "#FFFFFF"
```

## size

Defines the physical dimensions of the document page.

Example:

```txt
A4
Width: 595pt
Height: 842pt
```

The page size affects:

* layout boundaries
* line wrapping
* pagination
* available content width
* available content height

The renderer should calculate:

```txt
usable_width = page_width - (margin_left + margin_right)
usable_height = page_height - (margin_top + margin_bottom)
```

The layout engine must never place content outside the usable area.

---

## margin

Defines the spacing between the page edges and the content area.

Example:

```txt
48pt top
48pt bottom
48pt left
48pt right
```

Margins create visual breathing room.

All layout calculations should start from the margin origin.

Example:

```txt
cursor_x = margin_left
cursor_y = margin_top
```

The margin system should remain consistent across all pages.

---

## background

Defines the page background color.

The renderer should:

1. Draw the page background first
2. Render all content above it

Rendering order:

```txt
background
↓
layout elements
↓
text
↓
decorations
```

---

# Body

```toml
[body]
font_family = "Inter"
font_size = 12
color = "#1F2937"
line_height = 1.5
```

## font_family

Defines the default font used for body text.

The layout engine must:

* load the font
* calculate glyph metrics
* calculate line widths
* calculate line height
* calculate wrapping positions

The font influences:

* text width
* text height
* wrapping behavior
* pagination

---

## font_size

Defines the base body text size.

The renderer should use this value when calculating:

```txt
line width
line height
paragraph height
page overflow
```

Larger font sizes increase:

* vertical space usage
* wrapping frequency
* total page count

---

## color

Defines the default text color.

The renderer should apply it before drawing text.

Example flow:

```txt
set text color
↓
render glyphs
```

---

## line_height

Defines the vertical spacing between lines.

Example:

```txt
font_size = 12
line_height = 1.5

computed_line_height = 18
```

The layout engine must use the computed line height for:

* multiline paragraphs
* text wrapping
* paragraph sizing
* pagination calculations

Proper line height improves readability.

---

# Heading H1

```toml
[heading.h1]
font_size = 30
color = "#111827"
margin_bottom = 16
```

## font_size

Defines the visual hierarchy of the heading.

The layout engine should:

* switch to heading font size
* recalculate line metrics
* increase block height

Headings should visually separate sections.

---

## margin_bottom

Defines spacing below the heading.

Example flow:

```txt
render heading
↓
advance cursor_y by heading_height
↓
advance cursor_y by margin_bottom
```

This spacing separates the heading from following content.

The margin should not collapse.

---

# Heading H2

```toml
[heading.h2]
font_size = 22
color = "#2563EB"
margin_bottom = 12
```

H2 behaves similarly to H1 but with smaller visual priority.

The hierarchy should feel progressive:

```txt
H1 > H2 > body
```

Spacing and sizing should reinforce hierarchy.

---

# Code Block

```toml
[code_block]
font_family = "JetBrains Mono"
font_size = 10
color = "#E5E7EB"
background = "#111827"
padding = 12
```

## font_family

Monospace fonts should preserve alignment and indentation.

The renderer must:

* preserve spaces
* preserve indentation
* avoid proportional glyph spacing

---

## background

The renderer should draw a background rectangle before rendering code text.

Rendering order:

```txt
draw background rect
↓
apply padding
↓
render code text
```

---

## padding

Defines internal spacing between the background rectangle and the text.

Example:

```txt
code area
  padding
    code text
```

Padding should apply to:

* top
* bottom
* left
* right

The layout engine must include padding in total block height calculations.

Example:

```txt
block_height = text_height + padding_top + padding_bottom
```

---

## code block structure

Code blocks should feel isolated from normal content.

Recommended structure:

```txt
space before
↓
background block
↓
padding
↓
code lines
↓
space after
```

Never allow code blocks to visually merge with paragraphs.

---

# Quote

```toml
[quote]
color = "#374151"
border_left_color = "#3B82F6"
border_left_width = 4
padding_left = 12
```

## border_left_width

Defines the width of the quote vertical line.

The renderer should:

1. Draw vertical rectangle
2. Offset quote content horizontally
3. Render quote text

Example:

```txt
border
space
quote content
```

---

## padding_left

Defines spacing between the border and the quote text.

Example calculation:

```txt
quote_content_x = border_width + padding_left
```

The quote text should never touch the border directly.

---

## quote layout

Quotes should feel visually separated from body content.

Recommended flow:

```txt
space before
↓
left border
↓
padded quote text
↓
space after
```

Quotes should maintain readability and hierarchy.

---

# Cursor Flow

The layout engine should work with a vertical cursor system.

Example:

```txt
cursor_y
↓
render block
↓
advance cursor_y
↓
render next block
```

Every block should:

1. Calculate its required height
2. Check page overflow
3. Trigger pagination if needed
4. Render itself
5. Advance the cursor

---

# Pagination

Before rendering a block:

```txt
if cursor_y + block_height > usable_page_height
  create new page
  reset cursor_y
```

The engine should avoid:

* orphan headings
* split code blocks
* broken visual groups

---

# Rendering Order

Recommended rendering order:

```txt
page background
↓
block backgrounds
↓
borders
↓
text
↓
decorations
```

This prevents visual overlap issues.

---

# Layout Philosophy

The renderer should behave like a document engine, not like a browser.

The goal is:

```txt
predictable
stable
structured
readable
professional
```

Every style property should influence:

* layout
* spacing
* hierarchy
* rendering flow
* pagination

not only visual appearance.
