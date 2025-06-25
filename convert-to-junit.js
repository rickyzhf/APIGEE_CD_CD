// convert-to-junit.js
const fs = require('fs');
const [,, inputFile, outputFile] = process.argv;
const issues = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

function escape(s) { return (s||'').replace(/[<>&'"]/g, c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'})[c]); }

let failures = 0, tests = issues.length;
const testCases = issues.map(issue => {
  const rule = issue.ruleId || issue.policyName || 'unnamed-rule';
  const msg  = issue.message   || (issue.details && issue.details.join('; ')) || 'violation';
  const failTag = issue.severity === 'error'
    ? `<failure message="${escape(msg)}"/>`
    : '';
  if (issue.severity === 'error') failures++;
  return `
  <testcase classname="${escape(rule)}" name="${escape(issue.filePath||rule)}">
    ${failTag}
  </testcase>`;
}).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="ApigeeLint" tests="${tests}" failures="${failures}">
${testCases}
</testsuite>`;
fs.writeFileSync(outputFile, xml);
console.log(\`✅ Converted ${tests} findings (${failures} failures) to ${outputFile}\`);
