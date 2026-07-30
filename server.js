const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/download', (req, res) => {
    const videoURL = req.query.url;

    if (!videoURL) {
        return res.status(400).send('Link inválido.');
    }

    try {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');

        // Usa o yt-dlp instalado no sistema para extrair e converter o áudio diretamente
        const ytdlp = spawn('yt-dlp', [
            '-x', '--audio-format', 'mp3',
            '-o', '-',
            videoURL
        ]);

        ytdlp.stdout.pipe(res);

        ytdlp.stderr.on('data', (data) => {
            // Logs de progresso internos se necessário
        });

        ytdlp.on('close', (code) => {
            if (code !== 0 && !res.headersSent) {
                res.status(500).send('Erro ao converter o áudio.');
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
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});