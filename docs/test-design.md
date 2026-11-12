# Test Design Guide (Cypress)

How this suite is built and the rules for adding to it. Read this before writing a test.

## 1. Layers (what goes where)
| Layer | Where | Contains | Must not contain |
|---|---|---|---|
| Specs | `cypress/e2e/*.cy.js` | What the shop must do, in plain steps, and the assertions | Selectors, fixed waits |
| Page helpers | `cypress/support/pages.js` | The selectors and actions of one screen, and whole journeys (`Flow.toOverview(...)`) | Test decisions ("this price is right") |
| Custom commands | `cypress/support/commands.js` | `cy.login()` with a cached session, `cy.dt(id)` (select by `data-test`), `cy.addToCart(...)` | |
| Fixtures | `cypress/fixtures/` | Users and the expected catalogue (names, slugs, prices, tax rate) | |

Cypress favours custom commands over heavy page-object classes, so the helpers are plain objects. The aim is the same as in the other projects: a change in the shop's markup should mean one change in one helper, and none in the specs.

## 2. Naming
Every test title has this shape:

```
[TC-042][BUG-002] known defect: any text is accepted as a postal code
 ^^^^^^  ^^^^^^^^  ^ what is true today (or what must be true, for a normal test)
 manual   defect
 case
```

- **`[TC-nnn]`** links the test to a case in the manual suite. `npm run trace` reads these and writes [traceability.md](traceability.md). CI fails if that file is out of date, so the link cannot silently rot.
- **`[BUG-nnn]`** links a known-defect test to its defect report in the manual-testing repository.
- **`@smoke`** marks the short list to run first. A test with no manual case simply has no `[TC-]` prefix.

## 3. Known-defect tests
Cypress has no built-in "expected failure", so a known defect is written the other way round: the test describes **how the defect shows today**, carries `known defect` and `[BUG-nnn]` in its title, and **passes** while the defect exists.

- When the site is fixed, the test fails. That is the signal to turn the assertion round so it states the correct behaviour, and to close the defect.
- A new failure anywhere else turns CI red.
- The other two UI projects for the same site (Playwright and Selenium) state the correct behaviour and mark the test as an expected failure. Both conventions give the same signal; only the direction of the assertion differs.

Special case, `error_user`: this user's faults are JavaScript errors that the site throws on purpose. Cypress fails any test when the application throws, so those specs collect the errors with `cy.on('uncaught:exception', ...)` and assert on them. The error text is part of the evidence for the defect.

## 4. Writing reliable tests
- **No fixed waits.** Cypress retries every assertion until it passes or times out. The only `cy.wait` in the suite is the one that proves a negative (Finish must still do nothing after a short, bounded time).
- **Deep links answer HTTP 404.** The site is a single-page app on static hosting, so opening `/inventory.html` directly returns 404 and then draws the page. `cy.visit` is overridden once, in `commands.js`, so a 404 is not a failure.
- **Expected values come from the test or the fixtures, not from the page.** The totals tests add up the prices and the 8% tax themselves.
- **Log in once per user.** `cy.login()` uses `cy.session`, so only the login tests pay for the login page.
- **Each test is independent.** Cypress clears the browser between tests.

## 5. Adding a test: checklist
1. Is there a manual case? Put its `[TC-nnn]` in the title. A known defect? Add `[BUG-nnn]` and `known defect`.
2. Does a helper already do the action? Reuse it. If not, add it to `pages.js`, not to the spec.
3. Select by `data-test` (`cy.dt`). Avoid long CSS paths.
4. Run `npm test`, then `npm run trace` and commit the updated `docs/traceability.md`.

## 6. What this project deliberately does not do
- **Tab-key checks.** Cypress cannot press Tab natively, so the keyboard defects (BUG-016, BUG-020) are covered by the Selenium and Playwright projects.
- **Cross-browser runs.** CI runs Chrome-family and Electron only; the Playwright project runs Chromium, Firefox and WebKit.
- **Visual (screenshot) comparison.** Baselines made on one machine fail on another.
