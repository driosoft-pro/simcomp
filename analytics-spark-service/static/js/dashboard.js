/* ─── State ─────────────────────────────────────────────────── */
let currentDataset = null;
let categoryChart = null;
let missingChart  = null;
let numericTopChart = null;

// SIMCOMP chart instances
const SC = {};

/* ─── Palette ───────────────────────────────────────────────── */
const PALETTE = [
  '#6366f1','#f59e0b','#22c55e','#ef4444','#3b82f6',
  '#a855f7','#14b8a6','#f97316','#ec4899','#84cc16',
  '#06b6d4','#e11d48'
];

/* ─── Helpers ───────────────────────────────────────────────── */
function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 4000);
}

function toggleLoader(show, text = 'Procesando con Apache Spark...') {
    document.getElementById('loaderText').innerText = text;
    document.getElementById('loader').classList.toggle('active', show);
}

function showSection(id, btn) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active-section'));
    document.getElementById(id)?.classList.add('active-section');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    (btn || document.getElementById(`btn-${id}`))?.classList.add('active');
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    document.getElementById('themeIcon').className =
        document.body.classList.contains('dark') ? 'bi bi-sun' : 'bi bi-moon-stars';
    updateChartThemes();
}

async function api(url, opts = {}) {
    try {
        const r = await fetch(url, opts);
        if (!r.ok) {
            const txt = await r.text();
            let msg = `Error ${r.status}`;
            try { msg = JSON.parse(txt).error || msg; } catch {}
            throw new Error(msg);
        }
        if (!(r.headers.get('content-type') || '').includes('application/json'))
            throw new Error('La API no devolvió JSON');
        return r.json();
    } catch(e) { showToast(e.message); throw e; }
}

function chartDefaults() {
    const dark = document.body.classList.contains('dark');
    return {
        color: dark ? '#94a3b8' : '#64748b',
        gridColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    };
}

/* ─── Dataset management ────────────────────────────────────── */
async function loadDatasets() {
    const datasets = await api('/api/datasets');
    const sel = document.getElementById('datasetSelect');
    sel.innerHTML = '';
    datasets.forEach(d => sel.innerHTML += `<option value="${d}">${d}</option>`);
    if (datasets.length) { currentDataset = datasets[0]; sel.value = currentDataset; }
}

async function uploadDataset() {
    const input = document.getElementById('fileInput');
    if (!input.files.length) { showToast('Selecciona un archivo CSV'); return; }
    toggleLoader(true, 'Subiendo dataset...');
    const fd = new FormData();
    fd.append('file', input.files[0]);
    try {
        const r = await api('/api/datasets/upload', { method: 'POST', body: fd });
        showToast(r.message || 'Dataset cargado');
        
        // Reset file input UI
        input.value = '';
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('uploadArea').style.display = 'block';
        
        await loadDatasets();
        if (r.dataset) { document.getElementById('datasetSelect').value = r.dataset; await loadAllDashboards(); }
    } finally { toggleLoader(false); }
}

/* ─── Master loader ─────────────────────────────────────────── */
async function loadAllDashboards() {
    currentDataset = document.getElementById('datasetSelect').value;
    if (!currentDataset) { showToast('No hay dataset seleccionado'); return; }
    document.getElementById('currentDatasetTitle').innerText = `Análisis: ${currentDataset}`;
    toggleLoader(true, 'Spark está procesando el dataset SIMCOMP...');
    try {
        await Promise.all([
            loadSimcompDashboard(),
            loadSummary(),
            loadMissingValues(),
            loadNumericStats(),
            loadCategoricalColumns(),
            loadRecommendations(),
            loadCorrelationHeatmap(),
            loadNumericTopChart(),
            loadTable()
        ]);
        showToast('¡Análisis SIMCOMP finalizado!');
        showSection('simcomp');
    } catch(e) { console.error(e); }
    finally { toggleLoader(false); }
}

/* Alias para el botón antiguo */
async function loadDashboard() { await loadAllDashboards(); }

/* ─── SIMCOMP Dashboard ─────────────────────────────────────── */
async function loadSimcompDashboard() {
    await Promise.all([
        loadSimcompKpis(),
        loadChartCiudad(),
        loadChartEstado(),
        loadChartSancion(),
        loadChartMulta(),
        loadChartTendencia(),
        loadChartMarca(),
        loadChartServicio(),
        loadChartLicencia(),
        loadChartAnio(),
    ]);
}

async function loadSimcompKpis() {
    const d = await api(`/api/datasets/${currentDataset}/simcomp/kpis`);
    const total = d.total || 1;
    document.getElementById('kpi-total').innerText      = total.toLocaleString();
    document.getElementById('kpi-pendientes').innerText = d.pendientes.toLocaleString();
    document.getElementById('kpi-pagados').innerText    = d.pagados.toLocaleString();
    document.getElementById('kpi-anulados').innerText   = d.anulados.toLocaleString();

    const pPend = ((d.pendientes / total) * 100).toFixed(1);
    const pPag  = ((d.pagados    / total) * 100).toFixed(1);
    const pAnul = ((d.anulados   / total) * 100).toFixed(1);

    document.getElementById('kpi-pct-pendientes').innerText = `${pPend}%`;
    document.getElementById('kpi-pct-pagados').innerText    = `${pPag}%`;
    document.getElementById('kpi-pct-anulados').innerText   = `${pAnul}%`;

    // Alert crítica si pendientes > 60%
    if (parseFloat(pPend) > 60) {
        const alert = document.getElementById('simcomp-alert');
        document.getElementById('simcomp-alert-msg').innerText =
            ` El ${pPend}% de comparendos están PENDIENTES. Se recomienda revisar los procesos de cobro.`;
        alert.style.display = 'flex';
    }
}

function scChart(id, type, labels, values, opts = {}) {
    const ctx = document.getElementById(id);
    if (!ctx) return;
    if (SC[id]) SC[id].destroy();
    const { color, gridColor } = chartDefaults();
    const colors = opts.colors || PALETTE;

    SC[id] = new Chart(ctx, {
        type,
        data: {
            labels,
            datasets: [{
                label: opts.label || '',
                data: values,
                backgroundColor: type === 'line'
                    ? 'rgba(99,102,241,0.12)'
                    : labels.map((_, i) => colors[i % colors.length] + (type === 'bar' ? 'cc' : 'ff')),
                borderColor: type === 'line'
                    ? '#6366f1'
                    : labels.map((_, i) => colors[i % colors.length]),
                borderWidth: type === 'line' ? 2 : 1,
                fill: type === 'line',
                tension: 0.4,
                pointBackgroundColor: '#6366f1',
                pointRadius: type === 'line' ? 4 : 0,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: opts.horizontal ? 'y' : 'x',
            plugins: {
                legend: { display: opts.legend || false },
                tooltip: { callbacks: opts.tooltipCb || {} }
            },
            scales: type === 'doughnut' ? {} : {
                x: { ticks: { color, font: { size: 11 } }, grid: { color: gridColor } },
                y: { ticks: { color, font: { size: 11 } }, grid: { color: gridColor } }
            }
        }
    });
}

function buildLegend(containerId, labels, colors) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = labels.map((l, i) =>
        `<div class="legend-item">
           <div class="legend-dot" style="background:${colors[i % colors.length]}"></div>
           <span>${l}</span>
         </div>`
    ).join('');
}

async function loadChartCiudad() {
    const d = await api(`/api/datasets/${currentDataset}/simcomp/por-ciudad?limit=10`);
    scChart('chart-ciudad', 'bar', d.labels, d.values, {
        horizontal: true, label: 'Comparendos',
        colors: ['#6366f1','#818cf8','#a5b4fc','#c7d2fe','#e0e7ff',
                 '#4f46e5','#4338ca','#3730a3','#312e81','#1e1b4b']
    });
}

async function loadChartEstado() {
    const d = await api(`/api/datasets/${currentDataset}/simcomp/por-estado`);
    const cols = ['#f59e0b','#22c55e','#ef4444'];
    scChart('chart-estado', 'doughnut', d.labels, d.values, { colors: cols, legend: false });
    buildLegend('estado-legend', d.labels, cols);
}

async function loadChartSancion() {
    const d = await api(`/api/datasets/${currentDataset}/simcomp/por-tipo-sancion`);
    scChart('chart-sancion', 'bar', d.labels, d.values, { label: 'Comparendos' });
}

async function loadChartMulta() {
    const d = await api(`/api/datasets/${currentDataset}/simcomp/por-valor-multa`);
    scChart('chart-multa', 'bar', d.labels, d.values, { label: 'Frecuencia' });
}

async function loadChartTendencia() {
    const d = await api(`/api/datasets/${currentDataset}/simcomp/tendencia-mensual`);
    scChart('chart-tendencia', 'line', d.labels, d.values, { label: 'Comparendos' });
}

async function loadChartMarca() {
    const d = await api(`/api/datasets/${currentDataset}/simcomp/por-marca`);
    scChart('chart-marca', 'bar', d.labels, d.values, { label: 'Comparendos' });
}

async function loadChartServicio() {
    const d = await api(`/api/datasets/${currentDataset}/simcomp/por-tipo-servicio`);
    const cols = ['#6366f1','#f59e0b','#22c55e','#ef4444'];
    scChart('chart-servicio', 'doughnut', d.labels, d.values, { colors: cols, legend: false });
    buildLegend('servicio-legend', d.labels, cols);
}

async function loadChartLicencia() {
    const d = await api(`/api/datasets/${currentDataset}/simcomp/por-categoria-licencia`);
    scChart('chart-licencia', 'bar', d.labels, d.values, { label: 'Comparendos' });
}

async function loadChartAnio() {
    const d = await api(`/api/datasets/${currentDataset}/simcomp/por-anio`);
    scChart('chart-anio', 'bar', d.labels, d.values, {
        label: 'Comparendos',
        colors: ['#6366f1','#22c55e','#f59e0b']
    });
}

function updateChartThemes() {
    // Destruye y vuelve a renderizar todos los charts de SIMCOMP
    if (currentDataset) loadSimcompDashboard();
}

/* ─── General dashboard ─────────────────────────────────────── */
async function loadSummary() {
    const [data, numeric, categorical] = await Promise.all([
        api(`/api/datasets/${currentDataset}/summary`),
        api(`/api/datasets/${currentDataset}/numeric-columns`),
        api(`/api/datasets/${currentDataset}/categorical-columns`)
    ]);
    document.getElementById('totalRows').innerText      = data.total_rows.toLocaleString();
    document.getElementById('totalColumns').innerText   = data.total_columns;
    document.getElementById('numericCount').innerText   = numeric.length;
    document.getElementById('categoricalCount').innerText = categorical.length;
    const table = document.getElementById('schemaTable');
    table.innerHTML = '';
    data.schema.forEach(c => {
        table.innerHTML += `<tr><td>${c.name}</td><td><span class="badge bg-info text-dark">${c.type}</span></td></tr>`;
    });
}

async function loadMissingValues() {
    const data = await api(`/api/datasets/${currentDataset}/missing`);
    const table = document.getElementById('missingTable');
    table.innerHTML = '';
    data.forEach(row => {
        const cls = row.percentage > 20 ? 'text-danger' : row.percentage > 0 ? 'text-warning' : 'text-success';
        table.innerHTML += `<tr><td>${row.column}</td><td>${row.missing}</td><td class="${cls} fw-bold">${row.percentage}%</td></tr>`;
    });
    renderMissingChart(data);
}

function renderMissingChart(data) {
    const top = data.filter(r => r.missing > 0).sort((a, b) => b.missing - a.missing).slice(0, 10);
    const ctx = document.getElementById('missingChart');
    if (!ctx) return;
    if (missingChart) missingChart.destroy();
    missingChart = new Chart(ctx, {
        type: 'bar',
        data: { labels: top.map(r => r.column), datasets: [{ label: 'Nulos', data: top.map(r => r.missing), backgroundColor: 'rgba(239,68,68,0.6)', borderColor: '#ef4444', borderWidth: 1 }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

async function loadCategoricalColumns() {
    const data = await api(`/api/datasets/${currentDataset}/categorical-columns`);
    const sel = document.getElementById('categoricalSelect');
    sel.innerHTML = '';
    data.forEach(c => sel.innerHTML += `<option value="${c}">${c}</option>`);
    if (data.length) await loadCategoryChart();
}

async function loadCategoryChart() {
    const column = document.getElementById('categoricalSelect').value;
    if (!column) return;
    const data = await api(`/api/datasets/${currentDataset}/top-categories?column=${encodeURIComponent(column)}`);
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    if (categoryChart) categoryChart.destroy();
    categoryChart = new Chart(ctx, {
        type: 'bar',
        data: { 
            labels: data.labels, 
            datasets: [{ 
                label: 'Top valores', 
                data: data.values, 
                backgroundColor: data.labels.map((_, i) => PALETTE[i % PALETTE.length] + 'cc'),
                borderColor: data.labels.map((_, i) => PALETTE[i % PALETTE.length]),
                borderWidth: 1 
            }] 
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

async function loadNumericStats() {
    const data = await api(`/api/datasets/${currentDataset}/numeric-statistics`);
    const head = document.getElementById('statsHead');
    const body = document.getElementById('statsBody');
    head.innerHTML = ''; body.innerHTML = '';
    if (!data.length) { body.innerHTML = "<tr><td colspan='100%'>No hay columnas numéricas</td></tr>"; return; }
    const cols = Object.keys(data[0]);
    head.innerHTML = `<tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr>`;
    data.forEach(row => { body.innerHTML += `<tr>${cols.map(c => `<td>${row[c]}</td>`).join('')}</tr>`; });
}

async function loadRecommendations() {
    const data = await api(`/api/datasets/${currentDataset}/recommendations`);
    const table = document.getElementById('recommendationsTable');
    table.innerHTML = '';
    data.forEach(row => {
        table.innerHTML += `<tr><td><b>${row.column}</b></td><td><span class="badge bg-secondary">${row.type}</span></td><td>${row.distinct}</td><td><i class="bi bi-graph-up"></i> ${row.recommended_visual}</td><td class="small text-muted">${row.usage}</td></tr>`;
    });
}

async function loadCorrelationHeatmap() {
    const data = await api(`/api/datasets/${currentDataset}/correlation-matrix`);
    const heatmap = document.getElementById('heatmap');
    heatmap.innerHTML = '';
    if (!data.columns || data.columns.length < 2) {
        heatmap.innerHTML = "<div class='alert alert-info'>No hay suficientes columnas numéricas para calcular correlaciones.</div>"; return;
    }
    const container = document.createElement('div');
    container.className = 'heatmap';
    const header = document.createElement('div');
    header.className = 'heatmap-row';
    header.innerHTML = `<div class="heatmap-cell heatmap-label">#</div>` +
        data.columns.map(c => `<div class="heatmap-cell heatmap-label" title="${c}">${c.substring(0,8)}...</div>`).join('');
    container.appendChild(header);
    data.matrix.forEach((row, i) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'heatmap-row';
        rowDiv.innerHTML = `<div class="heatmap-cell heatmap-label" title="${data.columns[i]}">${data.columns[i].substring(0,8)}...</div>` +
            row.map(v => {
                let color = 'var(--table-hover)';
                let textColor = 'var(--text)';
                const val = parseFloat(v);
                const isDark = document.body.classList.contains('dark');
                
                if (val > 0.05) {
                    const alpha = Math.min(val + 0.1, 0.9);
                    color = `rgba(99, 102, 241, ${alpha})`; 
                    textColor = alpha > 0.4 ? '#fff' : (isDark ? '#fff' : '#000');
                } else if (val < -0.05) {
                    const alpha = Math.min(Math.abs(val) + 0.1, 0.9);
                    color = `rgba(239, 68, 68, ${alpha})`;
                    textColor = alpha > 0.4 ? '#fff' : (isDark ? '#fff' : '#000');
                } else {
                    color = isDark ? '#1e293b' : '#f8fafc';
                    textColor = isDark ? '#94a3b8' : '#64748b';
                }
                
                return `<div class="heatmap-cell" style="background:${color}; color:${textColor}; border: 1px solid var(--border); font-size: 10px;" title="${v}">${val.toFixed(2)}</div>`;
            }).join('');
        container.appendChild(rowDiv);
    });
    heatmap.appendChild(container);
}

async function loadNumericTopChart() {
    const data = await api(`/api/datasets/${currentDataset}/numeric-top`);
    const ctx = document.getElementById('numericTopChart');
    if (!ctx) return;
    if (numericTopChart) numericTopChart.destroy();
    numericTopChart = new Chart(ctx, {
        type: 'bar',
        data: { 
            labels: data.map(d => d.column), 
            datasets: [{ 
                label: 'Promedio', 
                data: data.map(d => d.mean), 
                backgroundColor: data.map((_, i) => PALETTE[i % PALETTE.length] + 'cc'),
                borderColor: data.map((_, i) => PALETTE[i % PALETTE.length]),
                borderWidth: 2,
                borderRadius: 8
            }] 
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { 
                legend: { display: false },
                tooltip: { backgroundColor: 'rgba(19, 26, 43, 0.9)' }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

/* ─── Table / Pagination ────────────────────────────────────── */
let currentPage = 1, currentLimit = 10, tableData = [];

async function loadTable() {
    const res = await api(`/api/datasets/${currentDataset}/data?page=${currentPage}&limit=${currentLimit}`);
    tableData = res.data;
    const head = document.getElementById('tableHead');
    const body = document.getElementById('tableBody');
    head.innerHTML = ''; body.innerHTML = '';
    if (!tableData.length) return;
    const cols = Object.keys(tableData[0]);
    head.innerHTML = `<tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr>`;
    tableData.forEach(row => { body.innerHTML += `<tr>${cols.map(c => `<td>${row[c] ?? ''}</td>`).join('')}</tr>`; });
    document.getElementById('pageInfo').innerText = `Página ${currentPage}`;
}

function nextPage() { currentPage++; loadTable(); }
function prevPage() { if (currentPage > 1) { currentPage--; loadTable(); } }
function changeLimit() { currentLimit = document.getElementById('limitSelect').value; currentPage = 1; loadTable(); }

function filterTable() {
    const text = document.getElementById('filterInput').value.toLowerCase();
    const body = document.getElementById('tableBody');
    body.innerHTML = '';
    tableData.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(text)))
             .forEach(row => { body.innerHTML += `<tr>${Object.values(row).map(v => `<td>${v ?? ''}</td>`).join('')}</tr>`; });
}

/* ─── Spark Terminal ────────────────────────────────────────── */
async function runSparkQuery() {
    const query = document.getElementById('queryInput').value.trim();
    if (!query) return;
    if (!currentDataset) { showToast('Primero selecciona un dataset'); return; }
    const container = document.getElementById('queryResultContainer');
    const outputDiv = document.getElementById('queryOutput');
    const errorDiv  = document.getElementById('queryError');
    container.style.display = 'block';
    toggleLoader(true, 'Ejecutando código PySpark...');
    errorDiv.style.display = 'none';
    outputDiv.innerText = 'Procesando...';
    try {
        const result = await api(`/api/datasets/${currentDataset}/query`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: query })
        });
        if (!result.success) { errorDiv.innerText = result.error; errorDiv.style.display = 'block'; outputDiv.innerText = ''; return; }
        outputDiv.innerText = result.output;
        showToast('Código ejecutado correctamente');
    } catch(e) { errorDiv.innerText = 'Error al conectar con Spark: ' + e.message; errorDiv.style.display = 'block'; outputDiv.innerText = ''; }
    finally { toggleLoader(false); }
}

document.getElementById('queryInput').addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'Enter') runSparkQuery();
});

/* ─── File upload drag & drop ───────────────────────────────── */
const uploadArea = document.getElementById('uploadArea');
if (uploadArea) {
    uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.style.borderColor = '#6366f1'; });
    uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = ''; });
    uploadArea.addEventListener('drop', e => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length) { document.getElementById('fileInput').files = files; handleFileSelection(); }
    });
}

function handleFileSelection() {
    const input = document.getElementById('fileInput');
    if (input.files.length) {
        document.getElementById('fileNameDisplay').innerText = input.files[0].name;
        document.getElementById('fileInfo').style.display = 'block';
        document.getElementById('uploadArea').style.display = 'none';
    }
}

document.getElementById('fileInput').addEventListener('change', handleFileSelection);

/* ─── Init ──────────────────────────────────────────────────── */
loadDatasets().then(() => {
    const sel = document.getElementById('datasetSelect');
    if (sel) {
        sel.addEventListener('change', () => {
            loadAllDashboards();
        });
    }
});