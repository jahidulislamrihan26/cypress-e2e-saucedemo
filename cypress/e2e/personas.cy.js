// The site ships special users with built-in faults. Each test below describes how the fault shows today and carries
// [TC-nnn][BUG-nnn] in its title (see the manual-testing repository). It PASSES while the defect exists; the day the site is
// fixed it fails, and the assertion must be turned round to state the correct behaviour.
import { InventoryPage, CheckoutPage, CartPage, Flow } from '../support/pages';
import catalog from '../fixtures/catalog.json';

const PRICES = catalog.products.map((p) => p.price);

describe('problem_user (known defects)', () => {
  beforeEach(() => { cy.login('problem'); InventoryPage.open(); });

  it('[TC-022][BUG-004] known defect: the products do not each show their own image', () => {
    InventoryPage.imageSources().should((srcs) => expect(new Set(srcs).size, 'different images').to.be.lessThan(6));
  });

  it('[TC-028][BUG-005] known defect: sorting Z to A has no effect', () => {
    InventoryPage.sortBy('za');
    InventoryPage.names().should((names) => expect(names).to.deep.equal(catalog.products.map((p) => p.name)));
  });

  it('[TC-035][BUG-006] known defect: Add to cart does nothing for the Fleece Jacket', () => {
    cy.dt('add-to-cart-sauce-labs-fleece-jacket').click();
    InventoryPage.badge().should('not.exist');
  });

  it('[TC-036][BUG-006] known defect: Remove does nothing for an added product', () => {
    cy.addToCart('sauce-labs-backpack');
    InventoryPage.badge().should('have.text', '1');
    cy.dt('remove-sauce-labs-backpack').click();
    cy.dt('remove-sauce-labs-backpack').should('be.visible');
  });

  it('[TC-046][BUG-007] known defect: the last name cannot be entered at checkout', () => {
    Flow.toCheckoutForm('sauce-labs-backpack');
    CheckoutPage.fillInfo(Flow.buyer);
    CheckoutPage.error().should('contain', 'Last Name is required');
  });
});

describe('error_user (known defects)', () => {
  // This user's faults are JavaScript errors thrown by the site on purpose. Cypress fails a test on any error thrown by the
  // application, so each test collects them instead: the errors are part of the evidence for the defect.
  let appErrors;
  beforeEach(() => {
    appErrors = [];
    cy.on('uncaught:exception', (err) => { appErrors.push(err.message); return false; });
    cy.login('error');
    InventoryPage.open();
  });

  it('[TC-029][BUG-008] known defect: sorting raises a "Sorting is broken" alert', () => {
    const alert = cy.stub().as('alert');
    cy.on('window:alert', alert);
    InventoryPage.sortBy('za');
    cy.get('@alert').should('have.been.calledWithMatch', /Sorting is broken/);
  });

  it('[TC-037][BUG-009] known defect: Add to cart does nothing for the Bolt T-Shirt', () => {
    cy.dt('add-to-cart-sauce-labs-bolt-t-shirt').click();
    InventoryPage.badge().should('not.exist');
    cy.then(() => expect(appErrors.join(' | '), 'errors thrown by the site').to.contain('Failed to add item to the cart'));
  });

  it('[TC-047][BUG-010] known defect: Finish does nothing, so no order is placed', () => {
    Flow.toOverview('sauce-labs-backpack');
    CheckoutPage.finish();
    // A negative check needs a bounded wait: the page must still be the overview after the click had time to act.
    cy.wait(1500);
    cy.url().should('include', 'checkout-step-two');
    cy.dt('complete-header').should('not.exist');
    cy.then(() => expect(appErrors.length, 'errors thrown by the site').to.be.greaterThan(0));
  });
});

describe('performance_glitch_user and visual_user (known defects)', () => {
  it('[TC-014][BUG-012] known defect: the products take more than 3 seconds to appear after login', () => {
    let start;
    cy.visit('/');
    cy.fixture('users').then(({ glitch }) => {
      cy.dt('username').type(glitch.username);
      cy.dt('password').type(glitch.password, { log: false });
    });
    cy.then(() => { start = Date.now(); });
    cy.dt('login-button').click();
    cy.get('[data-test="inventory-item"]', { timeout: 20000 }).should('exist').then(() => {
      expect(Date.now() - start, 'milliseconds until the products appear').to.be.greaterThan(3000);
    });
  });

  it('[TC-023][BUG-011] known defect: visual_user sees different prices from the standard catalogue', () => {
    cy.login('visual');
    InventoryPage.open();
    InventoryPage.prices().should((prices) => expect(prices).to.not.deep.equal(PRICES));
  });
});
