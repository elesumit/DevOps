class pageControllers {
   
  clickOnText(propertyValue)
  {    
    return cy.xpath(`//*[text()="${propertyValue}"]`).click();  
  }

  clickOnText1(propertyValue)
  {    
    return cy.xpath(`(//*[text()='${propertyValue}'])[1]`).click({ force: true });
  }

  clickOnText2(propertyValue)
  {    
    return cy.xpath(`(//*[text()='${propertyValue}'])[2]`).click({ force: true });

  }

  clickOnText3(propertyValue)
  {    

    return cy.xpath(`(//*[text()='${propertyValue}'])[3]`).click();

  }

  clickContainsText(propertyValue)
  { 
    return cy.xpath(`//*[contains(text(), "${propertyValue}")]`).click();    
  }  

  clickOnTitle(propertyValue)
  {    
    return cy.xpath(`//*[@title="${propertyValue}"]`).click();  
  }

  clickOnId(propertyValue)
  {    

    return cy.xpath(`//*[@id="${propertyValue}"]`) 
    .shadow() 
    .find('button') 
    .click({ force: true }); // Click the button

  }

  clickOnQuoteButton(propertyValue)
  {       
    return cy.xpath(`(//*[@id="${propertyValue}"]/div/div/input)[1]`).click();


  }

  type(property, value) {   
    return cy.xpath(`//*[contains(text(), "${property}")]`).type(value);
  }
    

  type1(property, value) {   
    return cy.xpath(`//*[@name="${property}"]`)
    .shadow()
    .find('input') 
    .type(value); 
  }


  selectShadowElement(property, value) {   
    return cy.xpath(`//*[@id="${property}"]`)
    .shadow()
    .find('select') 
    .select(value);
  }


  clickLink1(linkURL) {     
    cy.window().then(win => {
      cy.on('window:confirm', () => true); // Always confirm opening a new tab
  
      cy.xpath(`(//a[@href="${linkURL}"])[1]`)
      .should('exist')
      .wait(5000) // Adjust timeout as needed
      .should('be.visible')
     // .should('be.enabled')
     //.invoke('attr', 'target', '_self').click({force: true});
      .invoke('removeAttr', 'target') // Remove any target attribute to prevent opening in a new tab
      .click({ force: true }); // Use { force: true } to forcefully click even if covered by other elements
    });
  }

  clickLink2(linkURL) {     
      
    cy.xpath(`(//a[text()="${linkURL}"])[1]`)
  .should('exist')
  .wait(5000) // Adjust timeout as needed
  .should('be.visible')
 //.invoke('attr', 'target', '_self').click({force: true});
  .invoke('removeAttr', 'target').click({force: true});;
  }


  clickLink3(linkURL) {     
      
        cy.xpath(`(//*[text()="${linkURL}"])[1]//parent::a`)
      .should('exist')
      .wait(5000) // Adjust timeout as needed
      .should('be.visible')
     // .invoke('attr', 'target', '_self').click({force: true});
      .invoke('removeAttr', 'target').click({force: true});;
    
      
      }


      clickLink4(linkURL) {     

       // cy.xpath(`(//*[text()="${linkURL}"])[1]//parent::a`)

        cy.xpath(`//a[h5[contains(text(), "${linkURL}")]]`)
        .should('exist')
        .wait(5000) // Adjust timeout as needed
        .should('be.visible')
       // .invoke('attr', 'target', '_self').click({force: true});
        .invoke('removeAttr', 'target').click({force: true});;
    
      }

  clickLink5(linkURL) {     
    cy.window().then(win => {
      cy.on('window:confirm', () => true); // Always confirm opening a new tab
  
      cy.xpath(`(//a[@href="${linkURL}"])[5]`)
      .should('exist')
      .wait(5000) 
      .should('be.visible')
     
      .invoke('removeAttr', 'target') // Remove any target attribute to prevent opening in a new tab
      .click({ force: true }); // Use { force: true } to forcefully click even if covered by other elements
    });
  }
  
  clickShadowElement() {             

    return cy.xpath("//*[@id='header']/div[3]/bolt-button") 
    .shadow() 
    .find('a') 
    .invoke('attr', 'target', '_self').click({force: true});

  }
        validatePageText(expectedText)
      {
        cy.contains(expectedText).should('be.visible');
      }
      
    //   selectDropdownOption(menu, option) {     
    //     return cy.get(`[id="${menu}"]`).select(option);
    // }
    
    selectDropdownOption(menu, option) {
      cy.log(`Selecting option "${option}" from dropdown with id "${menu}"`);
      return cy.get(`[id="${menu}"]`).select(option);
  }
  

    //**** New 5/21 */
    // Generic click function
clickLink(xpath) {
  cy.xpath(xpath)
      .scrollIntoView()
      .should('exist')
      .wait(5000) // Adjust timeout as needed
      .should('be.visible')
      .invoke('removeAttr', 'target')
      .click({ force: true });
};

// Mapping conditions to XPath expressions
getXPath(condition, linkText) {
  const xpathMap = {
      'ParentLink': `(//*[text()="${linkText}"])[1]//parent::a`,
      'ParentLink2': `(//*[text()="${linkText}"])//parent::a`,
      'GParentLink': `(//*[text()="${linkText}"])[1]//parent::div/parent::a`,
      'DirectLink': `(//a[text()="${linkText}"])[1]`,
      'ContainsTextLink': `//a[h5[contains(text(), "${linkText}")]]`,
      'TextLink': `//a[h5[text()="${linkText}"]]`,
      'NormalizeTextLink' : `//a[.//h2[text()="${linkText}"]]`,
      'DirectLink2': `(//a[text()="${linkText}"])[2]`,
      'DirectLink3': `(//a[text()="${linkText}"])[3]`,
      'DirectLink4': `(//a[text()="${linkText}"])[4]`,
      'DirectLink5': `(//a[text()="${linkText}"])[5]`,
      'DirectLink19': `(//a[text()="${linkText}"])[19]`,
      'Button': `(//*[text()="${linkText}"])`,
      'h5ContainsTextLink': `//a[.//h5[contains(text(), "${linkText}")]]`,
      
  };
  return xpathMap[condition];
}

//******enter Zipcode */
enterZip(property,value) {
  cy.xpath(property).type(value), { force: true };
};

getZipCode(pageName,property) {
  const zipCode = {
      'personalInsurance': `//input[@aria-describedby="${property}"]`,
      'landingPage' : `//input[@type="${property}"]`,
    'personalAuto' : `(//*[@id="${property}"]//following::input)[1]`,

  };
  return zipCode[pageName];
}

//******click on Quote */
clickQuote(property) {
  cy.xpath(property).click();
};

getQuote(pageName,property) {
  const quote = {
      'personalInsurance1': `//div[@id="${property}"]/div/div/button`,
      'personalInsurance2': `//div[@id="${property}"]/div/div/a`,
      'landingPage': `//*[@name='Start your quote']`,
      'personalAuto' : `(//*[@id="${property}"]//following::input)[2]`,

  };
  return quote[pageName];
}



    }

    module.exports = new pageControllers();