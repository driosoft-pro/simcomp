let currentDataset = null;
let categoryChart = null;
let missingChart = null;
let numericTopChart = null;

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 4000);
}

function toggleLoader(show, text = "Procesando con Apache Spark...") {
    const loader = document.getElementById("loader");
    const loaderText = document.getElementById("loaderText");
    loaderText.innerText = text;
    if (show) {
        loader.classList.add("active");
    } else {
        loader.classList.remove("active");
    }
}

function showSection(sectionId, button) {
    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active-section");
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add("active-section");
    }

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    } else {
        // Si no se pasa el botón, buscarlo por ID
        const btn = document.getElementById(`btn-${sectionId}`);
        if (btn) btn.classList.add("active");
    }
}

function toggleTheme() {
    document.body.classList.toggle("dark");
    const icon = document.getElementById("themeIcon");
    icon.className = document.body.classList.contains("dark")
        ? "bi bi-sun"
        : "bi bi-moon-stars";
}

async function api(url, options = {}) {
    try {
        const response = await fetch(url, options);
        const contentType = response.headers.get("content-type") || "";

        if (!response.ok) {
            const text = await response.text();
            let errorMsg = `Error ${response.status}`;
            try {
                const json = JSON.parse(text);
                errorMsg = json.error || json.message || errorMsg;
            } catch (e) { }
            throw new Error(errorMsg);
        }

        if (!contentType.includes("application/json")) {
            throw new Error("La API no devolvió JSON");
        }

        return await response.json();
    } catch (err) {
        console.error("API Error:", err);
        showToast(err.message);
        throw err;
    }
}

async function loadDatasets() {
    const datasets = await api("/api/datasets");
    const select = document.getElementById("datasetSelect");

    select.innerHTML = "";
    datasets.forEach(dataset => {
        select.innerHTML += `<option value="${dataset}">${dataset}</option>`;
    });

    if (datasets.length > 0) {
        currentDataset = datasets[0];
        select.value = currentDataset;
    }
}

async function uploadDataset() {
    const input = document.getElementById("fileInput");

    if (!input.files.length) {
        showToast("Selecciona un archivo CSV");
        return;
    }

    toggleLoader(true, "Subiendo dataset al servidor...");

    const formData = new FormData();
    formData.append("file", input.files[0]);

    try {
        const result = await api("/api/datasets/upload", {
            method: "POST",
            body: formData
        });

        showToast(result.message || "Dataset cargado correctamente");
        await loadDatasets();
        
        // Seleccionar automáticamente el nuevo dataset
        if (result.dataset) {
            document.getElementById("datasetSelect").value = result.dataset;
            // Opcionalmente iniciar análisis de inmediato
            await loadDashboard();
        }
    } catch (e) {
        // Error ya manejado en api()
    } finally {
        toggleLoader(false);
    }
}

async function loadDashboard() {
    currentDataset = document.getElementById("datasetSelect").value;

    if (!currentDataset) {
        showToast("No hay dataset seleccionado");
        return;
    }

    document.getElementById("currentDatasetTitle").innerText = `Análisis: ${currentDataset}`;
    toggleLoader(true, "Spark está analizando el dataset...");

    try {
        // Ejecutar todas las cargas en paralelo para mayor velocidad
        await Promise.all([
            loadSummary(),
            loadMissingValues(),
            loadNumericStats(),
            loadCategoricalColumns(),
            loadRecommendations(),
            loadCorrelationHeatmap(),
            loadNumericTopChart(),
            loadTable()
        ]);

        showToast("¡Análisis finalizado con éxito!");
        showSection("inicio");
    } catch (e) {
        console.error("Error cargando dashboard:", e);
    } finally {
        toggleLoader(false);
    }
}

async function loadSummary() {
    const data = await api(`/api/datasets/${currentDataset}/summary`);
    const numeric = await api(`/api/datasets/${currentDataset}/numeric-columns`);
    const categorical = await api(`/api/datasets/${currentDataset}/categorical-columns`);

    document.getElementById("totalRows").innerText = data.total_rows.toLocaleString();
    document.getElementById("totalColumns").innerText = data.total_columns;
    document.getElementById("numericCount").innerText = numeric.length;
    document.getElementById("categoricalCount").innerText = categorical.length;

    const table = document.getElementById("schemaTable");
    table.innerHTML = "";
    data.schema.forEach(col => {
        table.innerHTML += `<tr><td>${col.name}</td><td><span class="badge bg-info text-dark">${col.type}</span></td></tr>`;
    });
}

async function loadMissingValues() {
    const data = await api(`/api/datasets/${currentDataset}/missing`);
    const table = document.getElementById("missingTable");
    table.innerHTML = "";

    data.forEach(row => {
        const colorClass = row.percentage > 20 ? 'text-danger' : (row.percentage > 0 ? 'text-warning' : 'text-success');
        table.innerHTML += `
            <tr>
                <td>${row.column}</td>
                <td>${row.missing}</td>
                <td class="${colorClass} fw-bold">${row.percentage}%</td>
            </tr>
        `;
    });

    renderMissingChart(data);
}

function renderMissingChart(data) {
    const top = data
        .filter(row => row.missing > 0)
        .sort((a, b) => b.missing - a.missing)
        .slice(0, 10);

    const ctx = document.getElementById("missingChart");
    if (!ctx) return;

    if (missingChart) missingChart.destroy();

    missingChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: top.map(row => row.column),
            datasets: [{
                label: "Valores nulos",
                data: top.map(row => row.missing),
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderColor: '#ef4444',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

async function loadCategoricalColumns() {
    const data = await api(`/api/datasets/${currentDataset}/categorical-columns`);
    const select = document.getElementById("categoricalSelect");

    select.innerHTML = "";
    data.forEach(column => {
        select.innerHTML += `<option value="${column}">${column}</option>`;
    });

    if (data.length > 0) {
        await loadCategoryChart();
    }
}

async function loadCategoryChart() {
    const column = document.getElementById("categoricalSelect").value;
    if (!column) return;

    const data = await api(`/api/datasets/${currentDataset}/top-categories?column=${encodeURIComponent(column)}`);
    const ctx = document.getElementById("categoryChart");
    if (!ctx) return;

    if (categoryChart) categoryChart.destroy();

    categoryChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: data.labels,
            datasets: [{
                label: `Top valores`,
                data: data.values,
                backgroundColor: 'rgba(99, 102, 241, 0.6)',
                borderColor: '#6366f1',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

async function loadNumericStats() {
    const data = await api(`/api/datasets/${currentDataset}/numeric-statistics`);
    const head = document.getElementById("statsHead");
    const body = document.getElementById("statsBody");

    head.innerHTML = "";
    body.innerHTML = "";

    if (!data.length) {
        body.innerHTML = "<tr><td colspan='100%'>No hay columnas numéricas</td></tr>";
        return;
    }

    const columns = Object.keys(data[0]);
    head.innerHTML = `<tr>${columns.map(col => `<th>${col}</th>`).join("")}</tr>`;

    data.forEach(row => {
        body.innerHTML += `<tr>${columns.map(col => `<td>${row[col]}</td>`).join("")}</tr>`;
    });
}


async function loadRecommendations() {
    const data = await api(`/api/datasets/${currentDataset}/recommendations`);
    const table = document.getElementById("recommendationsTable");
    table.innerHTML = "";

    data.forEach(row => {
        table.innerHTML += `
            <tr>
                <td><b>${row.column}</b></td>
                <td><span class="badge bg-secondary">${row.type}</span></td>
                <td>${row.distinct}</td>
                <td><i class="bi bi-graph-up"></i> ${row.recommended_visual}</td>
                <td class="small text-muted">${row.usage}</td>
            </tr>
        `;
    });
}

async function loadCorrelationHeatmap() {
    const data = await api(`/api/datasets/${currentDataset}/correlation-matrix`);
    const heatmap = document.getElementById("heatmap");
    heatmap.innerHTML = "";

    if (!data.columns || data.columns.length < 2) {
        heatmap.innerHTML = "<div class='alert alert-info'>No hay suficientes columnas numéricas para calcular correlaciones.</div>";
        return;
    }

    const container = document.createElement("div");
    container.className = "heatmap";

    // Header row
    const header = document.createElement("div");
    header.className = "heatmap-row";
    header.innerHTML = `<div class="heatmap-cell heatmap-label">#</div>` +
        data.columns.map(col => `<div class="heatmap-cell heatmap-label" title="${col}">${col.substring(0, 8)}...</div>`).join("");
    container.appendChild(header);

    // Rows
    data.matrix.forEach((row, i) => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "heatmap-row";
        rowDiv.innerHTML = `<div class="heatmap-cell heatmap-label" title="${data.columns[i]}">${data.columns[i].substring(0, 8)}...</div>` +
            row.map(value => {
                const intensity = Math.round(Math.abs(value) * 255);
                const color = value >= 0 ? `rgb(99, 102, ${intensity + 100})` : `rgb(${intensity + 100}, 50, 50)`;
                return `<div class="heatmap-cell" style="background:${color}" title="${value}">${value}</div>`;
            }).join("");
        container.appendChild(rowDiv);
    });
    heatmap.appendChild(container);
}

async function loadNumericTopChart() {
    const data = await api(`/api/datasets/${currentDataset}/numeric-top`);
    const ctx = document.getElementById("numericTopChart");
    if (!ctx) return;

    if (numericTopChart) numericTopChart.destroy();

    numericTopChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: data.map(d => d.column),
            datasets: [{
                label: "Promedio General",
                data: data.map(d => d.mean),
                backgroundColor: 'rgba(16, 185, 129, 0.6)',
                borderColor: '#10b981',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

// PAGINACIÓN Y TABLA COMPLETA
let currentPage = 1;
let currentLimit = 10;
let tableData = [];

async function loadTable() {
    const res = await api(`/api/datasets/${currentDataset}/data?page=${currentPage}&limit=${currentLimit}`);
    tableData = res.data;

    const head = document.getElementById("tableHead");
    const body = document.getElementById("tableBody");
    head.innerHTML = "";
    body.innerHTML = "";

    if (!tableData.length) return;

    const columns = Object.keys(tableData[0]);
    head.innerHTML = `<tr>${columns.map(c => `<th>${c}</th>`).join("")}</tr>`;

    tableData.forEach(row => {
        body.innerHTML += `<tr>${columns.map(c => `<td>${row[c] ?? ""}</td>`).join("")}</tr>`;
    });

    document.getElementById("pageInfo").innerText = `Página ${currentPage}`;
}

function nextPage() { currentPage++; loadTable(); }
function prevPage() { if (currentPage > 1) { currentPage--; loadTable(); } }
function changeLimit() {
    currentLimit = document.getElementById("limitSelect").value;
    currentPage = 1;
    loadTable();
}

function filterTable() {
    const text = document.getElementById("filterInput").value.toLowerCase();
    const filtered = tableData.filter(row =>
        Object.values(row).some(v => String(v).toLowerCase().includes(text))
    );

    const body = document.getElementById("tableBody");
    body.innerHTML = "";
    filtered.forEach(row => {
        body.innerHTML += `<tr>${Object.values(row).map(v => `<td>${v ?? ""}</td>`).join("")}</tr>`;
    });
}

// TERMINAL SPARK
async function runSparkQuery() {
    const query = document.getElementById("queryInput").value.trim();
    if (!query) return;

    if (!currentDataset) {
        showToast("Primero selecciona un dataset");
        return;
    }

    const container = document.getElementById("queryResultContainer");
    const outputDiv = document.getElementById("queryOutput");
    const errorDiv = document.getElementById("queryError");

    container.style.display = "block";
    toggleLoader(true, "Ejecutando código PySpark...");
    
    errorDiv.style.display = "none";
    outputDiv.innerText = "Procesando...";

    try {
        const result = await api(`/api/datasets/${currentDataset}/query`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: query })
        });

        if (!result.success) {
            errorDiv.innerText = result.error;
            errorDiv.style.display = "block";
            outputDiv.innerText = "";
            return;
        }

        outputDiv.innerText = result.output;
        showToast("Código ejecutado correctamente");
    } catch (e) {
        errorDiv.innerText = "Error al conectar con Spark: " + e.message;
        errorDiv.style.display = "block";
        outputDiv.innerText = "";
    } finally {
        toggleLoader(false);
    }
}

// Evento para ejecutar con Ctrl+Enter
document.getElementById("queryInput").addEventListener("keydown", function(e) {
    if (e.ctrlKey && e.key === "Enter") {
        runSparkQuery();
    }
});

// Manejo de Drag and Drop (opcional)
const uploadArea = document.getElementById("uploadArea");
if (uploadArea) {
    uploadArea.addEventListener("dragover", (e) => { e.preventDefault(); uploadArea.style.borderColor = "#6366f1"; });
    uploadArea.addEventListener("dragleave", () => { uploadArea.style.borderColor = ""; });
    uploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length) {
            document.getElementById("fileInput").files = files;
            handleFileSelection();
        }
    });
}

function handleFileSelection() {
    const input = document.getElementById("fileInput");
    const fileInfo = document.getElementById("fileInfo");
    const fileNameDisplay = document.getElementById("fileNameDisplay");
    
    if (input.files.length) {
        fileNameDisplay.innerText = input.files[0].name;
        fileInfo.style.display = "block";
        document.getElementById("uploadArea").style.display = "none";
    }
}

document.getElementById("fileInput").addEventListener("change", handleFileSelection);

// Iniciar aplicación
loadDatasets();