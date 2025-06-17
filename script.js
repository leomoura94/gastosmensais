const categoriasFixas = [
  "Condomínio", "IPTU", "Minha Casa Minha Vida", "Fatura Cartão de Crédito",
  "Luz", "Gás", "Internet", "Academia", "Dívida (Leo)", "Celular Camila",
  "Celular Leo", "Faculdade", "Spotify", "Streaming", "Mesada Vó Nilza",
  "Diarista", "Psicólogas", "Supermercado", "Combustível", "Animal de Estimação",
  "Farmácia", "Impostos", "Supérfluos", "Almoço (trabalho)", "Barbearia",
  "Estacionamento", "Gastos Desconhecidos", "Lavagem do Carro", "Emergências",
  "Presentes", "Restaurante", "Roupas e Calçados", "Conserto de roupa",
  "Salão de Beleza I Esteticista", "Utensílios Domésticos", "Viagens",
  "Aniversário Cami I Leo", "Uber", "Saúde", "Doações"
];

let gastos = JSON.parse(localStorage.getItem("gastos") || "[]");
let entradas = JSON.parse(localStorage.getItem("entradas") || "[]");

const form = document.getElementById("gastoForm");
const saldoForm = document.getElementById("saldoForm");
const categoriaSelect = document.getElementById("categoria");
const saldoBancoEl = document.getElementById("saldoBanco");
const totalGastoEl = document.getElementById("totalGasto");
const historicoEl = document.getElementById("historico");
const resetBtn = document.getElementById("resetar");

categoriasFixas.forEach(cat => {
  const opt = document.createElement("option");
  opt.value = cat;
  opt.textContent = cat;
  categoriaSelect.appendChild(opt);
});

function formatarMoeda(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function calcularTotais() {
  const totalEntradas = entradas.reduce((t, e) => t + e.valor, 0);
  const totalGastos = gastos.reduce((t, g) => t + g.valor, 0);
  return { totalEntradas, totalGastos, saldo: totalEntradas - totalGastos };
}

function atualizarPainel() {
  const { totalEntradas, totalGastos, saldo } = calcularTotais();
  saldoBancoEl.textContent = formatarMoeda(saldo);
  totalGastoEl.textContent = formatarMoeda(totalGastos);
  localStorage.setItem("gastos", JSON.stringify(gastos));
  localStorage.setItem("entradas", JSON.stringify(entradas));
  renderizarHistorico();
  atualizarGraficos();
}

function renderizarHistorico() {
  historicoEl.innerHTML = "";
  [...entradas.map(e => ({
    tipo: "entrada",
    descricao: e.descricao,
    valor: e.valor,
    quem: e.quem,
    data: new Date(e.data)
  })), ...gastos.map(g => ({
    tipo: "gasto",
    valor: g.valor,
    categoria: g.categoria,
    quem: g.quem,
    tipoPag: g.tipo,
    data: new Date(g.data)
  }))].sort((a,b)=>b.data-a.data)
    .forEach(m => {
      const p = document.createElement("p");
      const dataStr = m.data.toLocaleDateString("pt-BR");
      if (m.tipo === "entrada") {
        p.innerHTML = `${dataStr} - <span style="color:green;">+${formatarMoeda(m.valor)}</span> – ${m.quem} (${m.descricao})`;
      } else {
        p.innerHTML = `${dataStr} - <span style="color:red;">-${formatarMoeda(m.valor)}</span> – ${m.quem} | ${m.categoria} (${m.tipoPag})`;
      }
      historicoEl.appendChild(p);
    });
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const quem = document.getElementById("quem").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const categoria = document.getElementById("categoria").value;
  const tipo = document.getElementById("tipo").value;
  if (valor && categoria) {
    gastos.push({ quem, valor, categoria, tipo, data: new Date().toISOString() });
    form.reset();
    atualizarPainel();
  }
});

saldoForm.addEventListener("submit", e => {
  e.preventDefault();
  const valor = parseFloat(document.getElementById("valorSaldo").value);
  const descricao = document.getElementById("descricaoSaldo").value;
  const quem = document.getElementById("quemSaldo").value;
  if (valor && descricao) {
    entradas.push({ quem, valor, descricao, data: new Date().toISOString() });
    saldoForm.reset();
    atualizarPainel();
  }
});

resetBtn.addEventListener("click", () => {
  if (confirm("Tem certeza que deseja apagar tudo?")) {
    localStorage.clear();
    gastos = [];
    entradas = [];
    atualizarPainel();
  }
});

let graficoPizza, graficoEscada;

function atualizarGraficos() {
  const categorias = {};
  gastos.forEach(g => {
    categorias[g.categoria] = (categorias[g.categoria] || 0) + g.valor;
  });

  const labels = Object.keys(categorias);
  const valores = Object.values(categorias);

  if (graficoPizza) graficoPizza.destroy();
  if (graficoEscada) graficoEscada.destroy();

  graficoPizza = new Chart(document.getElementById("graficoPizza"), {
    type: "doughnut",
    data: {
      labels, datasets: [{ data: valores, backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'] }]
    }
  });

  graficoEscada = new Chart(document.getElementById("graficoEscada"), {
    type: "bar",
    data: {
      labels,
      datasets: [{ label: "Gastos por Categoria", data: valores, backgroundColor: "#60a5fa" }]
    },
    options: {
      indexAxis: "y",
      scales: { x: { beginAtZero: true } }
    }
  });
}

atualizarPainel();
