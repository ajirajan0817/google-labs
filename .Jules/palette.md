## 2026-05-12 - Baseline Accessibility for Interactive Elements
**Learning:** Even in newly initialized projects, establishing baseline accessibility (like `aria-label` for buttons) and logical focus states is a critical "invisible" UX layer. It ensures the interface is usable for all from day one.
**Action:** Always include accessibility labels for core interactive elements during implementation to prevent "a11y debt".

## 2026-05-13 - State-Aware Button UX
**Learning:** Disabling action buttons when they are irrelevant (e.g., "Reset" at zero) reduces cognitive load, provided it's paired with a clear visual state and an explanatory tooltip for why it's disabled.
**Action:** Use the `disabled` attribute for logically inactive states and provide `title` or `aria-description` to explain the state to the user.
