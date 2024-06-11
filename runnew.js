const { exec } = require('child_process');
const fs = require('fs');
const csv = require('csv-parser');
const config = require('../../../config.json');
const csvFilePath = 'cypress/fixtures/master.csv';

// Function to read CSV file and get specs with execution status "yes"
const getSpecFilesFromCSV = (filePath, callback) => {
    const specs = [];
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            if (row.execution.toLowerCase() === 'yes') {
                const { baseURL, URLextension, specname, objType, childCsvPath } = row;

                specs.push({
                    spec: `cypress/e2e/POC/${specname}.cy.js`,
                    childCsvPath: childCsvPath,
                    objType: objType,
                    URLextension: URLextension,
                    baseURL: baseURL
                });
            }
        })
        .on('end', () => {
            callback(specs);
        });
};

// Function to run a single spec file in headed mode on Chrome
const runSpec = (specDetails, callback) => {
    const { spec, childCsvPath, objType, baseURL, URLextension } = specDetails;
    const command = `npx cypress run --spec ${spec} --env childCsvPath=${childCsvPath},objType=${objType},baseURL=${baseURL},URLextension=${URLextension} --browser chrome --headed`;
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

// Start the process
getSpecFilesFromCSV(csvFilePath, (specFiles) => {
    if (specFiles.length === 0) {
        console.log('No specs to run.');
        return;
    }
    runAllSpecs(specFiles);
});
