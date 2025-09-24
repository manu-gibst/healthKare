const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 8080;

app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log('Time:', Date.now(), '\n\t', req.body);
    next();
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/analyze', (req, res) => {
    res.json({ message: "hi" });
})

app.post('/analyze', (req, res) => {
    const body = req.body;
    const samples = body.samples.split(',').map(Number)

    if (!Array.isArray(samples))
        return res.status(400).json({ error: 'Request body must be array!' });

    const sum = samples.reduce((acc, sample) => acc + sample);
    console.log("sum:", sum);

    console.log(`Array is accepted: ${samples}`);
    res.status(200).json({
        message: 'Array accepted',
    });
})

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on ${port}`);
});