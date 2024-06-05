const { readCsv } = require('../../support/util1.js');
const pageControllers = require('../../pages/pageControllers.js');

describe('Scenario 1 - Personal Insurance Quote', () => {
  it('Executes tests for the provided child CSV file', () => {
    const childCsvPath = Cypress.env('childCsvPath');
    const objType = Cypress.env('objType');

    cy.log(`Reading CSV: cypress/fixtures/${childCsvPath}`);
    
    readCsv(`cypress/fixtures/${childCsvPath}`).then((childRows) => {
      childRows.forEach((childRow) => {
        if (objType.includes('quote')) {
          cy.log(childRow['productType'], childRow['zipCode']);

          const zip = pageControllers.getZipCode(childRow['pageName'], childRow['zipElement']);
          const quote = pageControllers.getQuote(childRow['getQuoteButtonReference'], childRow['quoteButton']);
          const dropdownMenu = childRow['dropdownMenu'];

          pageControllers.selectDropdownOption(dropdownMenu, childRow['insuranceType']);
          
          if (childRow['zipCode']) {
            pageControllers.enterZip(zip, childRow['zipCode']);
          }
          pageControllers.clickQuote(quote);
          pageControllers.validatePageText(childRow['expectedText']);
        } else if (objType.includes('link')) {
          cy.log(childRow['expectedText'], childRow['condition']);

          const xpath = pageControllers.getXPath(childRow['condition'], childRow['linkText']);
          if (xpath) {
            pageControllers.clickLink(xpath);
            cy.wait(2000);
            cy.contains(childRow['expectedText']).should('be.visible');
          } else {
            cy.log(`No matching XPath for condition: ${childRow['condition']}`);
          }
        }
      });
    }).catch((error) => {
      cy.log(`Error reading child CSV: ${error}`);
    });
  });
});
