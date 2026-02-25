# Implementation Plan: [Feature Name]

> Source: `docs/features/<feature-slug>.md`
> Created: YYYY-MM-DD
> Status: draft | approved | in-progress | completed

## Overview

[1-2 sentence summary of what this feature delivers to the user]

## Affected Files

### Existing files to modify

| File | Change description |
|---|---|
| `src/...` | ... |

### New files to create

| File | Purpose |
|---|---|
| `src/...` | ... |

## Data Model

### Content Collection changes

```typescript
// New or modified collection schemas
```

### Frontmatter changes

| Field | Type | Required | Description |
|---|---|---|---|
| ... | ... | ... | ... |

## Component Breakdown

| Component | Type | Props | Notes |
|---|---|---|---|
| ... | Astro / Island | ... | ... |

## Implementation Steps

Steps are ordered by dependency. Each step should leave the site in a deployable state.

### Step 1: [Title]
- **Complexity**: S / M / L
- **Files**: `src/...`
- **What**: [What to do]
- **Acceptance**: [How to verify it works]

### Step 2: [Title]
- **Complexity**: S / M / L
- **Files**: `src/...`
- **What**: [What to do]
- **Acceptance**: [How to verify it works]

## NFR Considerations

- **Performance**: [Impact on bundle size, load time, zero-JS compliance]
- **SEO**: [Meta tags, structured data, URL structure]
- **Accessibility**: [ARIA, keyboard nav, screen reader considerations]
- **Mobile**: [Responsive behavior, touch targets, sticky elements]
- **Security**: [Input validation, rate limiting, XSS prevention]

## Testing Approach

- [ ] Visual check on desktop and mobile viewports
- [ ] Lighthouse score check (performance, accessibility, SEO)
- [ ] Content renders correctly from markdown
- [ ] [Feature-specific checks]

## Open Questions

- [ ] [Any unresolved decisions or clarifications needed from the user]

## Follow-up Tasks

- [ ] [Improvements or related work to do after this feature ships]
