// Custom commands. `cy.login` caches the session, so only the login tests pay for the login page.
Cypress.Commands.add('dt', (id) => cy.get(`[data-test="${id}"]`)); // select by the site's data-test attribute

Cypress.Commands.add('login', (user = 'standard') => {
  cy.fixture('users').then((users) => {
    const { username, password } = users[user];
    cy.session(['login', username], () => {
      cy.visit('/');
      cy.dt('username').type(username);
      cy.dt('password').type(password, { log: false });
      cy.dt('login-button').click();
      cy.url().should('include', '/inventory.html');
    });
  });
});

Cypress.Commands.add('addToCart', (...slugs) => slugs.forEach((s) => cy.dt(`add-to-cart-${s}`).click()));
