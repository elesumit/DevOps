const { readCsvrows, readCsv } = require('../../support/util1.js');
const config = require('../../../config.json');
const pageControllers = require('../../pages/pageControllers.js');

const personalInsurancePage = require('../../pages/personalInsurance.js');

const baseURL = Cypress.env('baseURL');
const URLextension = Cypress.env('URLextension');
const childCsvPath = Cypress.env('childCsvPath');
const objType = Cypress.env('objType');

Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });
      // Iterate over each viewport configuration
    Object.entries(config.viewPorts).forEach(([viewportName, viewportSetting]) => {
      // Run Cypress tests with the current viewport settings
      describe(`Validate the personal & busin ess login for various account types - ${viewportName}`, () => {
        beforeEach(() => {
          cy.visit(`${baseURL}/${URLextension}`);
          if (viewportSetting.includes(':')) {
            // Custom viewport size specified
            const [width, height] = viewportSetting.split(',').map(value => parseInt(value.split(':')[1].trim()));
            cy.viewport(width, height);
          } else {
            // Predefined device name
            cy.viewport(viewportSetting);
          }
        });

describe('Scenario 1 - Personal Insurance Quote', () => {
  it('Executes tests for the provided child CSV file', () => {
   
    readCsv(`cypress/fixtures/${childCsvPath}`).then((childRows) => {
        childRows.forEach((childRow) => {
            if (objType.includes('quote')) {
                cy.log(childRow['productType'], childRow['zipCode']);
    
                const zip = pageControllers.getZipCode(childRow['pageName'], childRow['zipElement']);
                
                const quote = pageControllers.getQuote(childRow['getQuoteButtonReference'], childRow['quoteButton']);
                
                const dropdownMenu = childRow['dropdownMenu'];
    
                pageControllers.selectDropdownOption(dropdownMenu, childRow['insuranceType']);
                //pageControllers.selectDropdownOption("selectQuoteForm", childRow['insuranceType']);
    
    
                if (childRow['zipCode'] !== '' && childRow['zipCode'] !== undefined) {
                    pageControllers.enterZip(zip,childRow['zipCode'])
                    
                    pageControllers.clickQuote(quote);
                   
                    pageControllers.validatePageText(childRow['expectedText']);
                    // cy.go('back');
                    cy.visit(currentPageUrl);
                }
                else {
                   
                   pageControllers.clickQuote(quote);
                    pageControllers.validatePageText(childRow['expectedText']);
                    //cy.go('back');
                    cy.visit(currentPageUrl);
                }
    
            } else if (objType.includes('link')) {
                cy.log(childRow['expectedText'], childRow['condition']);
    
                // Get the XPath for the given condition and link
                const xpath = pageControllers.getXPath(childRow['condition'], childRow['linkText']);
    
                // Click the link using the generic click function
                if (xpath) {
                    pageControllers.clickLink(xpath);
                    cy.wait(2000);
                    cy.contains(childRow['expectedText']).should('be.visible');
                    cy.visit(currentPageUrl);
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
});
});


