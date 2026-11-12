// What happens when a shopper types an address (manual-testing charter 5).
describe('Product addresses', () => {
  beforeEach(() => cy.login());

  ['?id=999', '?id=abc', '?id=-1', ''].forEach((id) => {
    it(`[TC-071] a product page with id "${id || '(none)'}" shows a not-found state`, () => {
      cy.visit(`/inventory-item.html${id}`);
      cy.dt('inventory-item-name').should('have.text', 'ITEM NOT FOUND');
    });
  });

  it('[TC-054] the About link points to saucelabs.com', () => {
    cy.visit('/inventory.html');
    cy.get('#about_sidebar_link').should('have.attr', 'href').and('include', 'saucelabs.com');
  });

  it('[TC-055] the footer has the three social links', () => {
    cy.visit('/inventory.html');
    cy.get('footer a').should('have.length', 3).then(($a) => {
      expect([...$a].map((a) => a.href).join(' ')).to.match(/x\.com.*facebook\.com.*linkedin\.com/);
    });
  });
});
