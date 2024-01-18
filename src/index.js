const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app); 
const WebSocket = require('ws');

app.set('puerto', 1234);

app.use(express.json());
app.use(express.static(path.join(__dirname, './plublic/')));

const wss = new WebSocket.Server({server:server});

app.get('/', (req,res) => {

    res.sendFile('./public/index.html', {

        root: __dirname
    })
})

wss.on('connection', (ws) => {

    console.log('Conexion nueva');
    ws.send('Hola mi pana');

    ws.on('message', (data) => {

        console.log(`Mensaje recibido: `+ data);
    })
})

app.listen(3000);

server.listen(app.get('puerto'), () => {

    console.log('Servidor iniciado en el puerto: '+ app.get('puerto'));
})

console.log()