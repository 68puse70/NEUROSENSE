// compile_report.cjs
const fs = require('fs');
const path = require('path');

const sectionsDir = path.join(__dirname, 'report_sections');
const imgPath = path.join(__dirname, 'neurosense_dashboard_screenshot.jpg');

let imgBase64 = '';
if (fs.existsSync(imgPath)) {
  imgBase64 = 'data:image/jpeg;base64,' + fs.readFileSync(imgPath).toString('base64');
}

console.log('Reading report sections...');
const frontMatter = fs.readFileSync(path.join(sectionsDir, 'front_matter.md'), 'utf8');
const ch1 = fs.readFileSync(path.join(sectionsDir, 'ch1.md'), 'utf8');
const ch2 = fs.readFileSync(path.join(sectionsDir, 'ch2.md'), 'utf8');
const ch3 = fs.readFileSync(path.join(sectionsDir, 'ch3.md'), 'utf8');
const ch4 = fs.readFileSync(path.join(sectionsDir, 'ch4.md'), 'utf8');
const ch5 = fs.readFileSync(path.join(sectionsDir, 'ch5.md'), 'utf8');
const ch6 = fs.readFileSync(path.join(sectionsDir, 'ch6.md'), 'utf8');
const refApp = fs.readFileSync(path.join(sectionsDir, 'references_and_appendices.md'), 'utf8');

// Combine full Markdown
const fullMd = [
  frontMatter,
  '\n---\n',
  ch1,
  '\n---\n',
  ch2,
  '\n---\n',
  ch3,
  '\n---\n',
  ch4,
  '\n---\n',
  ch5,
  '\n---\n',
  ch6,
  '\n---\n',
  refApp
].join('\n\n');

const mdOutPath = path.join(__dirname, 'NEUROSENSE_PROJECT_REPORT.md');
fs.writeFileSync(mdOutPath, fullMd, 'utf8');
console.log('Successfully written master Markdown report:', mdOutPath);

// Now generate HTML version with exact College Format
console.log('Compiling HTML document with Somaiya Vidyavihar University / KJSSE styles...');

function mdToHtml(mdText) {
  // Simple, clean converter tailored for this report
  let html = mdText;

  // Protect code blocks
  const codeBlocks = [];
  html = html.replace(/```([\s\S]*?)```/g, (match, p1) => {
    codeBlocks.push(p1);
    return `___CODE_BLOCK_${codeBlocks.length - 1}___`;
  });

  // Blockquotes -> Boxed template
  html = html.replace(/^> \*\*([^\n]+)\*\*/gm, (match, p1) => {
    return `<div class="box-desc"><p><em>${p1}</em></p></div>`;
  });

  // Headers
  html = html.replace(/^# (.*$)/gim, '<h1 class="chapter-title">$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="subtopic">$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3 class="sub-subtopic">$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4 class="sub-sub-subtopic">$1</h4>');

  // Math expressions (display and inline)
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, '<div class="equation">$$$1$$</div>');
  html = html.replace(/\$([^\$\n]+)\$/g, '<span class="inline-math">\\($1\\)</span>');

  // Bold & Italic
  html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');

  // Tables
  html = html.replace(/^\|(.+)\|$/gm, (match) => {
    return match; // will handle table parsing below
  });

  // Restore code blocks
  html = html.replace(/___CODE_BLOCK_(\d+)___/g, (match, index) => {
    const raw = codeBlocks[index];
    if (raw.trim().startsWith('+') || raw.trim().startsWith('Flat State') || raw.trim().startsWith('V_CC') || raw.trim().startsWith('[')) {
      return `<pre class="ascii-diagram">${escapeHtml(raw)}</pre>`;
    }
    return `<pre class="code-listing"><code>${escapeHtml(raw)}</code></pre>`;
  });

  // Paragraphs
  const lines = html.split('\n');
  let inTable = false;
  let tableRows = [];
  let resultLines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (line.startsWith('|') && line.endsWith('|')) {
      inTable = true;
      tableRows.push(line);
      continue;
    } else if (inTable) {
      inTable = false;
      resultLines.push(convertTable(tableRows));
      tableRows = [];
    }

    if (line.startsWith('<h1') || line.startsWith('<h2') || line.startsWith('<h3') || 
        line.startsWith('<h4') || line.startsWith('<div') || line.startsWith('</div') ||
        line.startsWith('<pre') || line.startsWith('</pre') || line.startsWith('---') ||
        line === '') {
      if (line === '---') {
        resultLines.push('<div class="page-break"></div>');
      } else {
        resultLines.push(line);
      }
    } else if (line.startsWith('- ') || line.match(/^\d+\.\s/)) {
      resultLines.push(`<p class="list-item">${line}</p>`);
    } else {
      resultLines.push(`<p class="body-text">${line}</p>`);
    }
  }

  if (inTable && tableRows.length > 0) {
    resultLines.push(convertTable(tableRows));
  }

  return resultLines.join('\n');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function convertTable(rows) {
  if (rows.length < 2) return '';
  let html = '<table class="report-table">\n<thead>\n<tr>\n';
  const headers = rows[0].split('|').map(c => c.trim()).filter(c => c !== '');
  headers.forEach(h => {
    html += `  <th>${h}</th>\n`;
  });
  html += '</tr>\n</thead>\n<tbody>\n';

  for (let r = 2; r < rows.length; r++) {
    const cols = rows[r].split('|').map(c => c.trim()).filter(c => c !== '');
    if (cols.length === 0) continue;
    html += '<tr>\n';
    cols.forEach(c => {
      html += `  <td>${c}</td>\n`;
    });
    html += '</tr>\n';
  }
  html += '</tbody>\n</table>\n';
  return html;
}

const htmlBody = mdToHtml(fullMd);

const finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>NEUROSENSE - Mini Project Report</title>
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<style>
  @page {
    size: A4;
    margin-top: 1.5in;
    margin-bottom: 1.0in;
    margin-left: 1.5in;
    margin-right: 1.0in;
    @bottom-center {
      content: counter(page);
      font-family: "Times New Roman", Times, serif;
      font-size: 11pt;
    }
  }

  @page:first {
    margin-top: 1.5in;
    margin-bottom: 1.0in;
    margin-left: 1.5in;
    margin-right: 1.0in;
    @bottom-center {
      content: "";
    }
  }

  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 12pt;
    line-height: 1.5;
    color: #111;
    margin: 0;
    padding: 20px 40px;
    background-color: #fff;
  }

  .page-break {
    page-break-before: always;
    break-before: page;
    margin-top: 30pt;
    border-top: 1px dashed #ccc;
    padding-top: 20pt;
  }

  .header-banner {
    border-bottom: 2px solid #8b0000;
    padding-bottom: 4px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    font-size: 9pt;
    font-style: italic;
    color: #444;
  }

  .footer-banner {
    border-top: 1px solid #8b0000;
    padding-top: 4px;
    margin-top: 30px;
    display: flex;
    justify-content: space-between;
    font-size: 9pt;
    color: #444;
  }

  h1.chapter-title {
    font-size: 16pt;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    margin-top: 24pt;
    margin-bottom: 16pt;
    color: #000;
  }

  h2.subtopic {
    font-size: 14pt;
    font-weight: bold;
    text-align: left;
    margin-top: 18pt;
    margin-bottom: 8pt;
    color: #111;
  }

  h3.sub-subtopic {
    font-size: 12.5pt;
    font-weight: bold;
    text-align: left;
    margin-top: 14pt;
    margin-bottom: 6pt;
  }

  h4.sub-sub-subtopic {
    font-size: 12pt;
    font-weight: bold;
    font-style: italic;
    margin-top: 10pt;
    margin-bottom: 4pt;
  }

  p.body-text {
    text-align: justify;
    text-justify: inter-word;
    margin-top: 0;
    margin-bottom: 10pt;
    text-indent: 0pt;
  }

  p.list-item {
    text-align: justify;
    margin-top: 2pt;
    margin-bottom: 4pt;
    padding-left: 20pt;
  }

  .box-desc {
    border: 1.5px solid #222;
    padding: 12pt 16pt;
    margin-top: 12pt;
    margin-bottom: 18pt;
    background-color: #fafafa;
    line-height: 1.4;
  }

  .box-desc p {
    margin: 0;
    font-size: 11pt;
    text-align: justify;
  }

  .report-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 14pt;
    margin-bottom: 16pt;
    font-size: 10.5pt;
  }

  .report-table th, .report-table td {
    border: 1px solid #444;
    padding: 6pt 8pt;
    text-align: left;
    vertical-align: top;
  }

  .report-table th {
    background-color: #f0f0f0;
    font-weight: bold;
  }

  .ascii-diagram, .code-listing {
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-left: 3px solid #0056b3;
    padding: 10pt;
    font-family: "Courier New", Courier, monospace;
    font-size: 9.5pt;
    line-height: 1.25;
    overflow-x: auto;
    margin: 12pt 0;
  }

  .equation {
    text-align: center;
    margin: 12pt 0;
    font-size: 11.5pt;
  }

  .img-container {
    text-align: center;
    margin: 18pt 0;
  }

  .img-container img {
    max-width: 95%;
    height: auto;
    border: 1px solid #ccc;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  }

  .img-caption {
    font-size: 10.5pt;
    font-style: italic;
    margin-top: 6pt;
  }
</style>
</head>
<body>

<div class="header-banner">
  <span>Somaiya Vidyavihar University &bull; K. J. Somaiya School of Engineering</span>
  <span>Department of Electronics and Telecommunication Engineering</span>
</div>

${htmlBody}

${imgBase64 ? `
<div class="page-break"></div>
<h2 class="subtopic">Figure 4.1: Operational Interface of the NeuroSense Master Dashboard</h2>
<div class="img-container">
  <img src="${imgBase64}" alt="NeuroSense Master Dashboard Interface Screenshot" />
  <div class="img-caption">Figure 4.1: NeuroSense Master Dashboard (Precision Lab v1.0) featuring 2D Anatomical Sensor Heatmap, Real-Time Multi-Channel Waveforms, Sensor Health Array, and Diagnostic Telemetry Console.</div>
</div>
` : ''}

<div class="footer-banner">
  <span>Department of Electronics and Telecommunication Engineering Semester V, 2024-28 Batch</span>
  <span>NEUROSENSE Academic Report</span>
</div>

</body>
</html>`;

const htmlOutPath = path.join(__dirname, 'NEUROSENSE_PROJECT_REPORT.html');
fs.writeFileSync(htmlOutPath, finalHtml, 'utf8');
console.log('Successfully written master HTML report:', htmlOutPath);
