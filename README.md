# Cypress End-to-End Tests: SauceDemo

[![CI](https://github.com/jahidulislamrihan26/cypress-e2e-saucedemo/actions/workflows/ci.yml/badge.svg)](https://github.com/jahidulislamrihan26/cypress-e2e-saucedemo/actions/workflows/ci.yml) Part of the [SQA portfolio](https://github.com/jahidulislamrihan26/sqa-portfolio).

A **Cypress** suite for the public [SauceDemo](https://www.saucedemo.com) web shop, linked test by test to a manual test suite. It tests the same site as the [Playwright](https://github.com/jahidulislamrihan26/playwright-ui-automation-pom) and [Selenium](https://github.com/jahidulislamrihan26/selenium-pytest-saucedemo) projects, so the three tools can be compared on one application.

## Result in one look
| | |
|---|---|
| Tests | **94**, all passing in CI in about one minute, with no retries needed |
| Manual cases automated | **74 of 87 (85%)**, each test titled with its manual case id; the [traceability table](docs/traceability.md) is generated and checked in CI |
| Known defects captured | **18 of 20** logged site defects, including the login bypass with a forged cookie, the missing security headers and the deliberately faulty test users |
| Accessibility | axe-core scan (WCAG 2.0/2.1 A and AA) of all 7 pages: no critical violations |
| Layouts | 5 screen sizes from a 320 px phone to a 1366 px desktop: no horizontal scroll, cart and menu usable |
| Design guide | [docs/test-design.md](docs/test-design.md): layers, naming, how known defects are handled, how to add a test |

## What is covered
| Area | Specs | Checks |
|---|---|---|
| Login and logout | `login.cy.js` | valid login, wrong password, locked-out user, empty fields, case sensitivity, leading space, SQL injection text, masked password, Enter key, dismissing the error, logout, cart kept after logging in again |
| Product list | `inventory.cy.js` | six products, image alt text, default sort, all four sorts, detail page, add and remove, badge counts, all six products, double-click, Reset App State |
| Cart and checkout | `cart-and-checkout.cy.js` | cart contents, full order, totals worked out in the test (3 products and all 6), each missing field, cancel, cart empty afterwards |
| Special test users | `personas.cy.js` | `problem_user`, `error_user`, `performance_glitch_user` and `visual_user`: ten known defects |
| Known defects of the standard user | `defects.cy.js` | empty-cart checkout, accepted bad postal codes and names, Reset App State, sort lost, order pages opened directly, Back after an order, unhelpful not-found pages |
| Security | `security.cy.js` | pages need a login, forged cookie, cookie flags and lifetime, HTTP to HTTPS, security headers, script text not executed |
| Accessibility | `accessibility.cy.js` | axe-core scan of 7 pages, page title and language |
| Responsive | `responsive.cy.js` | 5 screen sizes |
| Navigation | `navigation.cy.js` | invalid product ids, About link, footer links |

## How it is built
- **Custom commands** (`cypress/support/commands.js`): `cy.login()` logs in once per user and caches the session with `cy.session`, so only the login tests use the login page. `cy.dt(id)` selects by the site's `data-test` attribute, which does not change when the styling does.
- **Page helpers** (`cypress/support/pages.js`): selectors, actions and whole journeys (`Flow.toOverview(...)`) for each screen, so a spec reads as what a user does. Cypress favours commands over heavy page-object classes, so these are plain objects.
- **Traceable.** Each test title carries `[TC-nnn]` (the manual case) and `[BUG-nnn]` (the defect). `npm run trace` builds the table.
- **No fixed waits.** Cypress retries every assertion until it passes or times out. The one explicit wait proves a negative (Finish must still do nothing after a short, bounded time).
- **Known defects stay visible.** A defect that exists today is written as a test that passes while it exists and carries `known defect` in its title. The day the site is fixed the test fails and has to be turned round. The faulty `error_user` throws JavaScript errors on purpose; those tests collect the errors as evidence.
- **Two real findings while building it:** the site answers deep links with HTTP 404 and then draws the page (handled once, in `commands.js`), and `error_user` fails any test that does not expect its thrown errors.
- **CI:** every push, and nightly because the target is a public site. The HTML report and screenshots of failures are kept as build artifacts.

## Run it
```bash
npm install
npx cypress install     # downloads the Cypress binary the first time
npm test                # headless run, writes cypress/reports/html/index.html
npm run open            # interactive runner
npm run trace           # rebuild docs/traceability.md
```
On a machine where Cypress's window cannot start because of GPU problems, run with `NO_GPU=1`.

## Dependency security
`npm audit` reports 8 advisories (2 high, 6 moderate, 0 critical), all inside Cypress's and its plugins' own dependencies. CI fails on any critical one. Dependabot is set to monthly and holds back Cypress major versions.

## Related projects
[playwright-ui-automation-pom](https://github.com/jahidulislamrihan26/playwright-ui-automation-pom) (the same site in Playwright) · [selenium-pytest-saucedemo](https://github.com/jahidulislamrihan26/selenium-pytest-saucedemo) (the same site in Selenium) · [manual-testing-saucedemo](https://github.com/jahidulislamrihan26/manual-testing-saucedemo) (the 87 cases and 20 defects these tests are linked to) · [api-testing-newman-openapi](https://github.com/jahidulislamrihan26/api-testing-newman-openapi) · [k6-performance-testing](https://github.com/jahidulislamrihan26/k6-performance-testing) · [qa-templates](https://github.com/jahidulislamrihan26/qa-templates)

## License
Released under the [MIT License](LICENSE). Copyright (c) 2026 Md. Jahidul Islam Rihan.
