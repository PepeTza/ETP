function existe(players, username){

    for (i=0;i<players.length;i++){

        if(String(players[i].username)==String(username)){

            return 1;
        }
    }
    return 0;
}

function buscar(players, username){

    for (i=0;i<players.length;i++){

        if(String(players[i].username)==String(username)){

            return i;
        }
    }
    return -1;
}

function name(cadena){

    if(cadena.indexOf(" ",2)==-1){

        return cadena.slice(2);
    }
    else{

        return cadena.slice(2,cadena.indexOf(" ",2));
    }
}

function noAcento(str) {

    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function turnoAnterior(players,turno){

    for(i = turno; ; i--){

        if(i==-1) i=players.length-1;
        if(players[i].estado==1) return i;
    }
}

function turnoSiguiente(players,turno){

    for(i = turno + 1, j = 0; j!=2; i++){

        if(i==players.length){ 
            
            console.log(j);
            i=0;
            j++;
        }
        if(players[i].estado==1) return i;
    }
    return -1;
}

module.exports = {
   
    "existe": existe,
    "name" : name,
    "buscar" : buscar,
    "noAcento" : noAcento,
    "turnoAnterior" : turnoAnterior,
    "turnoSiguiente" : turnoSiguiente
}