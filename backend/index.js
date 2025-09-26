const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv')
const express = require('express');
const fs = require('fs');
const https = require('https');

const { Sleep } = require('./sleep')

const privateKey = fs.readFileSync('localhost-key.pem', 'utf8');
const certificate = fs.readFileSync('localhost.pem', 'utf8');

const passphrase = '';
const credentials = { key: privateKey, passphrase, cert: certificate };

const app = express();

const httpsServer = https.createServer(credentials, app)

const port = 3000;

app.use(cors())

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log('Time:', Date.now(), '\n\t', req.body);
    next();
});

app.get('/', (req, res) => {
    console.log('GET home');
    res.status(200).json({ message: "Get /home" });
})

app.get('/analyze', (req, res) => {
    console.log('GET analyze');
    res.status(200).json({ message: "Get /analyze" });
})

app.post('/analyze', (req, res) => {
    if (!Array.isArray(req.body.samples))
        return res.status(400).json({ error: 'Request body must be array!' });

    const processedSamples = req.body.samples.map((sample, index) => ({
        id: index,
        timestamp: parseInt(sample.timestamp),
        rms: parseFloat(sample.rms),
    }));

    const sleep = new Sleep(processedSamples);
    const duration = sleep.getDuration();
    const efficiency = sleep.getEfficiency();
    const quality = sleep.getQuality();

    res.status(200).json({
        duration: duration,
        efficiency: efficiency,
        quality: quality,
    });
})

httpsServer.listen(port, () => {
    console.log(`Server is running on ${port}`);
    dotenv.config({ path: '../.env' })
})

// app.listen(port, '0.0.0.0', () => {
// });