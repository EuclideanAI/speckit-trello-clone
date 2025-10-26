# Accessibility Testing Guide - Task Creation Form (T081)

## Overview
This document provides a comprehensive accessibility testing checklist for the task creation form in the Kanban board application.

## Accessibility Features Implemented

### 1. ARIA Labels and Roles

#### "Add a card" Button
- **ARIA Label**: `Add a new task to {column.name} column`
- **Purpose**: Provides context about which column the task will be added to
- **Icon**: Plus icon marked as `aria-hidden="true"` (decorative)

#### Task Creation Form
- **Role**: `form`
- **ARIA Label**: `Add new task`
- **Purpose**: Clearly identifies the form's purpose to screen readers

#### Task Title Input
- **ARIA Label**: `Task title`
- **ARIA Required**: `true`
- **ARIA Invalid**: Dynamic (`true` when empty after typing, `false` otherwise)
- **Auto Focus**: Yes - input is automatically focused when form opens

#### Submit Button ("Add card")
- **ARIA Label**: `Add new task to column`
- **Loading State**: Button text changes to "Adding..." during submission
- **Disabled State**: Button is disabled when title is empty or submitting

#### Cancel Button
- **ARIA Label**: `Cancel adding task`
- **Icon**: X icon marked as `aria-hidden="true"` (decorative)

### 2. Keyboard Navigation

#### Keyboard Shortcuts
- **Ctrl+N** (Windows/Linux) or **Cmd+N** (Mac): Opens task creation form in first column
- **Enter**: Submits the form when input is focused
- **Escape**: Cancels and closes the form
- **Tab/Shift+Tab**: Navigate between form elements (input → submit button → cancel button)

#### Focus Management
- Input receives automatic focus when form opens
- Focus is maintained during typing
- Focus returns to appropriate element after form closes

### 3. Screen Reader Support

#### Semantic HTML
- Proper use of `<button>` elements
- Form wrapped in semantic `role="form"`
- Column wrapped in `role="region"` with descriptive label

#### State Announcements
- Button disabled states are properly announced
- Loading state ("Adding...") is announced during submission
- Form validation state changes are announced via `aria-invalid`

### 4. Visual Accessibility
- **Focus Indicators**: Blue border (border-2 border-blue-500) on input when focused
- **Color Contrast**: Sufficient contrast between text and background
- **Button States**: Visual changes for hover, focus, and disabled states

## Manual Testing Checklist

### Screen Reader Testing

#### VoiceOver (macOS)
```bash
# Enable VoiceOver
Cmd + F5

# Test Steps:
1. Navigate to board (VO + Right Arrow)
2. Find "Add a card" button
   - Verify it announces: "Add a new task to [Column Name] column, button"
3. Activate button (VO + Space)
4. Verify form announcement: "Add new task, form"
5. Verify input announcement: "Task title, required, edit text"
6. Type text and verify it's read back
7. Navigate to "Add card" button (VO + Right Arrow)
   - Verify it announces: "Add new task to column, button"
8. Navigate to cancel button
   - Verify it announces: "Cancel adding task, button"
```

#### NVDA (Windows)
```bash
# Start NVDA
Ctrl + Alt + N

# Test Steps:
1. Navigate to board (Down Arrow)
2. Find "Add a card" button
   - Verify announcement includes column context
3. Activate button (Space or Enter)
4. Verify form elements are properly announced
5. Test Tab navigation between elements
6. Verify button states are announced
```

#### JAWS (Windows)
```bash
# Test Steps:
1. Navigate through page with Down Arrow
2. Verify all interactive elements are announced
3. Verify form labels and requirements are clear
4. Test keyboard shortcuts
5. Verify loading states are announced
```

### Keyboard-Only Navigation Testing

1. **Open Browser** (Chrome, Firefox, or Safari)
2. **Navigate to Kanban Board** using keyboard only (no mouse)

#### Test Scenarios:

##### Scenario 1: Basic Navigation
- [ ] Tab to "Add a card" button
- [ ] Press Enter to open form
- [ ] Verify input is focused (cursor visible)
- [ ] Tab to "Add card" button
- [ ] Verify button has visible focus indicator
- [ ] Tab to cancel button (X)
- [ ] Verify button has visible focus indicator
- [ ] Shift+Tab backwards through elements
- [ ] Verify focus order is logical

##### Scenario 2: Keyboard Shortcut
- [ ] Press Ctrl+N (or Cmd+N on Mac)
- [ ] Verify form opens in first column
- [ ] Verify input is automatically focused
- [ ] Type "Test Task"
- [ ] Press Enter
- [ ] Verify task is created (page reloads)

##### Scenario 3: Form Submission
- [ ] Open form with Tab + Enter
- [ ] Type task title
- [ ] Press Enter to submit
- [ ] Verify task is created

##### Scenario 4: Form Cancellation
- [ ] Open form
- [ ] Type some text
- [ ] Press Escape
- [ ] Verify form closes without creating task
- [ ] Verify "Add a card" button is available again

##### Scenario 5: Validation
- [ ] Open form
- [ ] Leave input empty
- [ ] Try to Tab to "Add card" button
- [ ] Verify button is disabled (cannot activate)
- [ ] Type text
- [ ] Verify button becomes enabled

### Visual Focus Indicators

Run the application and verify:
- [ ] All interactive elements have visible focus indicators
- [ ] Focus indicators have sufficient contrast (WCAG 2.1 Level AA: 3:1 minimum)
- [ ] Focus indicators are not obscured by other elements
- [ ] Focus indicators are consistent across the application

### Color Contrast Testing

Use browser DevTools or online tools:

1. **Chrome DevTools**:
   - Open DevTools (F12)
   - Go to Elements tab
   - Select input element
   - Check contrast in Styles panel

2. **Online Tools**:
   - [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
   - Test combinations:
     - Input text on white background
     - Button text on blue background (#2563EB)
     - Placeholder text on white background
     - Disabled button text

### Required Contrast Ratios (WCAG 2.1 Level AA):
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

## Automated Testing

### Install Dependencies
```bash
npm install --save-dev jest-axe @axe-core/react
```

### Run Accessibility Tests
```bash
npm test -- __tests__/accessibility/task-creation.test.tsx
```

### Expected Test Results
All tests should pass with:
- ✅ No accessibility violations (axe-core)
- ✅ All ARIA labels present and correct
- ✅ Keyboard navigation working
- ✅ Focus management working correctly

## Common Issues to Check

### 1. Missing Labels
- [ ] All form inputs have associated labels
- [ ] Labels are programmatically associated (not just visual)
- [ ] Buttons have accessible names (via aria-label or text content)

### 2. Keyboard Traps
- [ ] User can Tab through all interactive elements
- [ ] User can Tab backwards with Shift+Tab
- [ ] No elements trap keyboard focus
- [ ] Escape key always works to cancel/close

### 3. Focus Management
- [ ] Focus is set to input when form opens
- [ ] Focus order is logical (top to bottom, left to right)
- [ ] Focus is restored when form closes
- [ ] Focus never gets lost

### 4. Screen Reader Announcements
- [ ] All interactive elements are announced
- [ ] Purpose of each element is clear
- [ ] State changes are announced (loading, disabled, invalid)
- [ ] Decorative elements are hidden (aria-hidden="true")

## Success Criteria

The task creation form is considered accessible when:

1. ✅ **WCAG 2.1 Level AA Compliance**
   - All automated tests pass
   - Manual testing confirms compliance

2. ✅ **Keyboard Accessibility**
   - All functionality available via keyboard
   - Logical tab order
   - Visible focus indicators

3. ✅ **Screen Reader Compatibility**
   - Works with VoiceOver, NVDA, and JAWS
   - All elements properly announced
   - State changes communicated

4. ✅ **Focus Management**
   - Auto-focus on form open
   - No focus traps
   - Predictable focus behavior

5. ✅ **Clear Labels and Instructions**
   - All inputs have labels
   - Required fields marked
   - Error states communicated

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [axe DevTools Browser Extension](https://www.deque.com/axe/devtools/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)

## Testing Completed

- [X] ARIA labels and roles added
- [X] Keyboard navigation implemented (Tab, Enter, Escape, Ctrl/Cmd+N)
- [X] Focus management implemented
- [X] Documentation created
- [ ] Manual screen reader testing (requires user testing)
- [ ] Automated axe-core testing (requires jest-axe installation)

## Notes

The implementation includes all required accessibility features per WCAG 2.1 Level AA guidelines. Manual testing with actual screen readers is recommended to validate the user experience, but automated tests can catch most issues.
