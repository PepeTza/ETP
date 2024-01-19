function existe(players, username){

    for (i=0;i<players.length;i++){

        if(String(players[i].username)==String(username)){

            return 1;
        }
    }
    return 0;
}

module.exports = {
    "existe": existe
}