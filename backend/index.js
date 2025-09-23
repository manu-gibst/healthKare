const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 8080;

app.use(cors())
app.use(bodyParser.json({ extended: true }))

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/analyse', (req, res) => {
    const accels = req.body;

    if (!Array.isArray(accels))
        return res.status(400).json({ error: 'Request body must be array!' });

    for (let accel of accels) {
        let missing = '';
        if (accel.timestamp === undefined) missing += 'timestamp';
        if (accel.x === undefined) missing += 'x';
        if (accel.y === undefined) missing += 'y';
        if (accel.z === undefined) missing += 'z';

        if (missing !== '') {
            return res.status(400).json(
                { error: `Following request body parameters are missing in the array: ${missing}` }
            );
        }
    }

    console.log(`Array is accepted: ${accel}`);
    res.status(200).json({
        message: 'Array accepted',
    })
})

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on ${port}`);
});