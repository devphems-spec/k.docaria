// === CONFIG SUPABASE ===
const SUPABASE_URL = "https://jgpgzdbiovxmxfjkplbg.supabase.co";
const SUPABASE_KEY = "sb_publishable__Ndybua5TBAi4hJQBCP-Kw_Kxq06bMJ";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// === CONTROLE ===
let modoCadastro = false;

// abrir modal
loginBtn.onclick = () => {
  modalLogin.style.display = "flex";
};

// fechar modal
document.querySelector(".fechar").onclick = () => {
  modalLogin.style.display = "none";
};

// alternar login / cadastro
alternarModo.onclick = () => {
  modoCadastro = !modoCadastro;
  tituloLogin.innerText = modoCadastro ? "Criar conta" : "Entrar";
  btnEntrar.innerText = modoCadastro ? "Cadastrar" : "Entrar";
};

// botão principal
btnEntrar.onclick = async () => {
  const email = emailLogin.value;
  const senha = senhaLogin.value;

  if (!email || !senha) {
    erroLogin.innerText = "Preencha todos os campos";
    return;
  }

  erroLogin.innerText = "Carregando...";

  if (modoCadastro) {
    const { error } = await supabase.auth.signUp({
      email,
      password: senha
    });

    if (error) {
      erroLogin.innerText = error.message;
    } else {
      alert("Conta criada! Verifique seu email.");
      modalLogin.style.display = "none";
    }

  } else {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });

    if (error) {
      erroLogin.innerText = "Email ou senha inválidos";
    } else {
      alert("Login feito!");
      modalLogin.style.display = "none";
    }
  }
};

// === VERIFICAR SESSÃO ===
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    console.log("Usuário logado:", session.user.email);
    // aqui você pode mudar botão Login pra "Sair"
  } else {
    console.log("Usuário não logado");
  }
});
