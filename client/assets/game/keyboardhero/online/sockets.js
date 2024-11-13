let socket = io();
let clients = 0;
let disconnected = false;
socket.on("disconnect", function (data) {
    disconnected = true;
});
socket.on("handshake", function (data) {
    //if (disconnected) window.location.reload();
});

socket.on("clients", function (data) {
    clients = data.clients;
    let elms = document.getElementsByClassName("globalClientDisplay");
    for (let i = 0; i < elms.length; ++i) {
        elms[i].innerHTML = clients;
    }
});

socket.on("msg", (data) => {
    console.log(data);
    GameMessage(data);
});



let currMSG = "", lastMSG = "";
function GameMessage(msg) {
    currMSG = msg;

    let gameBanner = document.getElementById("gameBanner");
    if (msg == null || msg == "") if (gameBanner != null) { gameBanner.remove(); return; }

    if (gameBanner == null && msg != null && msg != "") {
        gameBanner = document.createElement("div");
        gameBanner.id = "gameBanner";
        document.body.append(gameBanner)
    }
    gameBanner.getElement("co");
}
