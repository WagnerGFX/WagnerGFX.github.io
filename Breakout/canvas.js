/*jslint node: true */
/*jslint browser:true */

/////////////////////////////
//// NÚCLEO E EVENTOS
/////////////////////////////
var oCanvas;
var oCtx;

function Inicio() {
    oCanvas = document.getElementById("myCanvas");
    oCtx = oCanvas.getContext("2d");
    setInterval(Atualizar, 10);
    
    window.addEventListener("keydown", KeyDown, false);
    window.addEventListener("keyup", KeyUp, false);
    window.addEventListener("mousemove", MouseMove, false);
    
    LoadMaxScore();
    BlocosInstancia();
    
    NovoJogo();
}

function Atualizar() {
    ApagarTela();
    AtualizaFisica();
    DesenharTela();
}

function KeyDown(e) {
    if(e.keyCode == 32) {
        if (!keySpace) {
            if (isMenu) {
                isMenu = !isMenu;
            }
            else if (isGameOver) {
                isGameOver = !isGameOver;
                NovoJogo();
            }
            else {
                isPaused = !isPaused;
            }
            
            keySpace = true;
        }
    }
}

function KeyUp(e) {
    if(e.keyCode == 32) {
        keySpace = false;
        if(e.preventDefault){
            e.preventDefault();
        }else{
            e.returnValue = false;
        }
    }
}

function MouseMove(e) {
    mousePosX = e.clientX - oCanvas.offsetLeft;
}

/////////////////////////////
//// MENUS E SISTEMA
/////////////////////////////
var colorObj = "#0095DD";
var colorBG = "#EEEEEE";
var mousePosX;
var keySpace = false;
var isPaused = false;
var isMenu = true;
var isGameOver = false;
var score = 0;
var scoreMax = 0;
var points = 5;
var nivel = 1;
var vidas;
var vidasPadrao = 3;

var alphaMenu = 0.8;
var alphaDead = 0.2;

function ApagarTela() {
    oCtx.fillStyle = colorBG;
    oCtx.fillRect(0, 0, oCanvas.width, oCanvas.height);
}

function AtualizaFisica() {
    if (!isPaused && !isMenu &&! isGameOver) {
        BolaAtualiza();
        BaseAtualiza();
        BlocosAtualiza();
    }
}

function DesenharTela() {
    BolaDesenha();
    BaseDesenha();
    BlocosDesenha();
    
    if (isPaused || isMenu || isGameOver) {
        DesenhaMenu();
    }
    
    DesenhaHUD();
}

function NovoJogo() {
    score = 0;
    nivel = 1;
    vidas = vidasPadrao;

    BolaVelInicial();
    BolaPosInicial();
    BolaDirInicial();
    BasePosInicial();
    
    BlocosCria();

}

function ProximaFase() {
    nivel++;
    vidas++;
    
    BolaPosInicial();
    BolaDirInicial();
    BasePosInicial();
    
    BlocosCria();
}

function DesenhaHUD() {
    oCtx.font = "bold 16px Arial";
    oCtx.fillStyle = colorObj;
    oCtx.textAlign = "left"; 

    if (!isMenu) {
        oCtx.fillText("Balls: " + vidas, 15, 20);
        oCtx.fillText("Level: " + nivel, 100, 20);
        oCtx.fillText("Score: " + score, 190, 20);
    }
    
    oCtx.fillText("Max Score: " + scoreMax, oCanvas.width - 170 , 20);
}

function DesenhaMenu() {
    oCtx.fillStyle = colorBG;
    oCtx.globalAlpha = alphaMenu;
    oCtx.fillRect(0, 0, oCanvas.width, oCanvas.height);
    oCtx.globalAlpha = 1.0;

    oCtx.font = "bold 42px Arial";
    oCtx.fillStyle = colorObj;
    oCtx.textAlign = "center"; 
    
    if(isMenu) {
        oCtx.fillText("B R E A K O U T", oCanvas.width/2, oCanvas.height/2);
    }
    if (isGameOver) {
        oCtx.fillText("GAME OVER", oCanvas.width/2, oCanvas.height/2);
    }
    if (isPaused) {
        oCtx.fillText("PAUSE", oCanvas.width/2, oCanvas.height/2);
    }
    
    oCtx.font = "bold 16px Arial";
    if(isMenu) {
        oCtx.fillText("Use o [MOUSE] para controlar a base.", oCanvas.width/2, oCanvas.height - 170);
        oCtx.fillText("Pressione [ESPAÇO] para começar ou pausar o jogo.", oCanvas.width/2, oCanvas.height - 150);
    }
    if (isGameOver) {
        oCtx.fillText("Pressione [ESPAÇO] para começar uma nova partida.", oCanvas.width/2, oCanvas.height - 170);
    }
    if (isPaused) {
        oCtx.fillText("Pressione [ESPAÇO] para voltar ao jogo.", oCanvas.width/2, oCanvas.height - 170);
    }

}

function DesenhaMenu_Menu() {
    
}

function DesenhaMenu_GameOver() {
    
}

function LoadMaxScore() {
    if (typeof(Storage) !== "undefined") {
        if(localStorage.scoreMax) {
            scoreMax = localStorage.scoreMax;
        }
        else {
            scoreMax = 0;
            localStorage.scoreMax = 0;
        }
    }
}

function SetScore(val) {
    score += val;
    
    if (score > scoreMax) {
        scoreMax = score;
        localStorage.scoreMax = scoreMax;
    }
}

function PerdeVida() {
    vidas--;
    
    if (vidas <= 0) {
        vidas = 0;
        return true;
    } else {
        return false;
    }
}


/////////////////////////////
//// BOLA
/////////////////////////////
var bola_posX;
var bola_posY;
var bola_movX;
var bola_movY;
var bola_raio = 10;
var bola_vel;
var bola_velPadrao = 2;
var bola_velDelta = 0.01;

function BolaDesenha() {
    oCtx.beginPath();
    oCtx.arc(bola_posX, bola_posY, bola_raio, 0, Math.PI*2);
    oCtx.fillStyle = colorObj;
    oCtx.fill();
    oCtx.closePath();
}

function BolaAtualiza() {
    if (BolaMorreu()) {
        if(PerdeVida()) {
            isGameOver = true;
        } else {
            BolaPosInicial();
            BolaDirInicial();
        }
        
    } else {
        BolaColide_Base();
        BolaColide_Parede();
        BolaColide_Blocos();
        bola_posX += bola_movX;
        bola_posY += bola_movY;
    }
}

function BolaMorreu() {
    return (bola_posY + bola_raio >= oCanvas.height);
}

function BolaColide_Base() {
    //Check Y
    if (bola_posY + bola_raio < base_posY || bola_posY > base_posY) {
        return;
    }
    
    //Check X
    if (bola_posX < base_posX || bola_posX > base_posX + base_W) {
        return;
    }
    
    //Evita bug
    if(bola_movY > 0) {
        bola_movY = -bola_movY;
    }
}

function BolaColide_Parede() {
    if(bola_posX + bola_movX > oCanvas.width - bola_raio || bola_posX + bola_movX < bola_raio) {
        bola_movX = -bola_movX;
    }
    if(bola_posY + bola_movY < bola_raio) {
        bola_movY = -bola_movY;
    }
}

function BolaColide_Blocos() {
    for(var i=0; i < bloco_ColumnCount; i++) {
        for(var j=0; j < bloco_RowCount; j++) {
            var bloco = blocos[i][j];

            // 1) Verifica Ativo
            // 2) Verifica Se colodiu
            // 3) Verifica posição da colisão
            // 4) Verifica se a direção permite mudança de direção
            
            if(bloco.active) {
                if(bola_posX + bola_raio > bloco.x &&
                   bola_posX - bola_raio < bloco.x + bloco_W &&
                   bola_posY + bola_raio > bloco.y &&
                   bola_posY - bola_raio < bloco.y + bloco_H) {
                    
                    if ((bola_posX <= bloco.x && bola_movX > 0) || (bola_posX >= bloco.x + bloco_W && bola_movX < 0)) {
                        bola_movX = -bola_movX;
                    }
                    
                    if ((bola_posY <= bloco.y && bola_movY > 0) || (bola_posY >= bloco.y + bloco_H && bola_movY < 0)) {
                        bola_movY = -bola_movY;
                    }

                    BolaVelAumentada();
                    SetScore(points * nivel);
                    bloco.active = false;
                    blocosCount--;
                    
                    if (blocosCount <= 0) {
                        ProximaFase();
                    }
                    return;
                }
            }
        }
    }
}

function BolaVelInicial() {
    bola_vel = bola_velPadrao;
}

function BolaVelAumentada() {
    bola_vel += bola_vel * bola_velDelta;
    
    bola_movX += bola_movX * bola_velDelta;
    bola_movY += bola_movY * bola_velDelta;
}

function BolaPosInicial() {
    bola_posX = oCanvas.width / 2;
    bola_posY = oCanvas.height - 100;
}

function BolaDirInicial() {
    bola_movX =  bola_vel;
    bola_movY = -bola_vel;
}


/////////////////////////////
//// BASE
/////////////////////////////
var base_H = 10;
var base_W = 75;
var base_pading = 10;
var base_posX;
var base_posY;

function BasePosInicial() {
    base_posX = oCanvas.width/2 - base_W/2;
    base_posY = oCanvas.height - base_H - base_pading;
}

function BaseDesenha() {
    oCtx.beginPath();
    oCtx.rect(base_posX, base_posY, base_W, base_H);
    oCtx.fillStyle = colorObj;
    oCtx.fill();
    oCtx.closePath();
}

function BaseAtualiza() {
    if (mousePosX < oCanvas.width - base_W/2 && mousePosX > base_W/2) {
        base_posX = mousePosX - base_W/2;
    }
}


/////////////////////////////
//// BLOCOS
/////////////////////////////
var bloco_RowCount = 3;
var bloco_ColumnCount = 6;
var bloco_W = 80;
var bloco_H = 20;
var bloco_padding = 10;
var bloco_OffsetY = 30;
var bloco_OffsetX = 35;
var blocosCount;

var blocos = [];


function BlocosInstancia() {
    blocos = [];
    
    for(var i=0; i < bloco_ColumnCount; i++) {
        blocos[i] = [];
        for(var j=0; j < bloco_RowCount; j++) {
            blocos[i][j] = { x: 0, y: 0, active:false, color:"#000000"};
        }
    }
}

function BlocosCria() {
    blocosCount = bloco_ColumnCount * bloco_RowCount;
    
    for(var i=0; i < bloco_ColumnCount; i++) {
        for(var j=0; j < bloco_RowCount; j++) {
            blocos[i][j].x = bloco_OffsetX + (bloco_padding * i) + (bloco_W * i);
            blocos[i][j].y = bloco_OffsetY + (bloco_padding * j) + (bloco_H * j);
            blocos[i][j].active = true;
            blocos[i][j].color = "#" + HSVtoRGB_String(GetRandomInt(0,360), 255, 221);
        }
    }
}

function BlocosDesenha() {
    for(var i=0; i < bloco_ColumnCount; i++) {
        for(var j=0; j < bloco_RowCount; j++) {
            oCtx.beginPath();
            oCtx.rect(blocos[i][j].x, blocos[i][j].y, bloco_W, bloco_H);
            oCtx.fillStyle = blocos[i][j].color;
            oCtx.globalAlpha = (blocos[i][j].active ? 1.0 : alphaDead);
            oCtx.fill();
            oCtx.closePath();
        }
    }
    oCtx.globalAlpha = 1;
}
function BlocosAtualiza() {
    for(var i=0; i < bloco_ColumnCount; i++) {
        for(var j=0; j < bloco_RowCount; j++) {
            if(!blocos[i][j].active && blocos[i][j].y <= oCanvas.height + bloco_H) {
                blocos[i][j].y += 2;
            }
        }
    }
}

/////////////////////////////
//// UTIL
/////////////////////////////
function HSVtoRGB(h, s, v) {
    h = h / 359;
    s = s / 255;
    v = v / 255;
    
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s; v = h.v; h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function HSVtoRGB_String(h, s, v) {
    var rgb = HSVtoRGB(h, s, v);
    return toHex(rgb.r) + toHex(rgb.g) + toHex(rgb.b);
}

function toHex(d) {
    return  ("0"+(Number(d).toString(16))).slice(-2).toUpperCase();
}

function GetRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

Inicio();
