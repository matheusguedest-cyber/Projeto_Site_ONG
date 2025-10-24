/* ================================================================
   script.js
   - SPA básico (fetch + pushState)
   - Template system para projetos
   - Manipulação do DOM (toasts, modals, carrossel)
   - Validação de formulário
   ================================================================ */

/* --------------------------
   CONFIGURAÇÕES E DADOS
   -------------------------- */
// Dados dos projetos (exemplo). Você pode alterar, adicionar campos etc.
const PROJECTS_DATA = [
  {
    id: "p1",
    title: "Reforço Escolar “Raízes do Saber”",
    summary: "Oferece aulas de reforço em matemática, português e ciências.",
    details: `<p><strong>Objetivo:</strong> Apoiar crianças e adolescentes com dificuldades de aprendizagem, oferecendo aulas de reforço em matemática, português e ciências.</p>
              <p><strong>Atividades principais:</strong></p>
              <ul>
                <li>Aulas em pequenos grupos, com voluntários e professores parceiros;</li>
                <li>Oficinas de leitura e escrita;</li>
                <li>Espaço para estudo acompanhado.</li>
              </ul>
              <p><strong>Impacto:</strong> Mais de 200 crianças atendidas anualmente, com melhoria significativa no desempenho escolar.</p>`
  },
  {
    id: "p2",
    title: "Arte & Movimento",
    summary: "Promove a cultura e o esporte como ferramentas de inclusão social.",
    details: `<p><strong>Objetivo:</strong> Promover a cultura e o esporte como ferramentas de inclusão social e desenvolvimento humano.</p>
              <p><strong>Atividades principais:</strong></p>
              <ul>
                <li>Oficinas de teatro, música e artes plásticas;</li>
                <li>Aulas de esportes coletivos (futebol, vôlei, capoeira);</li>
                <li>Apresentações culturais abertas à comunidade.</li>
              </ul>
              <p><strong>Impacto:</strong> Estimular a autoestima, disciplina e convivência social saudável dos jovens atendidos.</p>`
  },
  {
    id: "p3",
    title: "Família Presente",
    summary: "Fortalece o vínculo entre jovens e suas famílias, oferecendo apoio psicossocial e orientação.",
    details: `<p><strong>Objetivo:</strong> Fortalecer o vínculo entre jovens e suas famílias, oferecendo apoio psicossocial e orientação.</p>
              <p><strong>Atividades principais:</strong></p>
              <ul>
                <li>Roda de conversa para pais e responsáveis;</li>
                <li>Atendimento com psicólogos e assistentes sociais voluntários;</li>
                <li>Campanhas de doação de cestas básicas e kits de higiene.</li>
              </ul>
              <p><strong>Impacto:</strong> Construir lares mais estáveis e fortalecer a rede de apoio das crianças e adolescentes participantes.</p>`
  },
  {
    id: "p4",
    title: "Doações",
    summary: "Como apoiar financeiramente e com materiais.",
    details: `<p>Sua doação ajuda a manter nossos projetos ativos, garantindo materiais, alimentação e transporte para as crianças atendidas. Aceitamos doações financeiras e de materiais — toda ajuda é bem-vinda!</p>
              <p><strong>Chave PIX:</strong> sementesdoamanha@gmail.com</p>`
  }
];

/* Carrossel (apenas caminhos - 3x mesma imagem conforme pedido) */
const CAROUSEL_IMAGES = [
  "Imagens/New_Logo_Sementes_menor.png",
  "Imagens/New_Logo_Sementes_menor.png",
  "Imagens/New_Logo_Sementes_menor.png"
];

/* --------------------------
   UTILITÁRIOS (TOASTS, HELPERS)
   -------------------------- */

/**
 * Cria e exibe uma pequena notificação (toast) no canto inferior-esquerdo.
 * @param {string} message
 * @param {number} duration ms
 */
function showToast(message, duration = 3000) {
  // cria elemento
  const t = document.createElement("div");
  t.className = "sd-toast"; // estilo no CSS (crie se quiser)
  t.innerText = message;
  // estilo inline mínimo para garantir visibilidade se não tiver CSS
  Object.assign(t.style, {
    position: "fixed",
    left: "16px",
    bottom: "16px",
    background: "#2e7d32",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "6px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    zIndex: 9999,
    fontSize: "0.95rem"
  });
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity = "0";
    setTimeout(() => t.remove(), 300);
  }, duration);
}

/* --------------------------
   SPA (Fetch + pushState)
   -------------------------- */

/**
 * Carrega via fetch o arquivo html indicado por url e injeta o <main> encontrado.
 * Mantém os scripts já rodando (rebind necessário).
 */
async function loadPageIntoMain(url, addToHistory = true) {
  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error("Falha ao carregar a página: " + res.status);
    const text = await res.text();

    // Parsear HTML recebido e extrair conteúdo do <main>
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    const newMain = doc.querySelector("main");

    if (!newMain) {
      console.warn("Arquivo carregado não contém <main>. Injetando o body completo.");
      document.querySelector("main").innerHTML = doc.body.innerHTML;
    } else {
      document.querySelector("main").innerHTML = newMain.innerHTML;
    }

    // Atualizar título do documento, se existir
    const newTitle = doc.querySelector("title");
    if (newTitle) document.title = newTitle.innerText;

    // Rebind: reaplicar funcionalidades que dependem do DOM (templates, listeners)
    afterContentLoad();

    // Atualiza histórico do navegador
    if (addToHistory) history.pushState({ url }, "", url);
  } catch (err) {
    console.error(err);
    showToast("Erro ao carregar a página. Verifique o servidor.", 4000);
  }
}

/* Lida com volta/adianto do histórico */
window.addEventListener("popstate", (evt) => {
  const state = evt.state;
  if (state && state.url) {
    loadPageIntoMain(state.url, false);
  } else {
    // fallback: recarrega a página atual
    loadPageIntoMain(location.pathname, false);
  }
});

/* Intercepta cliques nos links do menu (links que apontam para .html) */
function bindNavLinksAsSPA() {
  document.querySelectorAll("a[href$='.html']").forEach(a => {
    // evitar múltiplos bind
    a.removeEventListener("click", spaLinkHandler);
    a.addEventListener("click", spaLinkHandler);
  });
}
function spaLinkHandler(e) {
  // permite abrir em nova aba com Ctrl/Meta/Shift ou botão direito
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  const href = this.getAttribute("href");
  if (href) loadPageIntoMain(href);
}

/* --------------------------
   SISTEMA DE TEMPLATES (Projects)
   -------------------------- */

/**
 * Retorna o HTML de um card do projeto a partir de dados.
 * Usa template literals para formar o markup.
 * @param {Object} project
 * @returns {string} html
 */
function projectCardTemplate(project) {
  return `
    <article class="project-card" data-project-id="${project.id}">
      <h3>${project.title}</h3>
      <p>${project.summary}</p>
      <button class="project-detail-btn" data-id="${project.id}">Saiba Mais</button>
    </article>
  `;
}

/**
 * Renderiza um array de projetos dentro do elemento com a classe .projetos
 * Se não houver elemento, tenta criar um container dentro do main.
 */
function renderProjects(projects = PROJECTS_DATA) {
  let container = document.querySelector(".projetos");
  if (!container) {
    // cria um section .projetos dentro do main caso não exista
    const main = document.querySelector("main");
    container = document.createElement("section");
    container.className = "projetos";
    main.prepend(container);
  }
  container.innerHTML = projects.map(projectCardTemplate).join("");
  // bind nos botões "Saiba Mais"
  container.querySelectorAll(".project-detail-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      openProjectModalById(id);
    });
  });
}

/* --------------------------
   MODAIS DINÂMICOS (Projetos)
   -------------------------- */

/**
 * Cria e abre modal com o conteúdo do projeto (usando dados do PROJECTS_DATA).
 * Se já existir um modal aberto, substitui o conteúdo.
 */
function openProjectModalById(id) {
  const project = PROJECTS_DATA.find(p => p.id === id);
  if (!project) {
    showToast("Projeto não encontrado", 3000);
    return;
  }

  // verifica se já tem modal no DOM
  let modal = document.getElementById("js-project-modal");
  if (!modal) {
    modal = document.createElement("aside");
    modal.id = "js-project-modal";
    modal.className = "js-modal-overlay";
    Object.assign(modal.style, {
      position: "fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
      zIndex: 9999
    }); // styling inline as fallback (CSS should ideally include .js-modal-overlay)
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="js-modal-content" style="background:#fff;padding:20px;border-radius:10px;max-width:600px;box-shadow:0 6px 20px rgba(0,0,0,0.25);">
      <h2>${project.title}</h2>
      <div class="js-modal-body">${project.details}</div>
      <div style="text-align:right;margin-top:16px;">
        <button id="js-modal-close" style="padding:8px 14px;background:#2e7d32;color:#fff;border:none;border-radius:6px;cursor:pointer;">Fechar</button>
      </div>
    </div>
  `;

  document.getElementById("js-modal-close").addEventListener("click", () => {
    modal.remove();
  });
}

/* --------------------------
   CARROSSEL (JS) — troca src do #carrossel
   -------------------------- */
function initCarousel(images = CAROUSEL_IMAGES, interval = 3000) {
  const imgEl = document.getElementById("carrossel");
  if (!imgEl) return; // nada a fazer se não houver elemento
  let idx = 0;
  // define inicialmente (se desejar)
  imgEl.src = images[0];
  setInterval(() => {
    idx = (idx + 1) % images.length;
    imgEl.src = images[idx];
  }, interval);
}

/* --------------------------
   VALIDAÇÃO DE FORMULÁRIO
   - validações simples (não substitui validação no servidor)
   -------------------------- */

/**
 * Mostra erro em elemento (cria um small.error abaixo do input)
 * @param {HTMLElement} input
 * @param {string} message
 */
function showFieldError(input, message) {
  // limpa erro antigo
  const existing = input.parentElement.querySelector(".js-field-error");
  if (existing) existing.remove();
  const small = document.createElement("small");
  small.className = "js-field-error";
  small.style.color = "#c62828";
  small.style.display = "block";
  small.style.marginTop = "6px";
  small.innerText = message;
  input.parentElement.appendChild(small);
  input.classList.add("js-invalid");
}

/**
 * Remove erro do campo
 */
function clearFieldError(input) {
  const existing = input.parentElement.querySelector(".js-field-error");
  if (existing) existing.remove();
  input.classList.remove("js-invalid");
}

/**
 * Valida campos do formulário de cadastro (nome, email, telefone, cep, cpf)
 * Retorna true se válido, false caso contrário
 */
function validateVolunteerForm(form) {
  let valid = true;

  // Helpers de regex (simples)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/; // (00) 00000-0000 or 0000-0000
  const cepRegex = /^\d{5}-?\d{3}$/;
  const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;

  // Campos (aceita IDs: nome, email, telefone, cpf, cep)
  const nome = form.querySelector("#nome");
  const email = form.querySelector("#email");
  const telefone = form.querySelector("#telefone");
  const cpf = form.querySelector("#cpf");
  const cep = form.querySelector("#cep");

  // Nome obrigatório
  if (nome) {
    if (!nome.value.trim()) {
      showFieldError(nome, "Por favor, insira seu nome completo.");
      valid = false;
    } else {
      clearFieldError(nome);
    }
  }

  // Email obrigatório + formato
  if (email) {
    if (!email.value.trim()) {
      showFieldError(email, "O e-mail é obrigatório.");
      valid = false;
    } else if (!emailRegex.test(email.value.trim())) {
      showFieldError(email, "Formato de e-mail inválido.");
      valid = false;
    } else {
      clearFieldError(email);
    }
  }

  // Telefone (opcional, mas se preenchido verifica)
  if (telefone && telefone.value.trim()) {
    if (!phoneRegex.test(telefone.value.trim())) {
      showFieldError(telefone, "Formato de telefone inválido. Ex: (11) 91234-5678");
      valid = false;
    } else {
      clearFieldError(telefone);
    }
  }

  // CPF (opcional) - apenas formato
  if (cpf && cpf.value.trim()) {
    if (!cpfRegex.test(cpf.value.trim())) {
      showFieldError(cpf, "Formato de CPF inválido. Ex: 000.000.000-00");
      valid = false;
    } else {
      clearFieldError(cpf);
    }
  }

  // CEP (opcional)
  if (cep && cep.value.trim()) {
    if (!cepRegex.test(cep.value.trim())) {
      showFieldError(cep, "Formato de CEP inválido. Ex: 00000-000");
      valid = false;
    } else {
      clearFieldError(cep);
    }
  }

  return valid;
}

/* --------------------------
   BINDINGS E INICIALIZAÇÃO
   -------------------------- */

/**
 * A função afterContentLoad() é chamada depois de qualquer injeção dinâmca de <main>
 * para reexecutar bindings (ex: templates, validação do formulário, botões, carrossel).
 */
function afterContentLoad() {
  // 1) Vincular navegação SPA aos links (novos ou existentes)
  bindNavLinksAsSPA();

  // 2) Renderizar templates de projetos (se houver placeholder .projetos)
  // Nota: se a página já tiver conteudo estático, essa função o substituirá.
  if (document.querySelector(".projetos")) {
    renderProjects(PROJECTS_DATA);
  }

  // 3) Inicializar botões de detalhe que possam existir no HTML sem template
  document.querySelectorAll("[data-project-id]").forEach(el => {
    const btn = el.querySelector(".project-detail-btn");
    if (btn) {
      btn.addEventListener("click", () => openProjectModalById(btn.dataset.id));
    }
  });

  // 4) Inicializar carrossel (se houver #carrossel)
  initCarousel();

  // 5) Vincular formulários (validação)
  const forms = document.querySelectorAll("form");
  forms.forEach(form => {
    // Remove listener anterior para evitar duplicação
    form.addEventListener("submit", function(e) {
      // Se houver id 'form-voluntario' ou inputs que indiquem cadastro, valida
      e.preventDefault();
      const ok = validateVolunteerForm(form);
      if (ok) {
        // Simulação de envio: você pode adaptar para fetch/POST para backend
        showToast("Formulário válido. Enviando...", 2500);
        // Exemplo: limpar campos
        form.reset();
      } else {
        showToast("Corrija os campos destacados e tente novamente.", 3000);
      }
    });
  });

  // 6) Fechar popups quando o usuário clicar fora (caso modais gerados com classe .popup)
  document.querySelectorAll(".popup").forEach(p => {
    p.addEventListener("click", (ev) => {
      if (ev.target === p) p.style.display = "none";
    });
  });
}

/* Inicialização no carregamento da página */
window.addEventListener("DOMContentLoaded", () => {
  // Bind inicial dos links (para tratar quando o app começa na index)
  bindNavLinksAsSPA();

  // Caso o usuário abra diretamente index.html, carregamos o conteúdo normal e rebind
  afterContentLoad();

  // Se o usuário iniciou em outra rota (.html), considerar pushState inicial
  history.replaceState({ url: location.pathname }, "", location.pathname);
});
