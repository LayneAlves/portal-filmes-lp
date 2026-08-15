require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
    console.warn('⚠️  TMDB_API_KEY não definida. Configure a variável de ambiente antes de usar a API.');
}


// PROXY: esconde a chave do TMDb do navegador
// O front-end chama /api/watch-providers/:movieId,
// e é AQUI que a chave real é usada, no servidor.

app.get('/api/watch-providers/:movieId', async (req, res) => {
    const { movieId } = req.params;

    if (!movieId || isNaN(Number(movieId))) {
        return res.status(400).json({ error: 'ID de filme inválido' });
    }

    try {
        const url = `${TMDB_BASE}/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Erro ao consultar o TMDb' });
        }

        const data = await response.json();
        res.json(data);
    } catch (erro) {
        console.error('Erro no proxy TMDb:', erro);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
app.get('/api/movie-details/:id', async (req, res) => {
    const { id } = req.params;
    const apiKey = process.env.TMDB_API_KEY;

    try {
        const resposta = await fetch(
            `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=pt-BR`
        );
        if (!resposta.ok) throw new Error(`Erro na API: ${resposta.status}`);
        const dados = await resposta.json();
        res.json(dados);
    } catch (erro) {
        console.error('Erro ao buscar detalhes do filme:', erro);
        res.status(500).json({ erro: 'Não foi possível buscar os detalhes do filme.' });
    }
});

// Serve os arquivos estáticos do site
// (index.html, css/, js/, public/images/...)

app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
