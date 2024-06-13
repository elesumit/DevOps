const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const config = require('./config.json');
const { parseCypressOutput, exportToExcel } = require('./cypressReportUtil');
const { generateHtmlReport } = require('./reportUtils');
const ExcelJS = require('exceljs');
const { stdout } = require('process');
//const results = [];
const csvFilePath = path.join(__dirname, 'cypress/fixtures/master.csv');

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

// Function to run a single spec file in the specified browser
const runSpec = (specDetails, browser, callback) => {
    const { spec, childCsvPath, objType, baseURL, URLextension } = specDetails;
    const specFileName = path.basename(spec, '.cy.js');
    const command = `npx cypress run --spec ${spec} --env childCsvPath=${childCsvPath},objType=${objType},baseURL=${baseURL},URLextension=${URLextension} --browser ${browser} --headed`;
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
       // resolve(stdout);

       

       //let results = {};
      


        console.log(`stdout: ${stdout}`);
        callback(stdout, specFileName, childCsvPath);
    });
};

// Function to run all spec files sequentially and collect results
const runAllSpecs = (specs, browser, callback, allResults = []) => {
    if (specs.length === 0) {
        console.log('All specs have been run.');
       
        callback(allResults);
        return;
    }

    const currentSpec = specs.shift();
    runSpec(currentSpec, browser, (output, specFileName, childCsvPath) => {
        allResults.push({ output, specFileName, childCsvPath });
        runAllSpecs(specs, browser, callback, allResults);
    });
};

// Function to generate a consolidated Excel report
const generateConsolidatedExcelReport = async (allResults) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Cypress Results');

    // Add headers
    worksheet.columns = [
        { header: 'Spec File', key: 'specFile', width: 30 },
        { header: 'Page Name', key: 'childCsvPath', width: 30 },
        { header: 'Total Tests', key: 'totalTests', width: 15 },
        { header: 'Passing', key: 'passing', width: 15 },
        { header: 'Failing', key: 'failing', width: 15 },
        { header: 'Pending', key: 'pending', width: 15 },
        { header: 'Skipped', key: 'skipped', width: 15 },
    ];

    // Add rows
    
    for (const result of allResults) {
        console.log('Aggregated Results:', allResults);
        const { specFileName, childCsvPath, output } = result;
        const parsedResults = parseCypressOutput(output);

        console.log('Console Results:', output);

        console.log('Passed Results:', parsedResults);


        console.log(parsedResults[0].specFile); // Output: master.cy.js
        console.log(parsedResults[0].totalTests); // Output: 1
        
       

        //console.log(`Parsed1 fail Results: ${JSON.stringify(results)}`);

        const totalTests = parsedResults.length;

        const passing = parsedResults[0].passing;
        const failing = parsedResults[0].failing;
        const pending = parsedResults[0].pending;
        const skipped = parsedResults[0].skipped;
        
        

        // const passing = parsedResults.filter(test => test.status === 'passed').length;
        // const failing = parsedResults.filter(test => test.status === 'failed').length;
        // const pending = parsedResults.filter(test => test.status === 'pending').length;
        // const skipped = parsedResults.filter(test => test.status === 'skipped').length;



        worksheet.addRow({
            specFile: specFileName,
            childCsvPath: path.basename(childCsvPath),
            totalTests,
            passing,
            failing,
            pending,
            skipped
        });
    }

    const filePath = path.join(__dirname, 'cypress/results/consolidated_cypress_results.xlsx');
    
    await workbook.xlsx.writeFile(filePath);
   //await exportToExcel(result, filePath);
    console.log(`Consolidated Excel report generated at ${filePath}`);

  
};

// Function to generate individual HTML reports
const generateIndividualHtmlReports = async (allResults) => {
    for (const result of allResults) {
        const { specFileName, output } = result;
        const parsedResults = parseCypressOutput(output);

        if (parsedResults.length === 0) {
            console.error(`No results found for ${specFileName}. Ensure your tests are running and outputting correctly.`);
            continue;
        }

        let htmlContent = `
        <html>
        <head>
            <title>Cypress Test Report for ${specFileName}</title>
        </head>
        <body>
            <h1>Cypress Test Report for ${specFileName}</h1>
            <table border="1">
                <thead>
                    <tr>
                        <th>Test Suite</th>
                        <th>Test Case</th>
                        <th>Status</th>
                        <th>Duration (ms)</th>
                    </tr>
                </thead>
                <tbody>
        `;

        parsedResults.forEach(result => {
            htmlContent += `
            <tr>
                <td>${result.suite}</td>
                <td>${result.name}</td>
                <td>${result.status}</td>
                <td>${result.duration}</td>
            </tr>
            `;
        });

        htmlContent += `
                </tbody>
            </table>
        </body>
        </html>
        `;

        const htmlFilePath = path.join(__dirname, `cypress/results/${specFileName}_results.html`);
        await fs.promises.writeFile(htmlFilePath, htmlContent, 'utf8');
        console.log(`HTML report generated at ${htmlFilePath}`);
    }
};

// Start the process
const browser = process.argv[2] || 'chrome'; // Default to Chrome if no browser is specified

getSpecFilesFromCSV(csvFilePath, (specFiles) => {
    if (specFiles.length === 0) {
        console.log('No specs to run.');
        return;
    }
    runAllSpecs(specFiles, browser, async (allResults) => {
        await generateConsolidatedExcelReport(allResults);
        await generateIndividualHtmlReports(allResults);
    });
});
