// Custom commands. `cy.login` caches the session, so only the login tests pay for the login page.
// SauceDemo is a single-page app on static hosting: opening an inner page directly (such as /inventory.html) is answered
// with HTTP 404 and the app then renders the page anyway. Tests check what the user sees, so a 404 on a visit is not a failure.
Cypress.Commands.overwrite('visit', (original, url, options = {}) => original(url, { failOnStatusCode: false, ...options }));

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
