// Access-control and transport checks. A defect that exists on the site today is written as a test that PASSES while the defect
// exists, says so in its title, and fails the day the site is fixed (then the test must be rewritten to assert the correct behaviour).
import { InventoryPage } from '../support/pages';

describe('Access control', () => {
  it('[TC-015] @smoke product pages cannot be opened without logging in', () => {
    cy.clearCookies();
    cy.visit('/inventory.html');
    cy.dt('error').should('contain', "Epic sadface: You can only access '/inventory.html' when you are logged in.");
    cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
  });

  it('the cart and checkout pages cannot be opened without logging in', () => {
    cy.clearCookies();
    for (const page of ['/cart.html', '/checkout-step-one.html']) {
      cy.visit(page);
      cy.dt('error').should('contain', 'when you are logged in');
    }
  });

  it('[TC-065][BUG-013] known defect: a forged session-username cookie is accepted as a login', () => {
    // Correct behaviour: a cookie the server never issued is rejected. Today a cookie holding a valid user name
    // is enough to open the shop without the password.
    cy.clearCookies();
    cy.setCookie('session-username', 'standard_user');
    cy.visit('/inventory.html');
    cy.url().should('include', '/inventory.html');
    cy.dt('inventory-item').should('have.length', 6);
  });

  it('[TC-066][BUG-013] known defect: the session cookie is readable by script and not marked Secure', () => {
    cy.login();
    InventoryPage.open();
    cy.getCookie('session-username').should((c) => {
      expect(c.httpOnly, 'HttpOnly').to.equal(false);
      expect(c.secure, 'Secure').to.equal(false);
    });
  });

  it('[TC-067] the session cookie expires after a limited time', () => {
    cy.login();
    InventoryPage.open();
    cy.getCookie('session-username').should((c) => {
      const now = Date.now() / 1000;
      expect(c.expiry, 'expiry').to.be.greaterThan(now);
      expect(c.expiry, 'expires within an hour').to.be.lessThan(now + 3600);
    });
  });

  it('script typed into the login form is not executed', () => {
    cy.visit('/');
    const alert = cy.stub().as('alert');
    cy.on('window:alert', alert);
    cy.dt('username').type('<img src=x onerror="alert(1)">');
    cy.dt('password').type('x');
    cy.dt('login-button').click();
    cy.dt('error').should('be.visible');
    cy.get('@alert').should('not.have.been.called');
  });
});

describe('Transport and headers', () => {
  it('[TC-068] plain HTTP is redirected to HTTPS', () => {
    cy.request({ url: 'http://www.saucedemo.com/', followRedirect: false }).then((res) => {
      expect(res.status).to.be.oneOf([301, 308]);
      expect(res.headers.location).to.match(/^https:\/\//);
    });
  });

  it('[TC-069][BUG-018] known defect: none of the standard security headers are sent', () => {
    cy.request('/').then((res) => {
      for (const h of ['strict-transport-security', 'content-security-policy', 'x-content-type-options', 'referrer-policy']) {
        expect(res.headers, h).to.not.have.property(h);
      }
    });
  });

  it('[TC-070] script text in a product address is not executed', () => {
    cy.login();
    const alert = cy.stub().as('alert');
    cy.on('window:alert', alert);
    cy.visit('/inventory-item.html?id=%3Cscript%3Ealert(1)%3C%2Fscript%3E');
    cy.dt('inventory-item-name').should('have.text', 'ITEM NOT FOUND');
    cy.get('@alert').should('not.have.been.called');
  });
});
