import * as vscode from 'vscode';

const performanceCache: Record<string, any> = {};

export function registerShowPerformanceGraphCommand(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('code.simd.ai.showPerformanceGraph', async (idOrArgs) => {
    const args =
      typeof idOrArgs === 'string'
        ? (globalThis as any).simdPerformanceCache?.[idOrArgs]
        : idOrArgs;

    if (!args) {
      vscode.window.showErrorMessage('No performance data available.');
      return;
    }

    const { key, simd, llvm_mca, llvm_mca_neon } = args;

    let perfData =
      llvm_mca_neon ||
      (llvm_mca ? Object.entries(llvm_mca).map(([cpu, v]) => ({ cpu, ...(v as any) })) : []);

    if (!perfData.length) {
      vscode.window.showWarningMessage(`No valid performance entries for ${key || 'intrinsic'}.`);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'simdPerformance',
      `Performance Graph - ${key || 'Intrinsic'}`,
      vscode.ViewColumn.Beside,
      { enableScripts: true }
    );

    const makeTableRows = (data: any[]) =>
      data
        .map(
          (p: any) =>
            `<tr>
              <td>${p.cpu}</td>
              <td>${p.latency}</td>
              <td>${p.throughput}</td>
            </tr>`
        )
        .join('\n');

    panel.webview.html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
            body {
              font-family: sans-serif;
              padding: 1rem;
              background-color: var(--vscode-editor-background, #1e1e1e);
              color: var(--vscode-editor-foreground, #cccccc);
            }
            h2 { margin-bottom: 1rem; }
            canvas { width: 100%; max-height: 420px; margin-bottom: 1.5rem; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 1rem;
              font-size: 0.9rem;
            }
            th, td {
              border: 1px solid rgba(255,255,255,0.1);
              padding: 6px 10px;
              text-align: center;
              cursor: default;
            }
            /* SIMD-style gradient header text */
            th {
              cursor: pointer;
              user-select: none;
              background: linear-gradient(90deg, #FFA500, #FF8C00, #FF4500);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              transition: filter 0.3s ease;
            }
            th:hover { filter: brightness(1.3); }
            tr:nth-child(even) { background-color: rgba(255,255,255,0.04); }
          </style>
        </head>
        <body>
          <h2>${key || ''} ${simd ? `(${simd})` : ''} Performance</h2>
          <canvas id="chart"></canvas>
          <h3>Raw Performance Data (click headers to sort)</h3>
          <table id="perfTable">
            <thead>
              <tr>
                <th data-key="cpu">CPU</th>
                <th data-key="latency">Latency</th>
                <th data-key="throughput">Throughput</th>
              </tr>
            </thead>
            <tbody>
              ${makeTableRows(perfData)}
            </tbody>
          </table>

          <script>
            let perfData = ${JSON.stringify(perfData)};
            const ctx = document.getElementById('chart').getContext('2d');

            // � Red gradient for Latency
            const latencyGradient = ctx.createLinearGradient(0, 0, 0, 400);
            latencyGradient.addColorStop(0, '#FF9999');
            latencyGradient.addColorStop(0.5, '#FF4C4C');
            latencyGradient.addColorStop(1, '#CC0000');

            // � Blue gradient for Throughput
            const throughputGradient = ctx.createLinearGradient(0, 0, 0, 400);
            throughputGradient.addColorStop(0, '#99CCFF');
            throughputGradient.addColorStop(0.5, '#3399FF');
            throughputGradient.addColorStop(1, '#0066CC');

            // --- Chart setup ---
            let chart = new Chart(ctx, {
              type: 'bar',
              data: {
                labels: perfData.map(p => p.cpu),
                datasets: [
                  {
                    label: 'Latency',
                    data: perfData.map(p => p.latency),
                    backgroundColor: latencyGradient,
                    borderRadius: 6
                  },
                  {
                    label: 'Throughput',
                    data: perfData.map(p => p.throughput),
                    backgroundColor: throughputGradient,
                    borderRadius: 6
                  }
                ]
              },
              options: {
                responsive: true,
                plugins: {
                  legend: {
                    labels: {
                      color: getComputedStyle(document.body)
                        .getPropertyValue('--vscode-editor-foreground') || '#ccc'
                    }
                  }
                },
                scales: {
                  x: {
                    ticks: {
                      color: getComputedStyle(document.body)
                        .getPropertyValue('--vscode-editor-foreground') || '#ccc'
                    },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                  },
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Cycles' },
                    ticks: {
                      color: getComputedStyle(document.body)
                        .getPropertyValue('--vscode-editor-foreground') || '#ccc'
                    },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                  }
                }
              }
            });

            // --- Table sorting + chart sync ---
            const table = document.getElementById('perfTable');
            let currentSort = { key: null, asc: true };

            function updateChart() {
              chart.data.labels = perfData.map(p => p.cpu);
              chart.data.datasets[0].data = perfData.map(p => p.latency);
              chart.data.datasets[1].data = perfData.map(p => p.throughput);
              chart.update();
            }

            function updateTable() {
              const tbody = table.querySelector('tbody');
              tbody.innerHTML = perfData.map(p =>
                '<tr><td>' + p.cpu + '</td><td>' + p.latency + '</td><td>' + p.throughput + '</td></tr>'
              ).join('');
            }

            table.querySelectorAll('th').forEach(th => {
              th.addEventListener('click', () => {
                const key = th.dataset.key;
                const asc = currentSort.key === key ? !currentSort.asc : true;
                currentSort = { key, asc };

                perfData.sort((a, b) => {
                  const va = a[key];
                  const vb = b[key];
                  const na = parseFloat(va);
                  const nb = parseFloat(vb);
                  if (!isNaN(na) && !isNaN(nb)) return asc ? na - nb : nb - na;
                  return asc ? va.localeCompare(vb) : vb.localeCompare(va);
                });

                updateTable();
                updateChart();
              });
            });
          </script>
        </body>
      </html>`;
  });

  context.subscriptions.push(disposable);
}
