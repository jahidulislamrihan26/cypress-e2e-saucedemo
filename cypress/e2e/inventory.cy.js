import { InventoryPage } from '../support/pages';

describe('Product list', () => {
  beforeEach(() => { cy.login(); InventoryPage.open(); });

  it('@smoke shows six products, each with a name, price and add button', () => {
    InventoryPage.items().should('have.length', 6).each(($item) => {
      cy.wrap($item).find('[data-test="inventory-item-name"]').should('not.be.empty');
      cy.wrap($item).find('[data-test="inventory-item-price"]').invoke('text').should('match', /^\$\d+\.\d{2}$/);
      cy.wrap($item).find('button').should('have.text', 'Add to cart');
    });
  });

  it('sorts by price, low to high', () => {
    InventoryPage.sortBy('lohi');
    InventoryPage.prices().should((prices) => expect(prices).to.deep.equal([...prices].sort((a, b) => a - b)));
  });

  it('sorts by price, high to low', () => {
    InventoryPage.sortBy('hilo');
    InventoryPage.prices().should((prices) => expect(prices).to.deep.equal([...prices].sort((a, b) => b - a)));
  });

  it('sorts by name, Z to A', () => {
    InventoryPage.sortBy('za');
    InventoryPage.names().should((names) => expect(names).to.deep.equal([...names].sort().reverse()));
  });

  it('adding a product shows it in the cart badge and turns the button into Remove', () => {
    cy.addToCart('sauce-labs-backpack');
    InventoryPage.badge().should('have.text', '1');
    cy.dt('remove-sauce-labs-backpack').should('have.text', 'Remove');
  });

  it('the badge counts every product added and falls when one is removed', () => {
    cy.addToCart('sauce-labs-backpack', 'sauce-labs-bike-light', 'sauce-labs-onesie');
    InventoryPage.badge().should('have.text', '3');
    cy.dt('remove-sauce-labs-bike-light').click();
    InventoryPage.badge().should('have.text', '2');
  });

  it('opening a product shows its detail page', () => {
    cy.dt('item-4-title-link').click();
    cy.url().should('include', '/inventory-item.html?id=4');
    cy.dt('inventory-item-name').should('contain', 'Backpack');
    cy.dt('back-to-products').click();
    cy.url().should('include', '/inventory.html');
  });
});
