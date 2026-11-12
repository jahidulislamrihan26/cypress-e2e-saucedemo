import { InventoryPage, CartPage, CheckoutPage, Flow } from '../support/pages';
import catalog from '../fixtures/catalog.json';

const round2 = (n) => Math.round(n * 100) / 100;

describe('Cart', () => {
  beforeEach(() => { cy.login(); InventoryPage.open(); });

  it('[TC-032] two products added on the list are both in the cart with name and price', () => {
    cy.addToCart('sauce-labs-backpack', 'sauce-labs-bike-light');
    InventoryPage.openCart();
    CartPage.items().should('have.length', 2).and('contain', 'Sauce Labs Backpack').and('contain', '$29.99');
  });

  it('[TC-031] removing a product empties the cart', () => {
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
  beforeEach(() => { cy.login(); });

  it('[TC-051] @smoke a complete order ends on the confirmation page', () => {
    Flow.toOverview('sauce-labs-backpack', 'sauce-labs-bike-light');
    CheckoutPage.finish();
    cy.dt('complete-header').should('have.text', 'Thank you for your order!');
  });

  it('[TC-048] [TC-049] [TC-050] the order summary adds up, with the figures worked out in the test and not read from the page', () => {
    const chosen = catalog.products.slice(0, 3);
    Flow.toOverview(...chosen.map((p) => p.slug));
    const subtotal = round2(chosen.reduce((s, p) => s + p.price, 0));
    const tax = round2(subtotal * catalog.taxRate);
    CheckoutPage.amounts().should((a) => expect(a).to.deep.equal([subtotal, tax, round2(subtotal + tax)]));
  });

  it('[TC-077] totals are correct when all six products are bought', () => {
    Flow.toOverview(...catalog.products.map((p) => p.slug));
    CheckoutPage.amounts().should((a) => expect(a).to.deep.equal([129.94, 10.4, 140.34]));
  });

  [
    ['TC-039', 'first name', { first: '', last: 'Lovelace', zip: '12345' }, 'First Name is required'],
    ['TC-040', 'last name', { first: 'Ada', last: '', zip: '12345' }, 'Last Name is required'],
    ['TC-041', 'postal code', { first: 'Ada', last: 'Lovelace', zip: '' }, 'Postal Code is required'],
  ].forEach(([tc, field, info, message]) => {
    it(`[${tc}] a missing ${field} is reported`, () => {
      Flow.toCheckoutForm('sauce-labs-backpack');
      CheckoutPage.fillInfo(info);
      CheckoutPage.error().should('contain', message);
    });
  });

  it('[TC-045] cancel goes back to the cart with the products still there', () => {
    Flow.toCheckoutForm('sauce-labs-backpack', 'sauce-labs-bike-light');
    cy.dt('cancel').click();
    cy.url().should('include', '/cart.html');
    CartPage.items().should('have.length', 2);
  });

  it('[TC-052] the cart is empty after a completed order', () => {
    Flow.placeOrder('sauce-labs-bike-light');
    InventoryPage.badge().should('not.exist');
  });

  it('[TC-053] Back Home returns to the product list', () => {
    Flow.placeOrder('sauce-labs-bike-light');
    cy.dt('back-to-products').click();
    cy.url().should('include', '/inventory.html');
  });
});
