const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app); 
const WebSocket = require('ws');
const fun = require("./js/funciones");

let players = [];
let anfitrion;
let destino;
let turno = 0;

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

    ws.on('message', (data) => {

        if (data.indexOf(" ")==-1){
            
            console.log(1);
            if(data=="anfitrion"){

                console.log(2);
                anfitrion = ws;
                fetch('https://pow-3bae6d63ret5.deno.dev/word')
                    .then(res => res.json())
                    .then(json => {

                        anfitrion.send(fun.noAcento(json.word));
                });
            }
            else if(data=="1"){

                fetch('https://pow-3bae6d63ret5.deno.dev/word')
                    .then(res => res.json())
                    .then(json => {
                        
                        anfitrion.send(fun.noAcento(json.word));
                });
            }
            else if (players[0]==null){
                console.log(3);
                let player = {
    
                    username : data,
                    dir : ws
                }
                players.push(player);
            }
            else if (!fun.existe(players,String(data))){
                console.log(4);
                let player = {
    
                    username : String(data),
                    dir : ws
                }
                players.push(player);
            }
            else{
                console.log(5);
                ws.send("1");
            }   
        }
        else if ((data+"")[0]=="2"){
                
            for(i=0; i<players.length; i++){

                players[i].dir.send("2 "+data.slice(2));
            }
            players[turno].dir.send("3");
            for(i=0; i<players.length; i++){

                if (i!=turno) players[i].dir.send("4 "+players[turno].username);
            }
        }
        else if(data.indexOf(" ",2)==-1){

            console.log("6");
            anfitrion.send(data+"");
            if(turno!=players.length-1) turno++;
            else turno = 0;
            console.log("turno: "+turno);
        }
        else if(data.indexOf(" ",2)!=-1){

            console.log("player="+fun.buscar(players, fun.name(data)));
            destino = players[fun.buscar(players, fun.name(data))].dir;
            destino.send(data+"");
            players[turno].dir.send("3");
            for(i=0; i<players.length; i++){

                if (i!=turno) players[i].dir.send("4 "+players[turno].username);
            }
        }
    })
})

app.listen(3000);

server.listen(app.get('puerto'), () => {

    console.log('Servidor WebSocket iniciado en el puerto: '+ app.get('puerto'));
})