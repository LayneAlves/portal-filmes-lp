// CONFIGURAÇÃO DA API (TMDb - The Movie Database)

const IMG_BASE = "https://image.tmdb.org/t/p/w200";
const PAIS = "BR";


// LISTA DE FILMES DA SEÇÃO "ONDE ENCONTRAR"

const filmes = [
    // DESENHOS
    {
        id: 9479,
        titulo: "O FANTÁSTICO MUNDO DE JACK",
        categoria: "desenhos",
        poster: "public/images/jack_esqueleto.png"
    },
    {
        id: 3933,
        titulo: "A NOIVA CADÁVER",
        categoria: "desenhos",
        poster: "public/images/capa_noiva.jpg"
    },
    {
        id: 62214,
        titulo: "FRANKENWEENIE",
        categoria: "desenhos",
        poster: "public/images/frankenweenie.desenho.jpg"
    },
    {
        id: 14836,
        titulo: "CORALINE E O MUNDO SECRETO",
        categoria: "desenhos",
        poster: "public/images/coraline.desenho.jpg"
    },
    {
        id: 9297,
        titulo: "CASA MONSTRO",
        categoria: "desenhos",
        poster: "public/images/casaMonstro.jpg"
    },
    {
        id: 481084,
        titulo: "A FAMÍLIA ADDAMS",
        categoria: "desenhos",
        poster: "public/images/familiaAddamns.jpg"
    },

    // REINOS
    {
        id: 9992,
        titulo: "ARTHUR E OS MINIMOYS",
        categoria: "reinos",
        poster: "public/images/arthur.jpg"
    },
    {
        id: 224141,
        titulo: "CAMINHOS DA FLORESTA",
        categoria: "reinos",
        poster: "public/images/florestaEncantada.jpg"
    },
    {
        id: 1265,
        titulo: "PONTE PARA TERABÍTIA",
        categoria: "reinos",
        poster: "public/images/capa_terabitia.jpg"
    },
    {
        id: 321612,
        titulo: "A BELA E A FERA",
        categoria: "reinos",
        poster: "public/images/belaFera.jpg"
    },
    {
        id: 122917,
        titulo: "O HOBBIT: A BATALHA DOS CINCO EXÉRCITOS",
        categoria: "reinos",
        poster: "public/images/hobbit.jpg"
    },
    {
        id: 426543,
        titulo: "O QUEBRA-NOZES",
        categoria: "reinos",
        poster: "public/images/quebraNozes.jpg"
    },

    // FANTASIA
    {
        id: 283366,
        titulo: "AS CRIANÇAS PECULIARES",
        categoria: "fantasia",
        poster: "public/images/criancas_peculiares.png"
    },
    {
        id: 10439,
        titulo: "ABRACADABRA",
        categoria: "fantasia",
        poster: "public/images/abracadabra.jpg"
    },
    {
        id: 8204,
        titulo: "AS CRÔNICAS DE SPIDERWICK",
        categoria: "fantasia",
        poster: "public/images/spiderwick.mobile.jpg"
    },
    {
        id: 62213,
        titulo: "SOMBRAS DA NOITE",
        categoria: "fantasia",
        poster: "public/images/sombrasNoite.jpg"
    },
    {
        id: 11283,
        titulo: "NANNY MCPHEE: A BABÁ ENCANTADA",
        categoria: "fantasia",
        poster: "public/images/baba.jpg"
    },
    {
        id: 102651,
        titulo: "MALEVOLA",
        categoria: "fantasia",
        poster: "public/images/malevola.jpg"
    }
];


async function irParaPlataforma(tmdbId) {
    if (!tmdbId || tmdbId === "0") {
        console.warn("Este elemento ainda não tem um TMDb ID configurado.");
        return;
    }

    try {
        const res = await fetch(`/api/watch-providers/${tmdbId}`);
        if (!res.ok) throw new Error(`Erro na API: ${res.status}`);

        const data = await res.json();
        const linkBR = data.results?.[PAIS]?.link;

        if (linkBR) {
            window.open(linkBR, "_blank", "noopener");
        } else {
            alert("Não encontramos onde assistir esse filme no Brasil no momento.");
        }
    } catch (erro) {
        console.error(`Erro ao buscar link de streaming do filme ${tmdbId}:`, erro);
        alert("Não foi possível abrir a plataforma agora. Tente novamente.");
    }
}

function ativarRedirecionamentoFilmes() {
    document.querySelectorAll("[data-tmdb-id]").forEach(elemento => {
        elemento.addEventListener("click", () => {
            irParaPlataforma(elemento.dataset.tmdbId);
        });
    });
}


// BUSCA AS PLATAFORMAS DE STREAMING DE UM FILME

async function buscarProvedores(tmdbId) {
    if (!tmdbId) return { provedores: [], link: null };

    try {
        const res = await fetch(`/api/watch-providers/${tmdbId}`);

        if (!res.ok) throw new Error(`Erro na API: ${res.status}`);

        const data = await res.json();
        return {
            provedores: data.results?.[PAIS]?.flatrate || [],
            link: data.results?.[PAIS]?.link || null
        };
    } catch (erro) {
        console.error(`Erro ao buscar provedores do filme ${tmdbId}:`, erro);
        return { provedores: [], link: null };
    }
}


// MONTA O HTML DE UM CARD

function criarCardHTML(filme, provedores, link) {
    const icones = provedores
        .map(p => {
            const img = `<img src="${IMG_BASE}${p.logo_path}" alt="${p.provider_name}" title="Assistir na ${p.provider_name}">`;
            return link
                ? `<a href="${link}" target="_blank" rel="noopener">${img}</a>`
                : img;
        })
        .join("");

    return `
        <div class="card" data-categoria="${filme.categoria}">
            <div class="frente">
                <img src="${filme.poster}" alt="${filme.titulo}">
                <h3>${filme.titulo}</h3>
            </div>
            <div class="verso">
                <p>DISPONÍVEL EM :</p>
                <section class="icones">
                    ${icones || "<p>Sem streaming disponível</p>"}
                </section>
            </div>
        </div>
    `;
}


// BUSCA TODOS OS FILMES E RENDERIZA A GRADE

async function renderizarFilmes() {
    const container = document.getElementById("grade-filmes");
    if (!container) return;

    const cardsHTML = await Promise.all(
        filmes.map(async filme => {
            const { provedores, link } = await buscarProvedores(filme.id);
            return criarCardHTML(filme, provedores, link);
        })
    );

    container.innerHTML = cardsHTML.join("");
}


// SCROLL SUAVE + DESTAQUE (PULSO) NUM ELEMENTO

// function destacarElemento(elemento) {
//     if (!elemento) return;

//     elemento.scrollIntoView({ behavior: "smooth", block: "center" });

//     // espera o scroll suave terminar antes de pulsar
//     setTimeout(() => {
//         elemento.classList.add("destaque-filme");
//         elemento.addEventListener(
//             "animationend",
//             () => elemento.classList.remove("destaque-filme"),
//             { once: true }
//         );
//     }, 700);
// }

// Cada categoria "aponta" pra um elemento específico da página
// const alvoPorCategoria = {
//     desenhos: () => document.getElementById("capa-noiva"),
//     reinos: () => document.querySelector(".narnia-section"),
//     fantasia: () => document.getElementById("capa-fabrica"),
// };


// FILTRO POR CATEGORIA (botões TODOS/DESENHOS/REINOS/FANTASIA)

function ativarFiltros() {
    const botoes = document.querySelectorAll(".filtro");
    const container = document.getElementById("grade-filmes");

    botoes.forEach(botao => {
        botao.addEventListener("click", () => {
            botoes.forEach(b => b.classList.remove("ativo"));
            botao.classList.add("ativo");

            const categoria = botao.dataset.categoria;
            const cards = container.querySelectorAll(".card");

            cards.forEach(card => {
                const mostrar = categoria === "todos" || card.dataset.categoria === categoria;
                card.style.display = mostrar ? "" : "none";
            });

            // const obterAlvo = alvoPorCategoria[categoria];
            // if (obterAlvo) destacarElemento(obterAlvo());
        });
    });
}


// POP-UP DE AVISO INICIAL

function ativarPopUp() {
    const popUp = document.getElementById("popUpOverlay");
    const botaoFechar = document.getElementById("fecharPopUp");

    if (botaoFechar && popUp) {
        botaoFechar.addEventListener("click", () => {
            popUp.classList.add("escondido");
        });
    }
}


async function buscarDetalhesFilme(tmdbId) {
    try {
        const res = await fetch(`/api/movie-details/${tmdbId}`);
        if (!res.ok) throw new Error(`Erro na API: ${res.status}`);
        return await res.json();
    } catch (erro) {
        console.error(`Erro ao buscar detalhes do filme ${tmdbId}:`, erro);
        return null;
    }
}

async function abrirModalFilme(tmdbId) {
    const overlay = document.getElementById("modalFilmeOverlay");
    const poster = document.getElementById("modalFilmePoster");
    const titulo = document.getElementById("modalFilmeTitulo");
    const sinopse = document.getElementById("modalFilmeSinopse");
    const icones = document.getElementById("modalFilmeIcones");

    // Reseta o conteúdo e já abre o modal (feedback imediato pro usuário)
    poster.src = "";
    titulo.textContent = "";
    sinopse.textContent = "Carregando sinopse...";
    icones.innerHTML = "";
    overlay.classList.add("aberto");
    document.body.classList.add("modalFilme-travado");

    const [detalhes, { provedores, link }] = await Promise.all([
        buscarDetalhesFilme(tmdbId),
        buscarProvedores(tmdbId)
    ]);

    if (detalhes) {
        poster.src = detalhes.poster_path
            ? `https://image.tmdb.org/t/p/w500${detalhes.poster_path}`
            : "";
        poster.alt = detalhes.title || "";
        titulo.textContent = detalhes.title || "";
        sinopse.textContent = detalhes.overview || "Sinopse não disponível.";
    } else {
        sinopse.textContent = "Não foi possível carregar os detalhes desse filme agora.";
    }

    icones.innerHTML = provedores
        .map(p => {
            const img = `<img src="${IMG_BASE}${p.logo_path}" alt="${p.provider_name}" title="Assistir na ${p.provider_name}">`;
            return link
                ? `<a href="${link}" target="_blank" rel="noopener">${img}</a>`
                : img;
        })
        .join("") || "<p>Sem streaming disponível</p>";
}

function fecharModalFilme() {
    document.getElementById("modalFilmeOverlay").classList.remove("aberto");
    document.body.classList.remove("modalFilme-travado");
}

function ativarModalFilmes() {
    document.querySelectorAll("[data-modal-id]").forEach(elemento => {
        elemento.addEventListener("click", () => {
            abrirModalFilme(elemento.dataset.modalId);
        });
    });

    document.getElementById("modalFilmeFechar").addEventListener("click", fecharModalFilme);
    document.getElementById("modalFilmeOverlay").addEventListener("click", (e) => {
        if (e.target.id === "modalFilmeOverlay") fecharModalFilme();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") fecharModalFilme();
    });
}
// ROLAGEM AUTOMÁTICA E 6 BOLINHAS POR BLOCOS (ENTRE MUNDOS - TABLET)

function ativarCarrosselEntreMundos() {
    const container = document.querySelector('.entre-mundos .cards-container');
    if (!container) return;

    // Cria ou reutiliza o container das bolinhas
    let indicadores = container.parentNode.querySelector('.entre-mundos-indicadores');
    if (!indicadores) {
        indicadores = document.createElement('div');
        indicadores.className = 'entre-mundos-indicadores';
        container.parentNode.appendChild(indicadores);
    }
    indicadores.innerHTML = '';

    const totalBolinhas = 6;
    let currentIndex = 0;

    // Cria as bolinhas e já adiciona o evento de clique
    const dots = Array.from({ length: totalBolinhas }, (_, i) => {
        const dot = document.createElement('span');
        if (i === 0) dot.classList.add('ativo');
        
        dot.addEventListener('click', () => irParaBloco(i));
        indicadores.appendChild(dot);
        return dot;
    });

    function irParaBloco(index) {
        currentIndex = index;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        if (maxScroll > 0) {
            container.scrollTo({
                left: (maxScroll / (totalBolinhas - 1)) * currentIndex,
                behavior: 'smooth'
            });
        }

        dots.forEach((dot, i) => dot.classList.toggle('ativo', i === currentIndex));
    }

    // Rolagem automática a cada 3 segundos (apenas em tablets)
    setInterval(() => {
        if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
            irParaBloco((currentIndex + 1) % totalBolinhas);
        }
    }, 3000);
}

// INICIALIZAÇÃO

document.addEventListener("DOMContentLoaded", () => {
    ativarPopUp();
    ativarRedirecionamentoFilmes();
    ativarModalFilmes();
    ativarCarrosselEntreMundos();
    renderizarFilmes().then(ativarFiltros);
});