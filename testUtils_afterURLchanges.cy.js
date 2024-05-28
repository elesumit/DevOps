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
        it('Validate scenarios based on master CSV', () => {
            let currentPageUrl;

            // Read the master CSV file
            readCsvrows('cypress/fixtures/master.csv').then((csvData) => {
                csvData.forEach(row => {
                    const { Scenario, baseURL, URLextension, specname, execution, objType, childCsvPath } = row;

                    if (execution === 'yes') {
                        // Get the base URL and URL extension from the config file using the keys from the master CSV
                        const environmentURL = config.environments[baseURL];
                        const extensionURL = config.environments[URLextension];
                        
                        // Log the environmentURL, extensionURL to debug
                        cy.log(`Environment URL: ${environmentURL}`);
                        cy.log(`Extension URL: ${extensionURL}`);
                        
                        // Ensure URL extension is defined before proceeding
                        if (!extensionURL) {
                            throw new Error(`URL extension not found for key: ${URLextension}`);
                        }

                        const fullURL = `${environmentURL}/${extensionURL}`;
                        cy.log(`Visiting URL: ${fullURL}`);

                        // Visit the dynamically constructed URL
                        cy.visit(fullURL);

                        // Set viewport if specified
                        if (viewportSetting.includes(':')) {
                            // Custom viewport size specified
                            const [width, height] = viewportSetting.split(',').map(value => parseInt(value.split(':')[1].trim()));
                            cy.viewport(width, height);
                        } else {
                            // Predefined device name
                            cy.viewport(viewportSetting);
                        }

                        cy.url().then(url => {
                            currentPageUrl = url;
                        });

                        readCsv(`cypress/fixtures/${childCsvPath}`).then((childRows) => {
                            childRows.forEach((childRow) => {
                                if (objType.includes('quote')) {
                                    cy.log(childRow['productType'], childRow['zipCode']);

                                    pageControllers.selectDropdownOption("selectQuoteForm", childRow['insuranceType']);
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
                                        cy.log(`No matching XPath for condition: ${childRow['condition']}`);
                                    }
                                }
                            });
                        }).catch((error) => {
                            console.error(`Error reading child CSV: ${error}`);
                        });
                    }
                });
            }).catch((error) => {
                console.error(`Error reading master CSV: ${error}`);
            });
        });
    });
});
