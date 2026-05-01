# ADR 0171: Shell Panel Spacing and Inspector Disclosure Polish

## Context

Following the refactor of the Inspector information architecture (Slice 168b) and scrollbar governance (Slice 168c), the application UI reached a state where structural clarity was high, but visual rhythm and density needed refinement. 

Observed issues included:
- Unnecessary vertical separator lines between the left tool rail, map workspace, and right inspector panel.
- Excessive horizontal padding in shell panels wasting desktop screen real estate.
- Inconsistent top alignment across the shell panels.
- Browser-default heading margins creating unexpected vertical offsets.
- Redundant horizontal divider lines inside expanded Inspector disclosures.

## Decision

We will perform a focused CSS and layout polish pass to achieve a more premium, "integrated" desktop feel.

### Shell Panel Layout
- **Remove Vertical Separators**: The `border-right` on the `.left-panel` and `border-left` on the `.right-panel` are removed. The distinct background colors already provide sufficient semantic separation without adding visual noise.
- **Normalize Padding**: Horizontal padding for `.left-panel`, `.workspace`, and `.right-panel` is reduced and unified using a shared `--openvayra-cities-shell-padding-x` token.
- **Align Top Rhythm**: The top margins and padding are adjusted to ensure the tool rail, map, and inspector content align cleanly at the top of their respective containers.

### Typography
- **Heading Reset**: A global reset is applied to `h1` through `h6` to set `margin-top: 0`. This ensures that headings do not introduce accidental white space at the top of components or panels. Component-specific bottom margins are preserved or added where necessary.

### Inspector Disclosures
- **Reduce Divider Noise**: The `border-top` on `.inspector-disclosure` remains to separate stacked disclosures, but redundant dividers inside the disclosure content are minimized. 
- **Readability**: Ensure text remains high-contrast against the dark background.

## Consequences

- **Increased Map Space**: Reduced padding recovers valuable horizontal pixels for the map workspace.
- **Cleaned Visual Rhythm**: Removing separators and normalizing offsets makes the app feel more professional and less "boxed in."
- **Improved Scannability**: Predictable heading offsets improve the information hierarchy.
- **Lower Visual Fatigue**: Fewer lines and tighter spacing reduce the cognitive load of the dense desktop interface.

## Non-Goals
- No changes to Inspector tab ownership or projection logic.
- No changes to map behavior or routing coverage.
- No new transport modes or mobile support.
