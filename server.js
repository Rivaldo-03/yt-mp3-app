const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/download', async (req, res) => {
    const videoURL = req.query.url;

    if (!videoURL || !ytdl.validateURL(videoURL)) {
        return res.status(400).send('Link inválido.');
    }

    try {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');

        const stream = ytdl(videoURL, {
            quality: 'highestaudio',
            filter: 'audioonly'
        });

        stream.pipe(res);

        stream.on('error', (err) => {
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