import { InventoryPage, CartPage, CheckoutPage } from '../support/pages';

const buyer = { first: 'Ada', last: 'Lovelace', zip: '12345' };

describe('Cart', () => {
  beforeEach(() => { cy.login(); InventoryPage.open(); });

  it('a product added on the list is in the cart with its name and price', () => {
    cy.addToCart('sauce-labs-backpack');
    InventoryPage.openCart();
    CartPage.items().should('have.length', 1).and('contain', 'Sauce Labs Backpack').and('contain', '$29.99');
  });

  it('removing a product empties the cart', () => {
    cy.addToCart('sauce-labs-backpack');
    InventoryPage.openCart();
    CartPage.remove('sauce-labs-backpack');
    CartPage.items().should('have.length', 0);
    InventoryPage.badge().should('not.exist');
  });

  it('the cart survives a page reload', () => {
    cy.addToCart('sauce-labs-bolt-t-shirt');
    InventoryPage.openCart();
    cy.reload();
    CartPage.items().should('have.length', 1);
  });

  it('continue shopping returns to the product list', () => {
    InventoryPage.openCart();
    cy.dt('continue-shopping').click();
    cy.url().should('include', '/inventory.html');
  });
});

describe('Checkout', () => {
  beforeEach(() => {
    cy.login();
    InventoryPage.open();
    cy.addToCart('sauce-labs-backpack', 'sauce-labs-bike-light');
    InventoryPage.openCart();
    CartPage.checkout();
  });

  it('@smoke a complete order ends on the confirmation page', () => {
    CheckoutPage.fillInfo(buyer);
    CheckoutPage.finish();
    cy.dt('complete-header').should('have.text', 'Thank you for your order!');
  });

  it('the order summary adds up: items + tax = total', () => {
    CheckoutPage.fillInfo(buyer);
    CheckoutPage.amounts().should(([subtotal, tax, total]) => {
      expect(subtotal).to.equal(29.99 + 9.99);
      expect(+(subtotal + tax).toFixed(2)).to.equal(total);
    });
  });

  it('a missing first name is reported', () => {
    CheckoutPage.fillInfo({ ...buyer, first: '' });
    CheckoutPage.error().should('contain', 'First Name is required');
  });

  it('a missing last name is reported', () => {
    CheckoutPage.fillInfo({ ...buyer, last: '' });
    CheckoutPage.error().should('contain', 'Last Name is required');
  });

  it('a missing postal code is reported', () => {
    CheckoutPage.fillInfo({ ...buyer, zip: '' });
    CheckoutPage.error().should('contain', 'Postal Code is required');
  });

  it('cancelling goes back to the cart with the products still there', () => {
    cy.dt('cancel').click();
    cy.url().should('include', '/cart.html');
    CartPage.items().should('have.length', 2);
  });

  it('the cart is empty after a completed order', () => {
    CheckoutPage.fillInfo(buyer);
    CheckoutPage.finish();
    cy.dt('back-to-products').click();
    InventoryPage.badge().should('not.exist');
  });
});
