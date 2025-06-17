const categorias = [
  "Condomínio", "IPTU", "Minha Casa Minha Vida", "Fatura Cartão de Crédito", "Luz", "Gás", "Internet",
  "Academia", "Dívida (Leo)", "Celular Camila", "Celular Leo", "Faculdade", "Spotify", "Streaming",
  "Mesada Vó Nilza", "Diarista", "Psicólogas", "Supermercado", "Combustível", "Animal de Estimação",
  "Farmácia", "Impostos", "Supérfluos", "Almoço (trabalho)", "Barbearia", "Estacionamento",
  "Gastos Desconhecidos", "Lavagem do Carro", "Emergências", "Presentes", "Restaurante",
  "Roupas e Calçados", "Conserto de roupa", "Salão de Beleza I Esteticista", "Utensílios Domésticos",
  "Viagens", "Aniversário Cami I Leo", "Uber", "Saúde", "Doações"
];

const gastoForm = document.getElementById("gastoForm");
const saldoForm = document.getElementById("saldoForm");
const categoriaSelect = document.getElementById("categoria");
const historicoEl = document.getElementById("historico");
const saldoBancoEl = document.getElementById("saldoBanco");
const totalGastoEl = document.getElementById("totalGasto");
const resetBtn = document.getElementById("resetBtn");

let gastos = JSON.parse(localStorage.getItem("gastos") || "[]");
let saldos = JSON.parse(localStorage.getItem("saldos") || "[]");

categorias.forEach(c => {
  const opt = document.createElement("option");
  opt.value = c;
  opt.textContent = c;
  categoriaSelect.appendChild(opt);
});

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function atualizarPainel() {
  const totalGastos = gastos.reduce((acc, g) => acc + g.valor, 0);
  const totalSaldos = saldos.reduce((acc, s) => acc + s.valor, 0);
  saldoBancoEl.textContent = formatarMoeda(totalSaldos - totalGastos);
  totalGastoEl.textContent = formatarMoeda(totalGastos);
  localStorage.setItem("gastos", JSON.stringify(gastos));
  localStorage.setItem("saldos", JSON.stringify(saldos));
  renderizarHistorico();
}

function renderizarHistorico() {
  historicoEl.innerHTML = "";
  const todos = [
    ...saldos.map(s => ({ ...s, tipo: "entrada" })),
    ...gastos.map(g => ({ ...g, tipo: "gasto" }))
  ].sort((a, b) => new Date(b.data) - new Date(a.data));

  todos.forEach(mov => {
    const div = document.createElement("div");
    const data = new Date(mov.data).toLocaleDateString("pt-BR");
    if (mov.tipo === "entrada") {
      div.innerHTML = `<span class="text-green-600">[+]</span> ${mov.quem}: ${formatarMoeda(mov.valor)} – ${mov.descricao} (${data})`;
    } else {
      div.innerHTML = `<span class="text-red-600">[-]</span> ${mov.quem}: ${formatarMoeda(mov.valor)} – ${mov.categoria} (${mov.tipo}) (${data})`;
    }
    historicoEl.appendChild(div);
  });
}

gastoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const quem = document.getElementById("quem").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const categoria = document.getElementById("categoria").value;
  const tipo = document.getElementById("tipo").value;

  if (valor > 0) {
    gastos.push({ quem, valor, categoria, tipo, data: new Date().toISOString() });
    gastoForm.reset();
    atualizarPainel();
  }
});

saldoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const quem = document.getElementById("quemSaldo").value;
  const valor = parseFloat(document.getElementById("valorSaldo").value);
  const descricao = document.getElementById("descricaoSaldo").value;

  if (valor > 0) {
    saldos.push({ quem, valor, descricao, data: new Date().toISOString() });
    saldoForm.reset();
    atualizarPainel();
  }
});

resetBtn.addEventListener("click", () => {
  if (confirm("Tem certeza que deseja resetar tudo?")) {
    gastos = [];
    saldos = [];
    localStorage.clear();
    atualizarPainel();
  }
});

atualizarPainel();
