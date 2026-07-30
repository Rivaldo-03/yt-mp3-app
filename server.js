const express = require('express');
const cors = require('cors');
const YTDlpWrap = require('yt-dlp-wrap').default;
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Define o caminho do binário do yt-dlp dependendo se está na nuvem ou PC
const binPath = path.join(__dirname, 'yt-dlp');
let ytDlp;

(async () => {
    try {
        if (!fs.existsSync(binPath)) {
            console.log('Baixando o binário do yt-dlp para o servidor...');
            await YTDlpWrap.downloadFromGithub(binPath);
            if (process.platform !== 'win32') {
                fs.chmodSync(binPath, '755');
            }
        }
        ytDlp = new YTDlpWrap(binPath);
        console.log('yt-dlp pronto para uso!');
    } catch (error) {
        console.error('Erro ao configurar yt-dlp:', error);
    }
})();

app.get('/download', async (req, res) => {
    const videoURL = req.query.url;

    if (!videoURL) {
        return res.status(400).send('Link inválido.');
    }

    try {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');

        if (!ytDlp) {
            return res.status(500).send('Servidor ainda inicializando o conversor, tente novamente em alguns segundos.');
        }

        const ytDlpStream = ytDlp.execStream([
            '-x', '--audio-format', 'mp3',
            '-o', '-',
            videoURL
        ]);

        ytDlpStream.pipe(res);

        ytDlpStream.on('error', (err) => {
            console.error('Erro no stream:', err);
            if (!res.headersSent) {
                res.status(500).send('Erro ao processar o áudio.');
            }
        });

    } catch (error) {
        console.error('Erro:', error);
        if (!res.headersSent) {
            res.status(500).send('Erro interno no servidor.');
        }
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});