const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app); 
const WebSocket = require('ws');
const fun = require("./js/funciones");

let players = [];

app.set('puerto', 1234);

app.use(express.json());
app.use(express.static(path.join(__dirname, './plublic/')));

const wss = new WebSocket.Server({server:server});

app.get('/', (req,res) => {

    res.sendFile('./public/index.html', {

        root: __dirname
    })
})

app.get('/jugador', (req,res) => {

    res.sendFile('./public/jugador.html', {

        root: __dirname
    })
})

app.get('/anfitrion', (req,res) => {

    res.sendFile('./public/anfitrion.html', {

        root: __dirname
    })
})

wss.on('connection', (ws) => {

    console.log('Conexion nueva');
    ws.send('Hola mi pana');

    ws.on('message', (data) => {

        if (data.length>1){

            if (players[0]==null){

                let player = {
    
                    username : data,
                    dir : ws
                }
                players.push(player);
            }
            else if (!fun.existe(players,String(data))){
    
                let player = {
    
                    username : String(data),
                    dir : ws
                }
        
                players.push(player);
                console.log('entre aqui');
            }
            else{

                ws.send('1');
            }   
        }

    })
})

app.listen(3000);

server.listen(app.get('puerto'), () => {

    console.log('Servidor iniciado en el puerto: '+ app.get('puerto'));
})