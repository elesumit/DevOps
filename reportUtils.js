const fs = require('fs');
const path = require('path');

async function generateHtmlReport(results, filePath) {
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cypress Test Results</title>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
          .chart-container {
              width: 50%;
              margin: auto;
          }
      </style>
  </head>
  <body>
      <h1>Cypress Test Results</h1>
      <table border="1">
          <tr>
              <th>Spec File</th>
              <th>Total Tests</th>
              <th>Passing</th>
              <th>Failing</th>
              <th>Pending</th>
              <th>Skipped</th>
          </tr>
          ${results.map(result => `
          <tr>
              <td>${result.specFile}</td>
              <td>${result.totalTests}</td>
              <td>${result.passing}</td>
              <td>${result.failing}</td>
              <td>${result.pending}</td>
              <td>${result.skipped}</td>
          </tr>
          `).join('')}
      </table>
      <div class="chart-container">
          <canvas id="testResultsChart"></canvas>
      </div>
      <script>
          const ctx = document.getElementById('testResultsChart').getContext('2d');
          const testResultsChart = new Chart(ctx, {
              type: 'pie',
              data: {
                  labels: ['Passing', 'Failing', 'Pending', 'Skipped'],
                  datasets: [{
                      data: [${results.reduce((acc, result) => acc + result.passing, 0)}, 
                             ${results.reduce((acc, result) => acc + result.failing, 0)}, 
                             ${results.reduce((acc, result) => acc + result.pending, 0)}, 
                             ${results.reduce((acc, result) => acc + result.skipped, 0)}],
                      backgroundColor: ['#4caf50', '#f44336', '#ff9800', '#9e9e9e']
                  }]
              },
              options: {
                  responsive: true,
                  plugins: {
                      legend: {
                          position: 'top',
                      },
                      tooltip: {
                          callbacks: {
                              label: function(tooltipItem) {
                                  return tooltipItem.label + ': ' + tooltipItem.raw;
                              }
                          }
                      }
                  }
              }
          });
      </script>
  </body>
  </html>
  `;

  fs.writeFileSync(filePath, htmlContent, 'utf8');
  console.log(`HTML report generated at ${filePath}`);
}

module.exports = { generateHtmlReport };
