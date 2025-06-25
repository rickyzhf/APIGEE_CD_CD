const fs = require('fs');

const lintResults = JSON.parse(fs.readFileSync('lint-results.json', 'utf-8'));

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

let testcases = '';
lintResults.forEach(issue => {
  testcases += `<testcase classname="${escapeXml(issue.policyName || 'policy')}" name="${escapeXml(issue.message)}">`;
  if (issue.severity && issue.severity.toLowerCase() === 'error') {
    testcases += `<failure message="${escapeXml(issue.message)}"/>`;
  }
  testcases += `</testcase>\n`;
});

const junitXml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite tests="${lintResults.length}" failures="${lintResults.filter(i => i.severity && i.severity.toLowerCase() === 'error').length}">
${testcases}
</testsuite>`;

fs.writeFileSync('results.xml', junitXml);
console.log('JUnit XML report generated as lintresults.xml');
