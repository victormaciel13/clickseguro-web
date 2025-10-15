// tools/generate-zap-summary.js
const fs = require('fs');
const path = require('path');

const inFile = path.resolve(process.cwd(), 'zap-report.json');
const outFile = path.resolve(process.cwd(), 'zap-summary.html');

if (!fs.existsSync(inFile)) {
  console.error('ERRO: zap-report.json não encontrado em', inFile);
  process.exit(2);
}

const data = JSON.parse(fs.readFileSync(inFile, 'utf8'));
const alerts = [];

// Coleta todos os alerts
if (Array.isArray(data.site)) {
  data.site.forEach(site => {
    if (Array.isArray(site.alerts)) {
      site.alerts.forEach(a => {
        alerts.push({
          site: site.name || '',
          name: a.name || '',
          risk: a.risk || '',
          riskcode: a.riskcode || '',
          url: (a.instances && a.instances[0] && a.instances[0].uri) || '',
          param: (a.instances && a.instances[0] && a.instances[0].param) || '',
          evidence: (a.instances && a.instances[0] && a.instances[0].evidence) || '',
          description: a.description || ''
        });
      });
    }
  });
}

// Gera html
const html = `
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <title>ZAP Summary</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;margin:20px}
    table{border-collapse:collapse;width:100%}
    th,td{border:1px solid #ddd;padding:8px;text-align:left}
    th{background:#222;color:#fff}
    tr:nth-child(even){background:#f7f7f7}
    .risk-3{color:#b30000;font-weight:700}
    .risk-2{color:#e67e22}
    .risk-1{color:#2d9cdb}
    .risk-0{color:#666}
  </style>
</head>
<body>
  <h1>Relatório resumo ZAP</h1>
  <p>Total de alertas: <strong>${alerts.length}</strong></p>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Site</th>
        <th>Vulnerabilidade</th>
        <th>Severidade (riskcode)</th>
        <th>URL / Parâmetro</th>
        <th>Evidência</th>
      </tr>
    </thead>
    <tbody>
      ${alerts.map((a,i) => `
        <tr>
          <td>${i+1}</td>
          <td>${escapeHtml(a.site)}</td>
          <td>${escapeHtml(a.name)}</td>
          <td class="risk-${escapeHtml(a.riskcode)}">${escapeHtml(a.risk)} (${escapeHtml(a.riskcode)})</td>
          <td>${escapeHtml(a.url)} ${a.param ? '<br/><small>param: '+escapeHtml(a.param)+'</small>':''}</td>
          <td><pre style="white-space:pre-wrap;margin:0">${escapeHtml(a.evidence)}</pre></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Observação</h2>
  <p>Abra o <code>zap-report.html</code> para ver request/response completos e descrição detalhada.</p>
</body>
</html>
`;

fs.writeFileSync(outFile, html, 'utf8');
console.log('Gerado:', outFile);

// pequena função de escape
function escapeHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}
