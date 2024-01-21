const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app); 
const WebSocket = require('ws');
const fun = require("./js/funciones");

let players = [];
let anfitrion = null;
let todosPerdieron;
let turno = 0;
let iniciado = false;

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
            
            if(data=="anfitrion"){

                if (anfitrion==null){
                    anfitrion = ws;
                    fetch('https://pow-3bae6d63ret5.deno.dev/word')
                        .then(res => res.json())
                        .then(json => {

                            anfitrion.send(fun.noAcento(json.word));
                    });
                }
                else {
                    ws.send("5");
                    ws.close();
                }
            }
            else if(data=="1"){

                fetch('https://pow-3bae6d63ret5.deno.dev/word')
                    .then(res => res.json())
                    .then(json => {
                        
                        anfitrion.send(fun.noAcento(json.word));
                });
            }
            else if(anfitrion!=null){

                ws.send("7");
            }
            else if (players[0]==null){

                if(!iniciado){
                    
                    let player = {
    
                        username : String(data),
                        dir : ws,
                        estado : 1
                        }
                    players.push(player);
                    anfitrion.send("1");
                    ws.send("0");
                }
                else{
                    
                    let player = {
    
                        username : String(data),
                        dir : ws,
                        estado : 2
                        }
                    players.push(player);
                    anfitrion.send("1");
                    ws.send("6");
                }
            }
            else if (!fun.existe(players,String(data))){

                if(!iniciado){
                    
                    let player = {
    
                        username : String(data),
                        dir : ws,
                        estado : 1
                        }
                    players.push(player);
                    anfitrion.send("1");
                    ws.send("0");
                }
                else{
                    
                    let player = {
    
                        username : String(data),
                        dir : ws,
                        estado : 2
                        }
                    players.push(player);
                    anfitrion.send("1");
                    ws.send("6");
                }
            }
            else{
   
                ws.send("1");
            }   
        }
        else if ((data+"")[0]=="2"){
                
            for(i=0; i<players.length; i++){

                players[i].dir.send("2 "+data.slice(2));
            }
            turno = fun.turnoSiguiente(players,-1);
            if (players[turno].estado==1) players[turno].dir.send("3");
            for(i=0; i<players.length; i++){

                if (i!=turno) players[i].dir.send("4 "+players[turno].username);
            }
        }
        else if ((data+"")[0]=="3"){

            for(i = 0; i<players.length; i++){

                if (players[i].dir!=ws){
    
                    players[i].dir.send("5 "+data.slice(2));
                }
            }
            anfitrion.send("3 "+data.slice(2));
            for(i=0; i<players.length; i++){

                if (players[i].estado==-1){
                    players.splice(i,1);
                    i--;
                }
            }
            for(i=0; i<players.length; i++){

                players[i].estado = 1;
            }
            total = 0;
        }
        else if ((data+"")[0]=="4"){

            for(i = 0; i<players.length; i++){

                if (players[i].dir==ws){
    
                    players[i].estado = 0;
                }
            }
            todosPerdieron = true;
            for(i = 0; i<players.length; i++){

                if (players[i].estado==1){

                    todosPerdieron = false;
                }
            }
            if(todosPerdieron){

                anfitrion.send("4");
                for(i=0; i<players.length; i++){

                    if (players[i].estado==-1){
                        players.splice(i,1);
                        i--;
                    }
                }
                for(i=0; i<players.length; i++){

                    players[i].estado = 1;
                }
                turno = 0;
            }
        }
        else if(data.indexOf(" ",2)==-1){

            anfitrion.send(data+"");
            turno = fun.turnoSiguiente(players, turno);
            iniciado = true;
        }
        else if(data.indexOf(" ",2)!=-1){

            console.log(String(fun.buscar(players, fun.name(data))), String(fun.name(data)));
            players[fun.turnoAnterior(players, turno-1)].dir.send(data+"");
            if (players[turno].estado==1) players[turno].dir.send("3");
            for(i=0; i<players.length; i++){

                if (i!=turno) players[i].dir.send("4 "+players[turno].username);
            }
        }
    })

    ws.on('close', () => {

        if(ws==anfitrion) anfitrion = null; 
        else{

            for(i = 0; i<players.length; i++){

                if (players[i].dir==ws){

                    players[i].estado = -1;
                    console.log(players[i].username,turno,1);
                    anfitrion.send("2");
                    console.log(`${players[i].username} se desconecto`);
                    if (i==turno){

                        console.log("entre");
                        turno = fun.turnoSiguiente(players, turno);
                        console.log(turno,4);
                        if (turno!=-1){
                            players[turno].dir.send("3");
                            for(i=0; i<players.length; i++){

                                if (i!=turno) players[i].dir.send("4 "+players[turno].username);
                            }
                        }
                        else{
                            todosPerdieron = true;
                            for(i = 0; i<players.length; i++){

                                if (players[i].estado==1){
                                    console.log("hola",1);
                                    todosPerdieron = false;
                                }
                            }
                            console.log(todosPerdieron,3);
                            if(todosPerdieron){

                                anfitrion.send("4");
                                for(i=0; i<players.length; i++){

                                    if (players[i].estado==-1){
                                        players.splice(i,1);
                                        i--;
                                    }
                                }
                                for(i=0; i<players.length; i++){

                                    players[i].estado = 1;
                                }
                                turno = 0;
                            }
                        }
                    }
                }
            }
        }
    })
})

app.listen(3000);

server.listen(app.get('puerto'), () => {

    console.log('Servidor WebSocket iniciado en el puerto: '+ app.get('puerto'));
})