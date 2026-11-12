import { LoginPage, InventoryPage } from '../support/pages';

// Each test title carries the id of the manual test case it automates ([TC-nnn]); `npm run trace` builds the traceability table from them.
describe('Login and logout', () => {
  beforeEach(() => LoginPage.open());

  it('[TC-001] @smoke a valid user reaches the product list', () => {
    cy.fixture('users').then(({ standard }) => LoginPage.signIn(standard.username, standard.password));
    cy.url().should('include', '/inventory.html');
    InventoryPage.items().should('have.length', 6);
  });

  it('[TC-002] a locked-out user is told why', () => {
    cy.fixture('users').then(({ locked }) => LoginPage.signIn(locked.username, locked.password));
    LoginPage.error().should('contain', 'locked out');
  });

  it('[TC-003] a wrong password is rejected with a clear message', () => {
    cy.fixture('users').then(({ wrongPassword }) => LoginPage.signIn(wrongPassword.username, wrongPassword.password));
    LoginPage.error().should('contain', 'Username and password do not match');
    cy.url().should('not.include', 'inventory');
  });

  it('[TC-004] an empty username is reported', () => {
    LoginPage.signIn('', 'secret_sauce');
    LoginPage.error().should('contain', 'Username is required');
  });

  it('[TC-005] an empty password is reported', () => {
    LoginPage.signIn('standard_user', '');
    LoginPage.error().should('contain', 'Password is required');
  });

  it('[TC-006] both fields empty is reported', () => {
    LoginPage.signIn('', '');
    LoginPage.error().should('contain', 'Username is required');
  });

  it('[TC-007] the username is case sensitive', () => {
    LoginPage.signIn('STANDARD_USER', 'secret_sauce');
    LoginPage.error().should('contain', 'Username and password do not match');
  });

  it('[TC-008] a username with a leading space is rejected', () => {
    LoginPage.signIn(' standard_user', 'secret_sauce');
    LoginPage.error().should('contain', 'Username and password do not match');
  });

  it('[TC-009] an SQL injection string in the username is rejected', () => {
    LoginPage.signIn("' OR '1'='1", 'x');
    LoginPage.error().should('contain', 'Username and password do not match');
    cy.url().should('not.include', 'inventory');
  });

  it('[TC-010] the password is masked while typing', () => {
    cy.dt('password').should('have.attr', 'type', 'password');
  });

  it('[TC-011] the Enter key submits the login form', () => {
    cy.dt('username').type('standard_user');
    cy.dt('password').type('secret_sauce{enter}', { log: false });
    cy.url().should('include', '/inventory.html');
  });

  it('[TC-012] the error banner can be dismissed', () => {
    LoginPage.signIn('', '');
    LoginPage.error().should('be.visible');
    cy.dt('error-button').click();
    cy.dt('error').should('not.exist');
  });

  it('[TC-017] logout returns to the login page and closes the session', () => {
    cy.login();
    InventoryPage.open();
    InventoryPage.logout();
    cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
    cy.visit('/inventory.html');
    LoginPage.error().should('contain', 'when you are logged in');
  });

  it('[TC-018] the cart contents are kept after logging out and in again', () => {
    cy.login();
    InventoryPage.open();
    cy.addToCart('sauce-labs-backpack');
    InventoryPage.logout();
    cy.fixture('users').then(({ standard }) => LoginPage.signIn(standard.username, standard.password));
    InventoryPage.badge().should('have.text', '1');
  });
});
