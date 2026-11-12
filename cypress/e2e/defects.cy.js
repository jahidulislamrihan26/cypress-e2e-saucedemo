// Known defects of the standard user's journey. Same convention as personas.cy.js: each test shows how the defect looks today,
// carries [TC-nnn][BUG-nnn] in its title, passes while the defect exists and fails the day it is fixed.
import { InventoryPage, CheckoutPage, CartPage, Flow } from '../support/pages';

describe('Checkout and cart (known defects)', () => {
  beforeEach(() => { cy.login(); });

  it('[TC-038][BUG-001] known defect: checkout can be started with an empty cart', () => {
    InventoryPage.open();
    InventoryPage.openCart();
    CartPage.checkout();
    cy.url().should('include', 'checkout-step-one');
  });

  it('[TC-042][BUG-002] known defect: any text is accepted as a postal code', () => {
    Flow.toCheckoutForm('sauce-labs-backpack');
    CheckoutPage.fillInfo({ first: 'Ada', last: 'Lovelace', zip: 'abc!@#' });
    cy.url().should('include', 'checkout-step-two');
  });

  it('[TC-043][BUG-002] known defect: whitespace-only values are accepted', () => {
    Flow.toCheckoutForm('sauce-labs-backpack');
    CheckoutPage.fillInfo({ first: ' ', last: ' ', zip: ' ' });
    cy.url().should('include', 'checkout-step-two');
  });

  it('[TC-044][BUG-002] known defect: a 300-character first name is accepted', () => {
    Flow.toCheckoutForm('sauce-labs-backpack');
    CheckoutPage.fillInfo({ first: 'A'.repeat(300), last: 'Lovelace', zip: '12345' });
    cy.url().should('include', 'checkout-step-two');
  });

  it('[TC-034][BUG-003] known defect: Reset App State clears the badge but leaves the buttons on Remove', () => {
    InventoryPage.open();
    cy.addToCart('sauce-labs-backpack');
    InventoryPage.resetAppState();
    InventoryPage.badge().should('not.exist');
    cy.dt('remove-sauce-labs-backpack').should('be.visible');
  });

  it('[TC-080][BUG-017] known defect: the sort choice is lost after viewing a product', () => {
    InventoryPage.open();
    InventoryPage.sortBy('za');
    cy.get('[data-test="inventory-item-name"]').first().click();
    cy.dt('back-to-products').click();
    cy.dt('product-sort-container').should('have.value', 'az');
  });
});

describe('Addresses and the Back button (known defects)', () => {
  beforeEach(() => { cy.login(); });

  it('[TC-073][BUG-014] known defect: the order confirmation opens without an order', () => {
    cy.visit('/checkout-complete.html');
    cy.dt('complete-header').should('have.text', 'Thank you for your order!');
  });

  it('[TC-074][BUG-015] known defect: the overview opens with an empty cart and a working Finish button', () => {
    cy.visit('/checkout-step-two.html');
    cy.dt('finish').should('be.visible');
  });

  it('[TC-075][BUG-015] known defect: Back after an order returns to the overview and Finish still works', () => {
    Flow.placeOrder('sauce-labs-backpack');
    cy.go('back');
    cy.url().should('include', 'checkout-step-two');
    cy.dt('finish').should('be.visible');
  });

  it('[TC-072][BUG-019] known defect: the product not-found page is worded for a telephone line', () => {
    cy.visit('/inventory-item.html?id=999');
    cy.dt('inventory-item-name').should('have.text', 'ITEM NOT FOUND');
    cy.get('body').should('contain.text', 'your call could not be completed');
  });

  it('[TC-072][BUG-019] known defect: an unknown address shows a blank page', () => {
    cy.visit('/nonexistent-page.html');
    cy.get('body').should(($b) => expect($b[0].innerText.trim(), 'visible text').to.equal(''));
  });
});
