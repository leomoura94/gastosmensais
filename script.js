let gastos = JSON.parse(localStorage.getItem("gastos")) || [];
let entradas = JSON.parse(localStorage.getItem("entradas")) || [];

const form = document.getElementById("gastoForm");
const saldoForm = document.getElementById("saldoForm");
const resetarBtn = document.getElementById("resetar");
const saldoBancoEl = document.getElementById("saldoBanco");
const totalGastoEl = document.getElementById("totalGasto");
const historicoEl = document.getElementById("historico");
const ctx = document.getElementById("graficoGastos").getContext("2d");

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function calcularTotais() {
  const totalEntradas = entradas.reduce((acc, e) => acc + e.valor, 0);
  const totalGastos = gastos.reduce((acc, g) => acc + g.valor, 0);
  const saldoAtual = totalEntradas - totalGastos;
  return { totalEntradas, totalGastos, saldoAtual };
}

function atualizarPainel() {
  const { totalEntradas, totalGastos, saldoAtual } = calcularTotais();
  saldoBancoEl.textContent = formatarMoeda(saldoAtual);
  totalGastoEl.textContent = formatarMoeda(totalGastos);
  localStorage.setItem("gastos", JSON.stringify(gastos));
  localStorage.setItem("entradas", JSON.stringify(entradas));
  atualizarGrafico();
  renderizarHistorico();
}

let grafico = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: [],
    datasets: [{
      label: "Gastos por Categoria",
      data: [],
      backgroundColor: ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#fb7185"],
    }],
  },
  options: {
    plugins: {
      legend: { labels: { color: "#ccc" } },
    },
  },
});

function atualizarGrafico() {
  const categorias = {};
  gastos.forEach((g) => {
    categorias[g.categoria] = (categorias[g.categoria] || 0) + g.valor;
  });
  grafico.data.labels = Object.keys(categorias);
  grafico.data.datasets[0].data = Object.values(categorias);
  grafico.update();
}

function renderizarHistorico() {
  historicoEl.innerHTML = "";
  const todosMovimentos = [
    ...entradas.map((e) => ({ tipo: "entrada", quem: e.quem, valor: e.valor, descricao: e.descricao, data: new Date(e.data) })),
    ...gastos.map((g) => ({ tipo: "gasto", quem: g.quem, valor: g.valor, categoria: g.categoria, pagamento: g.tipo, data: new Date(g.data) })),
  ];
  todosMovimentos.sort((a, b) => b.data - a.data);
  const porMes = {};

  todosMovimentos.forEach((mov) => {
    const mes = mov.data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    if (!porMes[mes]) porMes[mes] = [];
    porMes[mes].push(mov);
  });

  for (const mes in porMes) {
    const bloco = document.createElement("div");
    bloco.innerHTML = `<h3 class="font-bold mb-2">${mes}</h3>`;
    porMes[mes].forEach((mov) => {
      let texto = "";
      if (mov.tipo === "entrada") {
        texto = `<span class="text-green-500">+ ${formatarMoeda(mov.valor)}</span> – ${mov.quem} | ${mov.descricao}`;
      } else {
        texto = `<span class="text-red-500">- ${formatarMoeda(mov.valor)}</span> – ${mov.quem} | ${mov.categoria} (${mov.pagamento})`;
      }
      const linha = document.createElement("p");
      linha.className = "text-gray-300";
      linha.innerHTML = `${mov.data.toLocaleDateString("pt-BR")} - ${texto}`;
      bloco.appendChild(linha);
    });
    historicoEl.appendChild(bloco);
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const quem = document.getElementById("quem").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const categoria = document.getElementById("categoria").value.trim();
  const tipo = document.getElementById("tipo").value;
  if (!valor || valor <= 0 || categoria === "") return alert("Preencha corretamente.");
  gastos.push({ quem, valor, categoria, tipo, data: new Date().toISOString() });
  form.reset();
  atualizarPainel();
});

saldoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const quem = document.getElementById("quemSaldo").value;
  const valor = parseFloat(document.getElementById("valorSaldo").value);
  const descricao = document.getElementById("descricaoSaldo").value.trim();
  if (!valor || valor <= 0 || descricao === "") return alert("Preencha corretamente.");
  entradas.push({ quem, valor, descricao, data: new Date().toISOString() });
  saldoForm.reset();
  atualizarPainel();
});

resetarBtn.addEventListener("click", () => {
  if (confirm("Tem certeza que deseja resetar tudo?")) {
    gastos = [];
    entradas = [];
    localStorage.clear();
    atualizarPainel();
  }
});

atualizarPainel();
