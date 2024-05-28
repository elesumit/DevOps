const { readCsvrows, readCsv } = require('../../support/util1.js');
const config = require('../../../config.json');
const pageControllers = require('../../pages/pageControllers.js');

const personalInsurancePage = require('../../pages/personalInsurance.js');

Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
});
// Iterate over each viewport configuration
Object.entries(config.viewPorts).forEach(([viewportName, viewportSetting]) => {
    // Run Cypress tests with the current viewport settings
    describe(`Validate the personal & business login for various account types - ${viewportName}`, () => {
        beforeEach(() => {


            cy.visit(config.environments.baseURL + "/" + config.environments.learningCenter);
            if (viewportSetting.includes(':')) {
                // Custom viewport size specified
                const [width, height] = viewportSetting.split(',').map(value => parseInt(value.split(':')[1].trim()));
                cy.viewport(width, height);
            } else {
                // Predefined device name
                cy.viewport(viewportSetting);
            }


        });


        it('Validate forgot business account type', () => {
            let currentPageUrl;
            
            // Store the current URL
            cy.url().then(url => {
                currentPageUrl = url;
            });
        
            readCsvrows().then((csvData) => {
                csvData.forEach(row => {
                    const { Scenario, specname, execution, objType, childCsvPath } = row;
                    //cy.log(`Execution: ${execution}, Link: ${csvtype}, url: ${childCsvPath}, expectetext: ${execution}`);
                    if (execution === 'yes') {
                        readCsv(`cypress/fixtures/${childCsvPath}`).then((childRows) => {
                            childRows.forEach((childRow) => {
                                if (objType.includes('quote')) {
                                    cy.log(childRow['productType'], childRow['zipCode']);

                                    pageControllers.selectDropdownOption("selectQuoteForm",childRow['insuranceType']);
                                    personalInsurancePage.zipCode(childRow['productType'], childRow['zipCode']);
                                    personalInsurancePage.clickOnQuote(childRow['prop_startquote']);
                                    pageControllers.validatePageText(childRow['expectedText']);
                                    cy.go('back');


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
                                        cy.log(`No matching XPath for condition: ${condition}`);
                                    }

                                }

                            });
                        });
                    }

                });
            });
        });





    });

});

