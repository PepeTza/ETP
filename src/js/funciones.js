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

        console.log()
        if(String(players[i].username)==String(username)){

            console.log("i="+i);
            return i;
        }
    }
    return -1;
}

function name(cadena){

    if(cadena.indexOf(" ",2)==-1){

        console.log(cadena.slice(2)+"1");
        return cadena.slice(2);
    }
    else{

        console.log(2,cadena.slice(2,cadena.indexOf(" ",2))+"");
        return cadena.slice(2,cadena.indexOf(" ",2))+"";
    }
}

function noAcento(str) {

    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

module.exports = {
   
    "existe": existe,
    "name" : name,
    "buscar" : buscar,
    "noAcento" : noAcento
}