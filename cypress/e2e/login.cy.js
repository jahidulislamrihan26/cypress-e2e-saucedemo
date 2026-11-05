import { LoginPage, InventoryPage } from '../support/pages';

describe('Login and logout', () => {
  beforeEach(() => LoginPage.open());

  it('@smoke a valid user reaches the product list', () => {
    cy.fixture('users').then(({ standard }) => LoginPage.signIn(standard.username, standard.password));
    cy.url().should('include', '/inventory.html');
    InventoryPage.items().should('have.length', 6);
  });

  it('a wrong password is rejected with a clear message', () => {
    cy.fixture('users').then(({ wrongPassword }) => LoginPage.signIn(wrongPassword.username, wrongPassword.password));
    LoginPage.error().should('contain', 'Username and password do not match');
    cy.url().should('not.include', 'inventory');
  });

  it('a locked-out user is told why', () => {
    cy.fixture('users').then(({ locked }) => LoginPage.signIn(locked.username, locked.password));
    LoginPage.error().should('contain', 'locked out');
  });

  it('an empty username is reported', () => {
    LoginPage.signIn('', 'secret_sauce');
    LoginPage.error().should('contain', 'Username is required');
  });

  it('an empty password is reported', () => {
    LoginPage.signIn('standard_user', '');
    LoginPage.error().should('contain', 'Password is required');
  });

  it('the password is masked while typing', () => {
    cy.dt('password').should('have.attr', 'type', 'password');
  });

  it('logout returns to the login page and closes the session', () => {
    cy.login();
    InventoryPage.open();
    InventoryPage.logout();
    cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
    cy.visit('/inventory.html', { failOnStatusCode: false });
    LoginPage.error().should('contain', 'when you are logged in');
  });
});
