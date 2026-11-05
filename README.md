# Cypress End-to-End Tests: SauceDemo

[![CI](https://github.com/jahidulislamrihan26/cypress-e2e-saucedemo/actions/workflows/ci.yml/badge.svg)](https://github.com/jahidulislamrihan26/cypress-e2e-saucedemo/actions/workflows/ci.yml) Part of the [SQA portfolio](https://github.com/jahidulislamrihan26/sqa-portfolio).

A compact **Cypress** suite for the public [SauceDemo](https://www.saucedemo.com) web shop: login, product list, cart, checkout and access control. It sits next to the larger [Playwright suite](https://github.com/jahidulislamrihan26/playwright-ui-automation-pom) for the same site, so the two tools can be compared on the same application.

## What is covered
| Area | Checks |
|---|---|
| Login and logout | valid login, wrong password, locked-out user, empty fields, masked password, logout closes the session |
| Product list | six products with name, price and button; sort by price and by name; cart badge counts; product detail page |
| Cart | product and price shown, remove, survives a reload, continue shopping |
| Checkout | full order to the confirmation page, summary adds up (items + tax = total), each missing field reported, cancel, cart empty afterwards |
| Access control | pages need a login, script typed into the form is not executed, and the known **forged-cookie login bypass** ([BUG-013](https://github.com/jahidulislamrihan26/manual-testing-saucedemo/blob/main/defects/BUG-013.md)) |

29 tests in 4 spec files. Tests tagged `@smoke` in the title are the short list to run first.

## How it is built
- **Custom commands** (`cypress/support/commands.js`): `cy.login()` logs in once and caches the session with `cy.session`, so only the login tests use the login page. `cy.dt(id)` selects by the site's `data-test` attribute, which does not change when the styling does.
- **Page helpers** (`cypress/support/pages.js`): selectors and actions for each screen, so a spec reads as what a user does. Cypress favours commands over heavy page-object classes, so these are plain objects.
- **No fixed waits.** Cypress retries every assertion until it passes or times out.
- **Known defects stay visible.** A defect that exists today is written as a test that passes while it exists and carries `[BUG-nnn, known defect]` in its title. The day the site is fixed the test fails and has to be rewritten.
- **CI:** every push, and nightly because the target is a public site. Screenshots and JUnit results are kept as build artifacts.

## Run it
```bash
npm install
npx cypress install     # downloads the Cypress binary the first time
npm test                # headless run
npm run open            # interactive runner
```
On a machine where Cypress's window cannot start because of GPU problems, run with `NO_GPU=1`.

## Dependency security
`npm audit` reports 5 advisories (2 high, 3 moderate, 0 critical), all inside Cypress's own dependencies. CI fails on any critical one. Dependabot is set to monthly and holds back Cypress major versions.

## Related projects
[playwright-ui-automation-pom](https://github.com/jahidulislamrihan26/playwright-ui-automation-pom) (the larger suite for the same site) · [manual-testing-saucedemo](https://github.com/jahidulislamrihan26/manual-testing-saucedemo) · [api-testing-newman-openapi](https://github.com/jahidulislamrihan26/api-testing-newman-openapi) · [k6-performance-testing](https://github.com/jahidulislamrihan26/k6-performance-testing) · [qa-templates](https://github.com/jahidulislamrihan26/qa-templates)

## License
Released under the [MIT License](LICENSE). Copyright (c) 2026 Md. Jahidul Islam Rihan.
