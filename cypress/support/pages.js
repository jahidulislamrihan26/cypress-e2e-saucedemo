// Small page helpers: where a screen's selectors and common actions live, so specs read as user actions.
// (Cypress favours custom commands over heavy page-object classes; this keeps the useful part of the pattern.)
const money = (text) => Number(text.replace(/[^0-9.]/g, ''));
const BUYER = { first: 'Ada', last: 'Lovelace', zip: '12345' };

export const LoginPage = {
  open: () => cy.visit('/'),
  signIn: (username, password) => {
    if (username) cy.dt('username').type(username);
    if (password) cy.dt('password').type(password, { log: false });
    cy.dt('login-button').click();
  },
  error: () => cy.dt('error'),
};

export const InventoryPage = {
  open: () => cy.visit('/inventory.html'),
  items: () => cy.dt('inventory-item'),
  names: () => cy.dt('inventory-item-name').then(($e) => [...$e].map((e) => e.innerText)),
  prices: () => cy.dt('inventory-item-price').then(($e) => [...$e].map((e) => money(e.innerText))),
  imageSources: () => cy.get('img.inventory_item_img').then(($e) => [...$e].map((e) => e.getAttribute('src'))),
  sortBy: (value) => cy.dt('product-sort-container').select(value),
  badge: () => cy.dt('shopping-cart-badge'),
  openCart: () => cy.dt('shopping-cart-link').click(),
  openMenu: () => cy.get('#react-burger-menu-btn').click(),
  logout: () => { cy.get('#react-burger-menu-btn').click(); cy.dt('logout-sidebar-link').click(); },
  resetAppState: () => { cy.get('#react-burger-menu-btn').click(); cy.dt('reset-sidebar-link').click(); },
};

export const CartPage = {
  open: () => cy.visit('/cart.html'),
  items: () => cy.dt('inventory-item'),
  remove: (slug) => cy.dt(`remove-${slug}`).click(),
  checkout: () => cy.dt('checkout').click(),
};

export const CheckoutPage = {
  fillInfo: ({ first, last, zip }) => {
    if (first) cy.dt('firstName').type(first, { delay: 0 });
    if (last) cy.dt('lastName').type(last, { delay: 0 });
    if (zip) cy.dt('postalCode').type(zip, { delay: 0 });
    cy.dt('continue').click();
  },
  error: () => cy.dt('error'),
  amounts: () => cy.get('[data-test="subtotal-label"], [data-test="tax-label"], [data-test="total-label"]').then(($e) => [...$e].map((e) => money(e.innerText))),
  finish: () => cy.dt('finish').click(),
  money,
};

// Whole journeys, for tests that are about something else than the journey itself. Assume the user is logged in.
export const Flow = {
  buyer: BUYER,
  toCheckoutForm: (...slugs) => {
    InventoryPage.open();
    cy.addToCart(...slugs);
    InventoryPage.openCart();
    CartPage.checkout();
  },
  toOverview: (...slugs) => { Flow.toCheckoutForm(...slugs); CheckoutPage.fillInfo(BUYER); cy.url().should('include', 'checkout-step-two'); },
  placeOrder: (...slugs) => { Flow.toOverview(...slugs); CheckoutPage.finish(); cy.dt('complete-header').should('be.visible'); },
};
