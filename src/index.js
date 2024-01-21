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

app.get('/', (req,res) => {                    //Envia el HTML de la pantalla principal

    res.sendFile('./public/index.html', {

        root: __dirname
    })
})

app.get('/jugador', (req,res) => {             //Envia el HTML de la pantalla del jugador

    res.sendFile('./public/jugador.html', {     

        root: __dirname
    })
})

app.get('/anfitrion', (req,res) => {           //Envia el HTML de la pantalla del anfitrion

    res.sendFile('./public/anfitrion.html', {  

        root: __dirname
    })
})

wss.on('connection', (ws) => {

    console.log('Conexion nueva');

    ws.on('message', (data) => {

        if (data.indexOf(" ")==-1){                         
                                                           
            if(data=="anfitrion"){                            //Al recibir el mensaje "anfitrion" revisa si ya existe o no un anfitrion para el juego                 
                                                              //Si no existe un anfitrion se registra como anfitrion al emizor del mensaje y se le envia una palabra aleatoria 
                if (anfitrion==null){                         //Si ya existe un anfitrion se envia el codigo "5" 
                    anfitrion = ws;
                    fun.palabraAleatoria(anfitrion);
                }
                else {
                    ws.send("5");
                    ws.close();
                }
            }
            else if(data=="1"){                               //Al recibir el codigo "1" se le enviara una nueva palabra al anfitrion  

                fun.palabraAleatoria(anfitrion);
            }
            else if(anfitrion==null){                         //Si un jugador intenta conectarse a la partida y no hay un anfitrion se le envia el codigo "7"

                ws.send("7");
            }                                                 
            else if (players[0]==null){                                //Revisa si la lista de jugadores esta vacia 

                if(!iniciado){                                         //Si la lista esta vacia y la partida no esta iniciada se crea el nuevo jugador con (estado = 1) y se mete en la lista de jugadores
                    
                    let player;
                    player = fun.generarPlayer(player, data, ws, 1);
                    players.push(player);
                    anfitrion.send("1");
                    ws.send("0");
                }
                else{                                                  //Si la lista esta vacia y la partida esta iniciada se crea el nuevo jugador con (estado = 2) y se mete en la lista de jugadores
                    
                    let player;
                    player = fun.generarPlayer(player, data, ws, 2);
                    players.push(player);
                    anfitrion.send("1");
                    ws.send("6");
                }
            }
            else if (!fun.existe(players,String(data))){               //Revisa si ya existe un jugador con cierto nombre en la lista  

                if(!iniciado){                                         //Si no existe un jugador con ese nombre y la partida no esta iniciada se crea el nuevo jugador con (estado = 1) y se mete en la lista de jugadores
                    
                    let player;
                    player = fun.generarPlayer(player, data, ws, 1);   
                    players.push(player);
                    anfitrion.send("1");
                    ws.send("0");
                }
                else{                                                  //Si no existe un jugador con ese nombre y la partida esta iniciada se crea el nuevo jugador con (estado = 2) y se mete en la lista de jugadores
                    
                    let player;
                    player = fun.generarPlayer(player, data, ws, 2);
                    players.push(player);
                    anfitrion.send("1");
                    ws.send("6");
                }
            }
            else{                     //Si ya existe un jugador con ese nombre se envia un codigo "1"
   
                ws.send("1");
            }   
        }
        else if ((data+"")[0]=="2"){    //Si el primer caracter del mensaje es "2" significa que el anfitrion va a iniciar la partida, para lo cual se le informa a todos los jugadores de quien es el primer turno
                
            iniciado = true;
            fun.enviarATodosJugadores(players, "2 "+data.slice(2), -1);
            turno = fun.turnoSiguiente(players,-1);
            if (players[turno].estado==1) players[turno].dir.send("3");
            fun.enviarATodosJugadores(players, "2 "+data.slice(2), turno);
        }
        else if ((data+"")[0]=="3"){    //Si el primer caracter del mensaje es "3" significa que uno de los jugadores gano la partida, para lo cual se le informa al anfitrion y a todos los jugadores quien gano la partida y se prepara todo para la siguiente partida

            fun.enviarATodosJugadoresWS(players, "5 "+data.slice(2), ws, false);
            anfitrion.send("3 "+data.slice(2));
            players = fun.eliminarDesconectados(players);
            fun.cambiarEstado(players, 1);
            turno = 0;
            iniciado = false;
        }
        else if ((data+"")[0]=="4"){    //Si el primer caracter del mensaje es "4" significa que el usuario emisor perdio, se verifica si aun quedan usuarios activos, de no ser el caso se termina la partida       

            fun.cambiarEstadoIndividual(players, ws, 0);
            todosPerdieron = fun.todosPerdieron(players, true);
            console.log(todosPerdieron);
            if(todosPerdieron){

                anfitrion.send("4");
                players = fun.eliminarDesconectados(players);
                fun.cambiarEstado(players,1);
                turno = 0;
                iniciado = false;
            }
        }
        else if(data.indexOf(" ",2)==-1){   //Verifica si hay espacios despues del segundo caracter, si no hay espacios es un mensaje de un jugador y el cual contiene la letra enviada como primer caracter, luego un espacio y su nombre
                                            //Luego se le envia la solicitud al servidor para que revise la letra que le envio el jugador
            anfitrion.send(data+"");
            turno = fun.turnoSiguiente(players, turno);
        }
        else if(data.indexOf(" ",2)!=-1){   //Esta es la respuesta del anfitrion al jugador que envia una letra, se identifica porque despues del segundo caracter si hay un espacio
                                            //Ademas le avisa al siguiente jugador que es su turno
            if (players[0]!=null) players[fun.turnoAnterior(players, turno-1)].dir.send(data+"");
            if (players[turno].estado==1){
                
                players[turno].dir.send("3");
                fun.enviarATodosJugadores(players, "4 "+players[turno].username, turno);
            }
        }
    })

    ws.on('close', () => {

        if(ws==anfitrion){  //Si el anfitrion se desconecta se actualizan los valores y se desconecta a todos los jugadores
            
            anfitrion = null;
            fun.anfitrionDesconectado(players);
            players = [];
        } 
        else if(fun.buscarPorWS(players, ws)!=-1){   //Si el desconectado es un jugador se notifica al anfitrion y se cambia su estado a (estado = -1), y si es el turno de ese jugador se pasa el turno al siguiente jugador activo
                                                     //Si no hay mas jugadores activos se acaba la partida y se prepara la siguiente
            let desconectado = fun.buscarPorWS(players, ws);

            players[desconectado].estado = -1;
            anfitrion.send("2");
            console.log(`${players[desconectado].username} se desconecto`);
            if (desconectado==turno){

                turno = fun.turnoSiguiente(players, turno);
                if (turno!=-1){

                    players[turno].dir.send("3");
                    fun.enviarATodosJugadores(players, "4 "+players[turno].username, turno);
                }
                else{

                    todosPerdieron = fun.todosPerdieron(players, true);
                    console.log(todosPerdieron);
                    if(todosPerdieron){

                        anfitrion.send("4");
                        players = fun.eliminarDesconectados(players);
                        fun.cambiarEstado(players,1);
                        turno = 0;
                        iniciado = false;
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