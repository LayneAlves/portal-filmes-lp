// CONFIGURAÇÃO DA API (TMDb - The Movie Database)

const IMG_BASE = "https://image.tmdb.org/t/p/w200"; 
const PAIS = "BR"; 


// LISTA DE FILMES DA SEÇÃO "ONDE ENCONTRAR"

const filmes = [
    {
        id: 283366,
        titulo: "AS CRIANÇAS PECULIARES",
        categoria: "fantasia",
        poster: "public/images/criancas_peculiares.png"
    },
    {
        id: 9479,
        titulo: "O FANTÁSTICO MUNDO DE JACK",
        categoria: "fantasia",
        poster: "public/images/jack_esqueleto.png"
    },
    {
        id: 102651,
        titulo: "MALEVOLA",
        categoria: "desenhos",
        poster: "public/images/malevola.jpg"
    },
    {
        id: 10439,
        titulo: "ABRACADABRA",
        categoria: "fantasia",
        poster: "public/images/abracadabra.jpg"
    },
    {
        id: 68728,
        titulo: "O MÁGICO DE OZ",
        categoria: "fantasia",
        poster: "public/images/magicoOZ.jpg"
    },
    {
        id: 426543,
        titulo: "O QUEBRA-NOZES",
        categoria: "reinos",
        poster: "public/images/quebraNozes.jpg"
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

function destacarElemento(elemento) {
    if (!elemento) return;

    elemento.scrollIntoView({ behavior: "smooth", block: "center" });

    // espera o scroll suave terminar antes de pulsar
    setTimeout(() => {
        elemento.classList.add("destaque-filme");
        elemento.addEventListener(
            "animationend",
            () => elemento.classList.remove("destaque-filme"),
            { once: true }
        );
    }, 700);
}

// Cada categoria "aponta" pra um elemento específico da página
const alvoPorCategoria = {
    desenhos: () => document.getElementById("capa-noiva"),
    reinos: () => document.querySelector(".narnia-section"),
    fantasia: () => document.getElementById("capa-fabrica"),
};


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

            const obterAlvo = alvoPorCategoria[categoria];
            if (obterAlvo) destacarElemento(obterAlvo());
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


// INICIALIZAÇÃO

document.addEventListener("DOMContentLoaded", () => {
    ativarPopUp();
    ativarRedirecionamentoFilmes();
    renderizarFilmes().then(ativarFiltros);
});