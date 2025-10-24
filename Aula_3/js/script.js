// script.js
// Manipulação de DOM, SPA simples, sistema de templates e verificação de consistência de formulários

document.addEventListener("DOMContentLoaded", () => {
  // --- Manipulação de DOM: mensagem de boas-vindas no index.html ---
  const mensagem = document.getElementById("mensagemBoasVindas");
  if (mensagem) {
    mensagem.textContent = "Seja muito bem-vindo à Sementes do Amanhã!";
  }

  // --- SPA simples: mostrar formulário de sugestão no NossosProjetos.html ---
  const botaoAbrir = document.getElementById("abrirForm");
  const formSugestao = document.getElementById("formSugestao");

  if (botaoAbrir && formSugestao) {
    botaoAbrir.addEventListener("click", () => {
      formSugestao.style.display = "block";
      botaoAbrir.style.display = "none";
    });
  }

  // --- Sistema de templates + verificação de consistência de dados ---
  const form = document.getElementById("sugestaoProjetoForm");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nome = document.getElementById("nomeProjeto").value.trim();
      const descricao = document.getElementById("descricaoProjeto").value.trim();

      // --- Verificação de consistência ---
      const erros = [];

      if (!nome) {
        erros.push("O nome do projeto é obrigatório.");
      } else if (nome.length < 3) {
        erros.push("O nome do projeto deve ter pelo menos 3 caracteres.");
      }

      if (!descricao) {
        erros.push("A descrição do projeto é obrigatória.");
      } else if (descricao.length < 10) {
        erros.push("A descrição deve ter pelo menos 10 caracteres.");
      }

      // --- Exibir mensagens de erro ---
      const avisoAnterior = document.getElementById("avisoErro");
      if (avisoAnterior) avisoAnterior.remove();

      if (erros.length > 0) {
        const aviso = document.createElement("div");
        aviso.id = "avisoErro";
        aviso.style.color = "red";
        aviso.style.marginTop = "10px";
        aviso.style.fontWeight = "bold";
        aviso.innerHTML = erros.join("<br>");
        form.appendChild(aviso);
        return;
      }

      // --- Se estiver tudo certo, cria um novo "template" de projeto ---
      const template = `
        <section>
          <h2>${nome}</h2>
          <p>${descricao}</p>
        </section>
      `;

      document.querySelector(".projetos-grid").insertAdjacentHTML("beforeend", template);

      // Limpa o formulário e mostra mensagem de sucesso
      form.reset();

      const avisoSucesso = document.createElement("div");
      avisoSucesso.style.color = "green";
      avisoSucesso.style.marginTop = "10px";
      avisoSucesso.style.fontWeight = "bold";
      avisoSucesso.textContent = "Sugestão enviada com sucesso!";
      form.appendChild(avisoSucesso);

      // Remove a mensagem após alguns segundos
      setTimeout(() => avisoSucesso.remove(), 4000);
    });
  }
});
