import { InventoryPage } from '../support/pages';

describe('Product list', () => {
  beforeEach(() => { cy.login(); InventoryPage.open(); });

  it('[TC-019] @smoke shows six products, each with a name, price and add button', () => {
    InventoryPage.items().should('have.length', 6).each(($item) => {
      cy.wrap($item).find('[data-test="inventory-item-name"]').should('not.be.empty');
      cy.wrap($item).find('[data-test="inventory-item-price"]').invoke('text').should('match', /^\$\d+\.\d{2}$/);
      cy.wrap($item).find('button').should('have.text', 'Add to cart');
    });
  });

  it('[TC-020] every product image has alternative text', () => {
    cy.get('img.inventory_item_img').should('have.length', 6).each(($img) => expect($img.attr('alt'), 'alt text').to.not.be.empty);
  });

  it('[TC-024] the default sort is name A to Z', () => {
    cy.dt('product-sort-container').should('have.value', 'az');
    InventoryPage.names().should((names) => expect(names).to.deep.equal([...names].sort()));
  });

  it('[TC-025] sorts by name, Z to A', () => {
    InventoryPage.sortBy('za');
    InventoryPage.names().should((names) => expect(names).to.deep.equal([...names].sort().reverse()));
  });

  it('[TC-026] sorts by price, low to high', () => {
    InventoryPage.sortBy('lohi');
    InventoryPage.prices().should((prices) => expect(prices).to.deep.equal([...prices].sort((a, b) => a - b)));
  });

  it('[TC-027] sorts by price, high to low', () => {
    InventoryPage.sortBy('hilo');
    InventoryPage.prices().should((prices) => expect(prices).to.deep.equal([...prices].sort((a, b) => b - a)));
  });

  it('[TC-021] opening a product shows its detail page', () => {
    cy.dt('item-4-title-link').click();
    cy.url().should('include', '/inventory-item.html?id=4');
    cy.dt('inventory-item-name').should('contain', 'Backpack');
    cy.dt('back-to-products').click();
    cy.url().should('include', '/inventory.html');
  });

  it('[TC-030] adding a product shows it in the cart badge and turns the button into Remove', () => {
    cy.addToCart('sauce-labs-backpack');
    InventoryPage.badge().should('have.text', '1');
    cy.dt('remove-sauce-labs-backpack').should('have.text', 'Remove');
  });

  it('[TC-031] removing a product lowers the badge', () => {
    cy.addToCart('sauce-labs-backpack', 'sauce-labs-bike-light', 'sauce-labs-onesie');
    InventoryPage.badge().should('have.text', '3');
    cy.dt('remove-sauce-labs-bike-light').click();
    InventoryPage.badge().should('have.text', '2');
  });

  it('[TC-076] all six products can be added to the cart', () => {
    cy.get('button.btn_inventory').each(($b) => cy.wrap($b).click());
    InventoryPage.badge().should('have.text', '6');
  });

  it('[TC-078] a double-click on Add to cart leaves the cart consistent', () => {
    cy.dt('add-to-cart-sauce-labs-backpack').dblclick();
    InventoryPage.badge().should('have.text', '1');
  });

  it('[TC-033] Reset App State clears the cart badge', () => {
    cy.addToCart('sauce-labs-backpack');
    InventoryPage.badge().should('have.text', '1');
    InventoryPage.resetAppState();
    InventoryPage.badge().should('not.exist');
  });

  it('[TC-079] adding from a product page is reflected in the list', () => {
    cy.dt('item-4-title-link').click();
    cy.dt('add-to-cart').click();
    cy.dt('back-to-products').click();
    InventoryPage.badge().should('have.text', '1');
    cy.dt('remove-sauce-labs-backpack').should('be.visible');
  });
});
