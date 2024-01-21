function existe(players, username){     //verifica que exista un jugador en la lista por su nombre 

    for (i=0;i<players.length;i++){

        if(String(players[i].username)==String(username)){

            return 1;
        }
    }
    return 0;
}

function buscar(players, username){     //Busca un jugador en la lista por su nombre y devuelve su posicion
                                        //En caso de no encontrarlo devuelve -1
    for (i=0;i<players.length;i++){

        if(String(players[i].username)==String(username)){

            return i;
        }
    }
    return -1;
}

function name(cadena){      //Devuelve una fraccion de un string con forma [*, ,h,o,l,a] o [*, ,h,o,l,a, ,*] independiente de la cantidad de caracteres que contenga la palabra de en medio
                            //Basicamente devuelve lo que este entre los espacios 
    if(cadena.indexOf(" ",2)==-1){

        return cadena.slice(2);
    }
    else{

        return cadena.slice(2,cadena.indexOf(" ",2));
    }
}

function noAcento(str) {    //Cambia las letras con acento por su version sin acento, lastimosamente elimina tambien la ñ, pero es por un bien mayor

    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function turnoAnterior(players,turno){  //Devuelve la pocision en la lista del anterior jugador "vivo" (con estado = 1)

    for(i = turno; ; i--){

        if(i==-1) i=players.length-1;
        if(players[i].estado==1) return i;
    }
}

function turnoSiguiente(players,turno){     //Devuelve la pocision en la lista del siguiente jugador "vivo" (con estado = 1), en caso de no encontrar ninguno devuelve un -1

    for(i = turno + 1, j = 0; j!=2; i++){

        if(i==players.length){ 
            
            i=0;
            j++;
        }
        if(players[i].estado==1) return i;
    }
    return -1;
}

function palabraAleatoria(anfitrion){   //Le envia al anfitrion una palabra aleatoria

    fetch('https://pow-3bae6d63ret5.deno.dev/word')
        .then(res => res.json())
        .then(json => {

            anfitrion.send(noAcento(json.word));
    });
}

function generarPlayer(player, nombre, ws, estado){     //Genera la estructura player con el nombre de usuario, su ws y su estado

    player = {
    
        username : String(nombre),
        dir : ws,
        estado : estado
    }
    return player;
}

function enviarATodosJugadores(players, mensaje, turno){    //Le envia un mensaje a todos los jugadores menos al de la posicion turno
                                                            //Si como variable turno recibe un numero negativo le envia un mensaje a todos los jugadores
    for(i=0; i<players.length; i++){

        if (i!=turno) players[i].dir.send(mensaje);
    }
}

function enviarATodosJugadoresWS(players, mensaje, ws, aux){    //Le envia un mensaje a todos los jugadores menos al que tenga en su estructura la variable ws     
                                                                //aux es un boolean con el cual se controla si se le envia un mensaje o no al jugador que tenga en su estructura la variable ws
    for(i = 0; i<players.length; i++){

        if (players[i].dir!=ws){

            players[i].dir.send(mensaje);
        }
        else if(aux) players[i].dir.send(mensaje);
    }
}

function eliminarDesconectados(players){    //Elimina de la lista a los jugadores que tengas -1 como valor en la variable estado

    for(i=0; i<players.length; i++){

        if (players[i].estado==-1){
            players.splice(i,1);
            i--;
        }
    }
    return players;
}

function cambiarEstado(players, nuevoEstado){   //Cambia la variable estado para todos los jugadores, el nuevo estado sera determinado por como se llame a la funcion

    for(i=0; i<players.length; i++){

        players[i].estado = nuevoEstado;
    }
}

function cambiarEstadoIndividual(players, ws, nuevoEstado){     //Cambia el estado de un solo jugador 

    for(i = 0; i<players.length; i++){

        if (players[i].dir==ws){

            players[i].estado = nuevoEstado;
        }
    }
}

function todosPerdieron(players, todosPerdieron){

    for(i = 0; i<players.length; i++){

        if (players[i].estado==1){

            todosPerdieron = false;
        }
    }
    return todosPerdieron;
}

function anfitrionDesconectado(players){

    for(i=1; i<players.length; i++){

        players[i].dir.send("8");
        players[i].dir.close();
    }
}

function buscarPorWS(players, ws){

    for(i = 0; i<players.length; i++){

        if (players[i].dir==ws) return i;
    }
    return -1;
}

module.exports = {
   
    "existe": existe,
    "name" : name,
    "buscar" : buscar,
    "noAcento" : noAcento,
    "turnoAnterior" : turnoAnterior,
    "turnoSiguiente" : turnoSiguiente,
    "palabraAleatoria" : palabraAleatoria,
    "generarPlayer" : generarPlayer,
    "enviarATodosJugadores" : enviarATodosJugadores,
    "enviarATodosJugadoresWS" : enviarATodosJugadoresWS,
    "eliminarDesconectados" : eliminarDesconectados,
    "cambiarEstado" : cambiarEstado,
    "cambiarEstadoIndividual" : cambiarEstadoIndividual,
    "todosPerdieron" : todosPerdieron,
    "anfitrionDesconectado" : anfitrionDesconectado,
    "buscarPorWS" : buscarPorWS
}