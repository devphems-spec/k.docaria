document.addEventListener("DOMContentLoaded", () => {

  /* =====================================
     PÁGINA INDEX (CARDS)
  ====================================== */

  function verificarHorario() {
  const statusElemento = document.querySelector(".status-loja");

  const agora = new Date();
  const hora = agora.getHours();
  const minuto = agora.getMinutes();

  // Horário de funcionamento
  const abre = 9;        // 09:00
  const fecha = 21;      // 21:50
  const fechaMinuto = 50;

  if (
    (hora > abre && hora < fecha) ||
    (hora === abre) ||
    (hora === fecha && minuto <= fechaMinuto)
  ) {
    statusElemento.innerHTML =
      "<span class='aberto'>Aberto até às 21:50</span>";
  } else {
    statusElemento.innerHTML =
      "<span class='fechado'>Apenas agendamento • Abrimos amanhã às 09h00</span>";
  }
}

verificarHorario();

  if (document.querySelector(".card")) {

    const MINIMO = 25;
    let carrinho = [];

    function atualizarCarrinho() {
      let totalItens = 0;
      let totalValor = 0;

      carrinho.forEach(item => {
        totalItens += item.qtd;
        totalValor += item.qtd * item.preco;
      });

      document.getElementById("totalItens").innerText = totalItens;
      document.getElementById("totalValor").innerText =
        totalValor.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        
    }

    document.querySelectorAll(".card").forEach(card => {

      const nome = card.dataset.nome;
      const preco = parseFloat(card.dataset.preco);
      const menos = card.querySelector(".menos");
      const mais = card.querySelector(".mais");
      const input = card.querySelector(".qtd");

      function atualizarItem(qtd) {
        if (qtd < 0 || isNaN(qtd)) qtd = 0;
        input.value = qtd;

        let item = carrinho.find(i => i.nome === nome);

        if (qtd === 0) {
          carrinho = carrinho.filter(i => i.nome !== nome);
        } else {
          if (item) {
            item.qtd = qtd;
          } else {
            carrinho.push({ nome, preco, qtd });
          }
        }

        atualizarCarrinho();
      }

      mais.addEventListener("click", () => {
        atualizarItem(parseInt(input.value) + 1);
      });

      menos.addEventListener("click", () => {
        atualizarItem(parseInt(input.value) - 1);
      });

      input.addEventListener("input", () => {
        let valor = parseInt(input.value);
        if (valor < 0 || isNaN(valor)) valor = 0;
        atualizarItem(valor);
      });

    });

    document.getElementById("carrinhoBtn").addEventListener("click", () => {

      if (carrinho.length === 0) {
        alert("Carrinho vazio.");
        return;
      }

      let totalUnidades = carrinho.reduce((soma, item) => soma + item.qtd, 0);

      if (totalUnidades < MINIMO) {
        alert(`Quantidade mínima total de ${MINIMO} unidades.`);
        return;
      }

      localStorage.setItem("carrinho", JSON.stringify(carrinho));
      window.location.href = "resumo.html";
    });
  }

  /* =====================================
     PÁGINA RESUMO
  ====================================== */

  if (document.getElementById("listaResumo")) {

    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    const lista = document.getElementById("listaResumo");
    const totalSpan = document.getElementById("totalFinal");

    let total = 0;

    if (carrinho.length === 0) {
      lista.innerHTML = "<p>Seu carrinho está vazio.</p>";
    } else {
      carrinho.forEach(item => {
        const subtotal = item.preco * item.qtd;
        total += subtotal;

        lista.innerHTML += `
          <div class="item-resumo">
            ${item.nome} - ${item.qtd}x  
            <strong>R$ ${subtotal.toFixed(2)}</strong>
          </div>
        `;
      });
    }

    totalSpan.textContent = total.toFixed(2);

    /* ENTREGA */

    let tipoEntrega = "retirada";

    const btnRetirada = document.getElementById("btnRetirada");
    const btnEntrega = document.getElementById("btnEntrega");
    const enderecoInput = document.getElementById("enderecoCliente");

    btnRetirada.addEventListener("click", () => {
      tipoEntrega = "retirada";
      btnRetirada.classList.add("ativo");
      btnEntrega.classList.remove("ativo");
      enderecoInput.style.display = "none";
      enderecoInput.value = "";
    });

    btnEntrega.addEventListener("click", () => {
      tipoEntrega = "entrega";
      btnEntrega.classList.add("ativo");
      btnRetirada.classList.remove("ativo");
      enderecoInput.style.display = "block";
    });

    /* PAGAMENTO */

    let formaPagamento = "pix";

    const botoesPagamento = document.querySelectorAll(".pagamento-btn");
    const opcoesCartao = document.getElementById("opcoesCartao");
    const tipoCartao = document.getElementById("tipoCartao");
    const infoPix = document.getElementById("infoPix");

    botoesPagamento.forEach(btn => {
      btn.addEventListener("click", () => {

        botoesPagamento.forEach(b => b.classList.remove("ativo"));
        btn.classList.add("ativo");

        formaPagamento = btn.dataset.pagamento;

        if (formaPagamento === "cartao") {
          opcoesCartao.style.display = "block";
          infoPix.style.display = "none";
        } else {
          opcoesCartao.style.display = "none";
          infoPix.style.display = "block";
          tipoCartao.value = "";
        }
      });
    });

    /* FINALIZAR */

    window.finalizarPedido = function () {

      const nome = document.getElementById("nomeCliente").value.trim();
      const telefone = document.getElementById("telefoneCliente").value.trim();
      const data = document.getElementById("dataEncomenda").value;
      const hora = document.getElementById("horaEncomenda").value;
      const endereco = enderecoInput.value.trim();

      if (!nome || !telefone || !data || !hora) {
        alert("Preencha todos os campos.");
        return;
      }

      if (tipoEntrega === "entrega" && !endereco) {
        alert("Informe o endereço para entrega.");
        return;
      }

      if (formaPagamento === "cartao" && !tipoCartao.value) {
        alert("Selecione Crédito ou Débito.");
        return;
      }

      const [ano, mes, dia] = data.split("-");

      let msg = `Olá! Meu nome é ${nome}%0A`;
      msg += `Telefone: ${telefone}%0A`;
      msg += `Tipo: *${tipoEntrega === "entrega" ? "Entrega" : "Retirada"}*%0A`;
      msg += `Forma de pagamento: *${formaPagamento === "pix" ? "PIX" : "Cartão - " + tipoCartao.value}*%0A`;

      if (tipoEntrega === "entrega") {
        msg += `Endereço: ${endereco}%0A`;
      }

      msg += `Data: ${dia}/${mes}/${ano} às ${hora}%0A%0A`;

      carrinho.forEach(item => {
        msg += `• ${item.nome} - ${item.qtd}x = R$ ${(item.qtd * item.preco).toFixed(2)}%0A`;
      });

      msg += `%0ATotal: R$ ${total.toFixed(2)}`;

      window.open(`https://wa.me/557488333133?text=${msg}`, "_blank");

      localStorage.removeItem("carrinho");
    };
  }
  /* =====================================
     LOGIN MODAL
  ====================================== */

  const loginBtn = document.getElementById("loginBtn");
  const modalLogin = document.getElementById("modalLogin");
  const fecharLogin = document.querySelector(".fechar");

  if (loginBtn && modalLogin) {

    loginBtn.addEventListener("click", () => {
      modalLogin.style.display = "flex";
    });

    if (fecharLogin) {
      fecharLogin.addEventListener("click", () => {
        modalLogin.style.display = "none";
      });
    }

    window.addEventListener("click", (e) => {
      if (e.target === modalLogin) {
        modalLogin.style.display = "none";
      }
    });
  }
/* =====================================
   LOGIN REAL FIREBASE
===================================== */

let modoCadastro = false;

const emailInput = document.getElementById("emailLogin");
const senhaInput = document.getElementById("senhaLogin");
const btnEntrar = document.getElementById("btnEntrar");
const alternarModo = document.getElementById("alternarModo");
const erroLogin = document.getElementById("erroLogin");
const tituloLogin = document.getElementById("tituloLogin");

if (btnEntrar && typeof firebase !== "undefined") {

  alternarModo.addEventListener("click", (e) => {
    e.preventDefault();
    modoCadastro = !modoCadastro;

    if (modoCadastro) {
      tituloLogin.innerText = "Criar Conta";
      btnEntrar.innerText = "Cadastrar";
      alternarModo.innerText = "Já tenho conta";
    } else {
      tituloLogin.innerText = "Entrar";
      btnEntrar.innerText = "Entrar";
      alternarModo.innerText = "Criar conta";
    }
  });

  btnEntrar.addEventListener("click", async () => {

    const email = emailInput.value.trim();
    const senha = senhaInput.value.trim();
    erroLogin.innerText = "";

    if (!email || !senha) {
      erroLogin.innerText = "Preencha todos os campos.";
      return;
    }

    try {

      if (modoCadastro) {
        await firebase.auth().createUserWithEmailAndPassword(email, senha);
        alert("Conta criada com sucesso!");
      } else {
        await firebase.auth().signInWithEmailAndPassword(email, senha);
        alert("Login realizado com sucesso!");
      }

      modalLogin.style.display = "none";

    } catch (error) {
      erroLogin.innerText = "Erro: " + error.message;
    }

  });

  firebase.auth().onAuthStateChanged(user => {

  const loginBtn = document.getElementById("loginBtn");

  if (user) {
    loginBtn.innerHTML =
      `<i class="fa-solid fa-user-check"></i>
       <span>${user.email}</span>
       <button id="logoutBtn" style="margin-left:8px;">Sair</button>`;

    const logoutBtn = document.getElementById("logoutBtn");

    logoutBtn.addEventListener("click", () => {
      firebase.auth().signOut();
      location.reload();
    });

  } else {
    loginBtn.innerHTML =
      `<i class="fa-solid fa-user"></i><span>Login</span>`;
  }

});

}

});
