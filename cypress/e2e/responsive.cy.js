// Layouts at the screen sizes of the manual suite: [TC-056] desktop, [TC-057] phone, [TC-085] narrow screens.
import { InventoryPage } from '../support/pages';

const SIZES = [
  { tc: 'TC-056', name: 'desktop', width: 1366, height: 768 },
  { tc: '', name: 'tablet', width: 768, height: 1024 },
  { tc: 'TC-057', name: 'phone', width: 375, height: 667 },
  { tc: 'TC-085', name: 'small phone (480)', width: 480, height: 640 },
  { tc: 'TC-085', name: 'narrow phone (320)', width: 320, height: 640 },
];

describe('Responsive layout', () => {
  SIZES.forEach(({ tc, name, width, height }) => {
    context(`${name} ${width}x${height}`, () => {
      beforeEach(() => { cy.login(); cy.viewport(width, height); InventoryPage.open(); });

      it(`${tc ? `[${tc}] ` : ''}the products page has no horizontal scroll`, () => {
        InventoryPage.items().should('have.length', 6);
        cy.window().should((win) => expect(win.document.documentElement.scrollWidth, 'page width').to.be.at.most(win.innerWidth));
      });

      it('the cart and the menu are usable', () => {
        cy.addToCart('sauce-labs-backpack');
        InventoryPage.openCart();
        cy.url().should('include', '/cart.html');
        InventoryPage.openMenu();
        cy.dt('inventory-sidebar-link').should('be.visible');
      });
    });
  });
});
