if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const bodyParser = require('body-parser');
const GNRequest = require('./apis/gerencianet');


const app = express();

app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', 'src/views');

const reqGNAlready = GNRequest({
    clientID: process.env.GN_CLIENT_ID,
    clientSecret: process.env.GN_CLIENT_SECRET
});

app.get('/', async (req, res) => {
    const reqGN = await reqGNAlready;
    const dataCob = {
        calendario: {
            expiracao: 3600
        },

        valor: {
            original: '0.10'
        },
        chave: '585f3855-d7f8-455e-b3c2-8aabdefd5fb6',
        solicitacaoPagador: 'Primeiro teste cobrança Pix. '
    };

    const cobResponse = await reqGN.post('/v2/cob', dataCob);
    const qrcodeResponse = await reqGN.get(`/v2/loc/${cobResponse.data.loc.id}/qrcode`);

    //res.render('qrcode.ejs', { qrcodeImage: qrcodeResponse.data.imagemQrcode });
    res.render('qrcode.ejs', {
        qrcodeImage: qrcodeResponse.data.imagemQrcode,
        qrcode: qrcodeResponse.data.qrcode
    });
});

app.get('/cobrancas', async (req, res) => {
    const reqGN = await reqGNAlready;

    const cobResponse = await reqGN.get('/v2/cob?inicio=2023-08-01T16:01:35Z&fim=2023-08-17T20:10:00Z');

    res.send(cobResponse.data);
});

app.get('/pixrecebidos', async (req, res) => {
    const reqGN = await reqGNAlready;

    const pixRecebidos = await reqGN.get('/v2/pix?inicio=2023-08-01T00:00:00Z&fim=2023-08-17T23:59:59Z');

    res.send(pixRecebidos.data);
});

app.post('/webhook(/pix)?', (req, res) => {
    console.log(req.body);
    res.send('200');
})

app.listen(8000, () => {
    console.log('running');
});