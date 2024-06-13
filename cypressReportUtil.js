const ExcelJS = require('exceljs');

function parseCypressOutput(output) {
  const results = [];
  const specFileRegex = /Running: (.*\.js)/g;
  const resultSummaryRegex = /(\d+) passing\s+\((\d+:\d+)\)\n\s+(\d+) failing\s+\((\d+:\d+)\)\n\s+(\d+) pending\s+\((\d+:\d+)\)\n\s+(\d+) skipped\s+\((\d+:\d+)\)/;

  let match;
  let currentSpecFile = null;

  output.split('\n').forEach(line => {
    const specMatch = specFileRegex.exec(line);
    if (specMatch) {
      currentSpecFile = specMatch[1];
      results.push({
        specFile: currentSpecFile,
        totalTests: 0,
        passing: 0,
        failing: 0,
        pending: 0,
        skipped: 0
      });
      return;
    }


    
    

    if (currentSpecFile) {
      const result = results.find(r => r.specFile === currentSpecFile);
      const summaryMatch = line.match(/(\d+) passing/);
      if (summaryMatch) {
        result.passing = parseInt(summaryMatch[1], 10);
      }
      const failingMatch = line.match(/(\d+) failing/);
      if (failingMatch) {
        result.failing = parseInt(failingMatch[1], 10);
      }
      const pendingMatch = line.match(/(\d+) pending/);
      if (pendingMatch) {
        result.pending = parseInt(pendingMatch[1], 10);
      }
      const skippedMatch = line.match(/(\d+) skipped/);
      if (skippedMatch) {
        result.skipped = parseInt(skippedMatch[1], 10);
      }
      if (summaryMatch || failingMatch || pendingMatch || skippedMatch) {
        result.totalTests = result.passing + result.failing + result.pending + result.skipped;
        currentSpecFile = null;  // reset for the next spec file
      }
    }
  });

  console.log('Parsed Cypress output results:', results);
  return results;
}

async function exportToExcel(results, filePath) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Cypress Results');
  worksheet.columns = [
      { header: 'Spec File', key: 'specFile', width: 30 },
      { header: 'Total Tests', key: 'totalTests', width: 15 },
      { header: 'Passing', key: 'passing', width: 10 },
      { header: 'Failing', key: 'failing', width: 10 },
      { header: 'Pending', key: 'pending', width: 10 },
      { header: 'Skipped', key: 'skipped', width: 10 }
  ];
  results.forEach(result => worksheet.addRow(result));
  await workbook.xlsx.writeFile(filePath);
  console.log(`Results exported to ${filePath}`);
}




module.exports = { parseCypressOutput, exportToExcel };
