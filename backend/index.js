const ngrok = require('ngrok');
const app = require('./app');

const port = 3000;

app.listen(port, async () => {
    console.log(`App listening on port ${port}!`);

    try {
        await ngrok.authtoken("33GJu3f7nPjGZmLCXyfEVoSjx69_2YnV768p9yvormWBVSWBF");
        // Create the tunnel to your server's port
        const url = await ngrok.connect(port).url;
        console.log('Ngrok tunnel established at:', url);
    } catch (error) {
        console.error('Error establishing ngrok tunnel:', error);
    }
});