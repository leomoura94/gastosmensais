const categoriasFixas = [
  "Condomínio", "IPTU", "Minha Casa Minha Vida", "Fatura Cartão de Crédito", "Luz", "Gás", "Internet", "Academia",
  "Dívida (Leo)", "Celular Camila", "Celular Leo", "Faculdade", "Spotify", "Streaming", "Mesada Vó Nilza",
  "Diarista", "Psicólogas", "Supermercado", "Combustível", "Animal de Estimação", "Farmácia", "Impostos", "Supérfluos",
  "Almoço (trabalho)", "Barbearia", "Estacionamento", "Gastos Desconhecidos", "Lavagem do Carro", "Emergências",
  "Presentes", "Restaurante", "Roupas e Calçados", "Conserto de roupa", "Salão de Beleza I Esteticista", 
  "Utensílios Domésticos", "Viagens", "Aniversário Cami I Leo", "Uber", "Saúde", "Doações"
];

const gastos = JSON.parse(localStorage.getItem("gastos") || "[]");
const entradas = JSON.parse(localStorage.getItem("entradas") || "[]");

const saldoBancoEl = document.getElementById("saldoBanco");
const totalGastoEl = document.getElementById("totalGasto");
const historicoEl = document.getElementById("historico");
const categoriaSelect = document.getElementById("categoria");
const graficoCanvas = document.getElementById("graficoGastos");
const chartCtx = graficoCanvas.getContext("2d");

categoriasFixas.forEach(cat => {
  const opt = document.createElement("option");
  opt.value = cat;
  opt.textContent = cat;
  categoriaSelect.appendChild(opt);
});

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function calcularTotais() {
  const totalEntradas = entradas.reduce((acc, e) => acc + e.valor, 0);
  const totalGastos = gastos.reduce((acc, g) => acc + g.valor, 0);
  return {
    saldoAtual: totalEntradas - totalGastos,
    totalGastos
  };
}

function atualizarPainel() {
  const { saldoAtual, totalGastos } = calcularTotais();
  saldoBancoEl.textContent = formatarMoeda(saldoAtual);
  totalGastoEl.textContent = formatarMoeda(totalGastos);
  localStorage.setItem("gastos", JSON.stringify(gastos));
  localStorage.setItem("entradas", JSON.stringify(entradas));
  renderizarHistorico();
  atualizarGrafico();
}

function renderizarHistorico() {
  historicoEl.innerHTML = "";
  const movimentos = [
    ...entradas.map(e => ({ ...e, tipo: "entrada" })),
    ...gastos.map(g => ({ ...g, tipo: "gasto" }))
  ];
  movimentos.sort((a, b) => new Date(b.data) - new Date(a.data));
  movimentos.forEach(mov => {
    const p = document.createElement("p");
    const data = new Date(mov.data).toLocaleDateString("pt-BR");
    p.textContent = `${data} - ${mov.tipo === "entrada"
      ? `+ ${formatarMoeda(mov.valor)} (${mov.descricao})`
      : `- ${formatarMoeda(mov.valor)} - ${mov.quem} (${mov.categoria}, ${mov.tipo})`}`;
    p.style.color = mov.tipo === "entrada" ? "green" : "red";
    historicoEl.appendChild(p);
  });
}

let chart;
function atualizarGrafico() {
  const dadosPorCategoria = {};
  gastos.forEach(({ categoria, valor }) => {
    dadosPorCategoria[categoria] = (dadosPorCategoria[categoria] || 0) + valor;
  });

  const labels = Object.keys(dadosPorCategoria);
  const valores = Object.values(dadosPorCategoria);

  if (chart) chart.destroy();
  chart = new Chart(chartCtx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Gastos por Categoria",
        data: valores,
        backgroundColor: "#00796b"
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false }
      },
      responsive: true,
    }
  });
}

document.getElementById("gastoForm").addEventListener("submit", e => {
  e.preventDefault();
  const quem = document.getElementById("quem").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const categoria = document.getElementById("categoria").value;
  const tipo = document.getElementById("tipo").value;
  gastos.push({ quem, valor, categoria, tipo, data: new Date().toISOString() });
  e.target.reset();
  atualizarPainel();
});

document.getElementById("saldoForm").addEventListener("submit", e => {
  e.preventDefault();
  const pessoa = document.getElementById("pessoaSaldo").value;
  const valor = parseFloat(document.getElementById("valorSaldo").value);
  const descricao = document.getElementById("descricaoSaldo").value;
  entradas.push({ valor, descricao: `${descricao} - ${pessoa}`, data: new Date().toISOString() });
  e.target.reset();
  atualizarPainel();
});

document.getElementById("resetar").addEventListener("click", () => {
  if (confirm("Tem certeza que deseja apagar tudo?")) {
    localStorage.removeItem("gastos");
    localStorage.removeItem("entradas");
    location.reload();
  }
});

atualizarPainel();
