## 2026-05-12 - Baseline Accessibility for Interactive Elements
**Learning:** Even in newly initialized projects, establishing baseline accessibility (like `aria-label` for buttons) and logical focus states is a critical "invisible" UX layer. It ensures the interface is usable for all from day one.
**Action:** Always include accessibility labels for core interactive elements during implementation to prevent "a11y debt".

## 2026-05-13 - State-Aware Button UX
**Learning:** Disabling action buttons when they are irrelevant (e.g., "Reset" at zero) reduces cognitive load, provided it's paired with a clear visual state and an explanatory tooltip for why it's disabled.
**Action:** Use the `disabled` attribute for logically inactive states and provide `title` or `aria-description` to explain the state to the user.

## 2026-05-14 - Dynamic Page Title for Micro-Feedback
**Learning:** Updating the document title to reflect the application state (e.g., current count) provides useful feedback in the browser tab, helping users track state even when they aren't actively viewing the page.
**Action:** Use `useEffect` to sync important application states with `document.title` for better tab identification and UX.

## 2026-05-17 - Keyboard Shortcuts for Frictionless Interactions
**Learning:** For utility micro-apps like counters, adding keyboard shortcuts (e.g., +, -, R) significantly reduces friction and improves accessibility for power users and those with motor impairments. Coupling these with ARIA live regions ensures the state change is announced even if focus isn't moved.
**Action:** Implement global keyboard listeners for common actions in micro-utilities and provide visual hints (tooltips) for discoverability.
