Web App Development Rules

Important Rules You HAVE TO FOLLOW

Rule A — Debug Logs & Comments

- Always add debug logs where useful for troubleshooting.
- Always add comments to explain important sections of code.
- Keep comments simple and easy to understand.

Rule B — State Applied Rules

- Every time you choose to apply a rule, explicitly state which rule(s) were applied.
- Example:
  - Applied: Simple Solutions
  - Applied: Error Handling
  - Applied: Reuse Existing Code

Rule C — Confidence Before Changes

- Do not make any code changes until you have at least 95% confidence that you understand what needs to be built.
- Ask follow-up questions until you reach that confidence level.
- Never guess requirements.

⸻

Project Structure

Folder Structure

All files should be placed inside:

/Social Media Calendar

Example:

/Social Media Calendar
├── app
├── components
├── pages
├── services
├── hooks
├── lib
├── types
├── tests
└── public

⸻

Tech Stack

Frontend

- Modern web framework (React preferred)
- TypeScript preferred
- Responsive design for desktop, tablet, and mobile

Backend

- Supabase

Database

- Supabase Database

Authentication

- Supabase Auth

Monetization

- Stripe (or another web payment provider if specified)

Analytics

- TelemetryDeck (if web support is required)
- Otherwise use a privacy-friendly analytics tool approved for the project

⸻

Web-Specific Rules

0. General Coding

Simple Solutions First

- Always prefer the simplest solution that works.
- Avoid unnecessary complexity.

Avoid Duplication

- Reuse existing code whenever possible.
- Check the project before creating new functionality.

Environment Support

Support:

- Development
- Testing
- Production

Store environment-specific values in environment variables.

Clean Code

- Keep files clean and organized.
- Avoid large files.
- Refactor files when they exceed approximately 200–300 lines.

No Fake Production Data

- Mock data is only allowed in tests.
- Never use fake or placeholder data in production features.
- Never use fake or placeholder data in development unless specifically requested.

Environment Files

- Never overwrite environment files without asking first.
- Never expose secrets in code.

⸻

1. State Management

Choose the Simplest State Location

Use:

Local Component State

For state only used inside a single component.

Examples:

- Form inputs
- Toggle switches
- Open/closed menus

Shared State

For state used across multiple pages or components.

Examples:

- Logged-in user
- Subscription status
- App settings

Server Data

Use Supabase as the source of truth for data stored online.

Avoid duplicating server data unnecessarily.

⸻

2. Performance Optimization

Lists

- Use efficient rendering for large lists.
- Avoid loading large amounts of data at once.

Images

- Optimize image loading.
- Load images only when needed.

Data Requests

- Fetch only required data.
- Avoid repeated requests for the same information.

Stable Keys

- Use stable IDs when rendering lists.

⸻

3. Component Design

Small Components

- Create focused components.
- Each component should have one main responsibility.

Reusable Components

Create reusable components when multiple screens need the same functionality.

Examples:

- Buttons
- Forms
- Cards
- Modals
- Navigation items

⸻

4. Routing & Navigation

Clear Navigation

- Keep page navigation simple.
- Avoid confusing page flows.

Error Pages

Provide pages for:

- Not Found (404)
- Unauthorized Access
- General Errors

⸻

5. Lifecycle & Loading States

Loading States

Always show feedback while data is loading.

Examples:

- Loading spinner
- Skeleton loader
- Loading text

Empty States

Show helpful messages when no data exists.

Error States

Show clear error messages when something fails.

⸻

6. Data Flow

Single Source of Truth

- Supabase should be the main source of stored data.
- Avoid keeping multiple versions of the same data.

Error Handling

Every data request should handle:

- Success
- Loading
- Error

Validation

Validate user input before saving data.

⸻

7. Testing

Unit Tests

Write tests for:

- Business logic
- Utility functions
- Data processing

Integration Tests

Test:

- Database interactions
- Authentication flows
- Payment flows

End-to-End Tests

Test critical user journeys.

Examples:

- Sign up
- Sign in
- Upgrade subscription
- Create record
- Edit record
- Delete record

⸻

8. Frontend Patterns

Forms

- Validate before submission.
- Show useful validation messages.

Responsive Design

Support:

- Mobile
- Tablet
- Desktop

Accessibility

Ensure:

- Readable text
- Keyboard navigation
- Screen reader support
- Clear button labels

⸻

9. Security

Authentication

- Protect private pages.
- Verify user identity before allowing sensitive actions.

Secrets

- Never expose API keys.
- Never expose private credentials.

User Data

- Store user information securely.
- Follow privacy best practices.

Database Rules

- Use proper Supabase security policies.
- Restrict access to authorized users only.

⸻

10. Declarations

Before Creating New Files

Check whether the file already exists.

Before Creating New Components

Check whether similar functionality already exists.

Before Creating New Types

Check whether the type already exists.

Avoid duplicate code structures.

⸻

11. No Extra Projects

- Keep everything inside one web app project unless explicitly requested.
- Avoid creating separate applications, packages, or repositories.
- Keep the codebase easy to understand.

⸻

Standard Build Workflow

Step 1 — Understand Requirements

- Review requirements.
- Ask questions.
- Reach 95% confidence before coding.

Step 2 — Check Existing Code

- Look for reusable code.
- Avoid duplication.

Step 3 — Plan Changes

- List affected files.
- Explain intended changes.

Step 4 — Implement

- Add code.
- Add comments.
- Add debug logs.

Step 5 — Test

Verify:

- Happy path
- Error cases
- Empty states
- Edge cases

Step 6 — Review

Check:

- Simplicity
- Readability
- Reusability
- Security
- Performance

Step 7 — Report

At the end of each implementation, list:

Files Changed

- File 1
- File 2

Rules Applied

- Simple Solutions
- Reuse Existing Code
- Error Handling
- Security
- Responsive Design

Testing Performed

- Test 1
- Test 2
- Test 3
