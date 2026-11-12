import 'cypress-mochawesome-reporter/register';
import 'cypress-axe';
import './commands';

// The site's own third-party scripts sometimes throw errors that have nothing to do with the behaviour under test.
Cypress.on('uncaught:exception', (err) => !/Script error|ResizeObserver/.test(err.message));
