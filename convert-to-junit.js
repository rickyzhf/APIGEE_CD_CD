// convert-json-to-junit.js
const fs = require('fs');
const path = require('path');

const [,, inputFile, outputFile] = process.argv;

if (!inputFile || !outputFile) {
  console.error('Usage: node convert-json-to-junit.js input.json output.xml');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
  }[c]));
}

let testCases = '';

report.forEach(item => {
  const ruleId = item.ruleId || 'unknown-rule';
  const message = item.message || 'No message';
  const filePath = item.filePath || 'Unknown file';

  testCases += `
    <testcase classname="${escapeXml(filePath)}" name="${escapeXml(ruleId)}">
      <failure message="${escapeXml(message)}"/>
    </testcase>`;
});

const junitXml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="ApigeeLint Report" tests="${report.length}" failures="${report.length}">
    ${testCases}
  </testsuite>
</testsuites>`;

fs.writeFileSync(outputFile, junitXml);
console.log(`✅ Converted ${report.length} lint issues to JUnit XML at ${outputFile}`);
