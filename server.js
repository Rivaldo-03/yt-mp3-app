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
        return res.status(400).send('Link de vídeo inválido.');
    }

    try {
        const info = await ytdl.getInfo(videoURL);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '').trim() || 'audio';

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);

        const stream = ytdl(videoURL, {
            quality: 'highestaudio',
            filter: 'audioonly',
            highWaterMark: 1 << 25
        });

        stream.pipe(res);

        stream.on('error', (err) => {
            console.error('Erro no fluxo de áudio:', err);
            if (!res.headersSent) {
                res.status(500).send('Erro ao transmitir o áudio.');
            }
        });

    } catch (error) {
        console.error('Erro interno:', error);
        if (!res.headersSent) {
            res.status(500).send('Erro ao processar o vídeo no servidor.');
        }
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});