// Access-control checks. Defects that exist on the site today are written as tests that PASS while the defect exists
// and say so in their title, so the suite stays green for known problems and goes red the day the site is fixed
// (then the test must be rewritten to assert the correct behaviour). See docs in the manual-testing repository (BUG-013).
describe('Access control', () => {
  it('@smoke product pages cannot be opened without logging in', () => {
    cy.clearCookies();
    cy.visit('/inventory.html', { failOnStatusCode: false });
    cy.dt('error').should('contain', "Epic sadface: You can only access '/inventory.html' when you are logged in.");
    cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
  });

  it('the cart and checkout pages cannot be opened without logging in', () => {
    cy.clearCookies();
    for (const page of ['/cart.html', '/checkout-step-one.html']) {
      cy.visit(page, { failOnStatusCode: false });
      cy.dt('error').should('contain', 'when you are logged in');
    }
  });

  it('[BUG-013, known defect] a forged session-username cookie is accepted as a login', () => {
    // Correct behaviour: the server rejects a cookie it never issued. Today it does not: any value works.
    cy.clearCookies();
    cy.setCookie('session-username', 'someone_who_never_logged_in');
    cy.visit('/inventory.html');
    cy.url().should('include', '/inventory.html'); // passes while the defect exists
    cy.dt('inventory-item').should('have.length', 6);
  });

  it('the login form does not execute script typed into it', () => {
    cy.visit('/');
    cy.dt('username').type('<img src=x onerror="window.__xss=1">');
    cy.dt('password').type('x');
    cy.dt('login-button').click();
    cy.window().its('__xss').should('be.undefined');
  });
});
