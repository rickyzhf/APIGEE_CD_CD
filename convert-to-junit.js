// convert-to-junit.js
const fs = require('fs');
const [,, inputFile, outputFile] = process.argv;
if (!inputFile || !outputFile) {
  console.error('Usage: node convert-to-junit.js input.json output.xml');
  process.exit(1);
}
const report = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&amp;','"':'&quot;',"'":'&apos;'}[c]));
}
let failures = 0;
const testCases = report.map(issue => {
  const rule = issue.ruleId || issue.policyName || 'unnamed-rule';
  const msg  = issue.message   || 'violation';
  if (issue.severity === 'error') failures++;
  return `<testcase classname="${escapeXml(rule)}" name="${escapeXml(issue.filePath||rule)}">
    ${issue.severity==='error'
      ? `<failure message="${escapeXml(msg)}"/>`
      : ''}
  </testcase>`;
}).join('\n');
const tests = report.length;
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="ApigeeLint" tests="${tests}" failures="${failures}">
${testCases}
</testsuite>`;
fs.writeFileSync(outputFile, xml);
console.log(`Converted ${tests} findings (${failures} failures) to ${outputFile}`);
