const { exec } = require('child_process');

// Define the paths to your spec files
const specFiles = [
    'cypress/e2e/prod-regression-specs/semPage.cy.js',
    'cypress/e2e/prod-regression-specs/nvit.cy.js',
    'cypress/e2e/specs/vehicleProducts_healthCheck.cy.js'    
];

// Function to run a single spec file
const runSpec = (spec, callback) => {
    const command = `npx cypress run --spec ${spec} --browser chrome --headed`;
    console.log(`Running command: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error.message}`);
            console.error(`Error code: ${error.code}`);
            console.error(`Error signal: ${error.signal}`);
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        console.log(`stdout: ${stdout}`);
        callback();
    });
};

// Function to run all spec files sequentially
const runAllSpecs = (specs) => {
    if (specs.length === 0) {
        console.log('All specs have been run.');
        return;
    }

    const currentSpec = specs.shift();
    runSpec(currentSpec, () => {
        runAllSpecs(specs);
    });
};

// Start running all spec files
runAllSpecs([...specFiles]);
