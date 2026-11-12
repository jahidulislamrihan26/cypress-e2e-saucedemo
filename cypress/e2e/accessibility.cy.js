// Automated accessibility scan with axe-core (WCAG 2.0/2.1 A and AA rules, including colour contrast) on the main pages.
// Rule: no violation of impact "critical". Automated scans find only part of the problems: keyboard focus and screen-reader
// behaviour are checked in the manual suite (TC-084, TC-086) and in the Playwright project.
import { InventoryPage, Flow } from '../support/pages';

const OPTIONS = {
  runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
  includedImpacts: ['critical'],
};
const scan = () => { cy.injectAxe(); cy.checkA11y(null, OPTIONS); };

describe('Accessibility scan (axe-core)', () => {
  it('[TC-060] the login page has no critical violations', () => {
    cy.visit('/');
    cy.dt('login-button').should('be.visible');
    scan();
  });

  context('signed in', () => {
    beforeEach(() => cy.login());

    it('[TC-060] the products page has no critical violations', () => {
      InventoryPage.open();
      InventoryPage.items().should('have.length', 6);
      scan();
    });

    it('[TC-060] the product detail page has no critical violations', () => {
      cy.visit('/inventory-item.html?id=4');
      cy.dt('inventory-item-name').should('contain', 'Backpack');
      scan();
    });

    it('[TC-060] the cart page has no critical violations', () => {
      cy.visit('/cart.html');
      cy.dt('checkout').should('be.visible');
      scan();
    });

    it('[TC-060] the checkout form has no critical violations', () => {
      Flow.toCheckoutForm('sauce-labs-backpack');
      cy.dt('firstName').should('be.visible');
      scan();
    });

    it('[TC-060] the checkout overview has no critical violations', () => {
      Flow.toOverview('sauce-labs-backpack');
      cy.dt('finish').should('be.visible');
      scan();
    });

    it('[TC-060] the order confirmation has no critical violations', () => {
      Flow.placeOrder('sauce-labs-backpack');
      scan();
    });

    it('[TC-059] every main page has a title and a language', () => {
      for (const page of ['/inventory.html', '/cart.html']) {
        cy.visit(page);
        cy.title().should('not.be.empty');
        cy.get('html').should('have.attr', 'lang');
      }
    });
  });
});
