var Game = /** @class */ (function () {
    function Game() {
        this.pausa = false;
        this.count = 0;
        Game.instance = this;
        this.points = 0;
        this.lives = 3;
        this.levelPerPoints = 100;
        this.fps = "...";
        this.canvas = {
            object: document.getElementById("juego"),
            width: window.innerWidth,
            height: window.innerHeight,
            bordes: 8,
            paddingLateral: 300,
            paddingTopBottom: 70
        };
        this.canvas.ctx = this.canvas.object.getContext("2d");
        // LIMITES
        this.limite = {
            superior: this.canvas.bordes + this.canvas.paddingTopBottom,
            inferior: this.canvas.height - (this.canvas.bordes + this.canvas.paddingTopBottom),
            izquierdo: this.canvas.bordes + this.canvas.paddingLateral,
            derecho: this.canvas.width - this.canvas.paddingLateral - 10
        };
        // ------------- BARRA ------------- //
        this.barra = {
            width: 10,
            height: 120,
            top: this._toPixels("50%", "vertical") - 60,
            left: this._toPixels("100%", "horizontal"),
            speed: 10,
            direction: [0, 0] // [Arriba, Abajo]
        };
        // ------------- PELOTA ------------- //
        this.pelota = {
            width: 16,
            height: 16,
            top: this._toPixels("50%", "vertical") - 8,
            left: this._toPixels("50%", "horizontal") - 8,
            speed: 10,
            initialSpeed: 10,
            slopeX: Math.sign(Math.random() - 0.5),
            slopeY: Math.sign(Math.random() - 0.5)
        };
        this.pelota.left -= this.pelota.width / 2;
        this.pelota.top -= this.pelota.height / 2;
        
        // ---------- PUNTOS EXTRAS ---------- //
        // ------------- BARRAS ------------- //
        this.extraPoints = [
            {
                borders: 10,
                points: 20,
                top: this._toPixels("10%", "vertical")
            },
            {
                borders: 6,
                points: 40,
                top: this._toPixels("70%", "vertical")
            },
            {
                borders: 4,
                points: 80,
                top: this._toPixels("40%", "vertical")
            }
        ];
        // ------------- VALORES INICIALES ------------- //
        this.canvas.object.width = this.canvas.width;
        this.canvas.object.height = this.canvas.height;
        this.canvas.ctx.fillStyle = "#000000"; // Negro
        this.canvas.ctx.fillRect(0, 0, this.canvas.object.width, this.canvas.object.height);
        this.newAngle();
        // Heart Image
        this.image = new Image();
        this.image.src = "imgs/heart.png";
        this.extraPointImage = new Image();
        this.extraPointImage.src = "imgs/extraBorder.png";
        // Audios
        this.game_over = new setAudio("game_over");
        this.game_play = new setAudio("game_play");
        this.rebote = new setAudio("rebote");
        this.count_down = new setAudio("count_down");
        this.livelostAudio = new setAudio("livelost");
        this.levelup = new setAudio("levelup");
        this.game_play.loop();
        this.lastLevel = 0;
    }
    Game.prototype.newAngle = function () {
        this.pelota.angle = Math.round(Math.random() * 30 + 30); // Random Angle from 30 to 60
        this.setSlopesToAngle();
    };
    Game.prototype.draw = function () {
        var _this = this;
        // ------------- BORDES ------------- //
        this.canvas.ctx.fillStyle = "#FFFFFF"; // Blanco
        this.canvas.ctx.fillRect(this.canvas.paddingLateral, this.canvas.paddingTopBottom, this.canvas.width - 2 * this.canvas.paddingLateral - this.barra.width, this.canvas.bordes); // Borde superior
        this.canvas.ctx.fillRect(this.canvas.paddingLateral, this.canvas.height - (this.canvas.bordes + this.canvas.paddingTopBottom), this.canvas.width - 2 * this.canvas.paddingLateral - this.barra.width, this.canvas.bordes); // Borde inferior
        this.canvas.ctx.fillRect(this.canvas.paddingLateral, this.canvas.paddingTopBottom, this.canvas.bordes, this.canvas.height - 2 * this.canvas.paddingTopBottom); // Borde izquierdo
        this.canvas.ctx.fillStyle = "white";
        // Extra Point Bars
        this.canvas.ctx.font = "20px invasion200";
        var i;
        this.canvas.ctx.save();
        this.extraPoints.forEach(function (element) {
            _this.canvas.ctx.clearRect(_this.canvas.paddingLateral, element.top, _this.canvas.bordes, element.borders * 8);
            for (i = 0; i < element.borders; i++) {
                _this.canvas.ctx.drawImage(_this.extraPointImage, _this.canvas.paddingLateral, element.top + i * 8);
            }
            _this.canvas.ctx.rotate(Math.PI / -2);
            _this.canvas.ctx.fillText(element.points, -1 * (element.top + i * 4 + 18), _this.canvas.paddingLateral - 15);
            _this.canvas.ctx.rotate(Math.PI / 2);
        });
        this.canvas.ctx.restore();
        this.canvas.ctx.font = "30px invasion200";
        // Barra
        this.canvas.ctx.fillStyle = "#FFFFFF"; // Blanco
        this.canvas.ctx.fillRect(this.barra.left, this.barra.top, this.barra.width, this.barra.height); // Borde superior
        // Pelota
        this.canvas.ctx.fillRect(this.pelota.left, this.pelota.top, this.pelota.width, this.pelota.height); // Borde superior
        // Vidas
        this.canvas.ctx.fillText("LIVES", 110, 110);
        var center = 160;
        for (var i_1 = 0; i_1 < this.lives; i_1++) {
            this.canvas.ctx.drawImage(this.image, center - (this.lives * 35 / 2) + 35 * i_1, 125, 30, 30);
        }
        // Score
        this.canvas.ctx.fillText("SCORE", 110, 190);
        this.canvas.ctx.fillText(this.points, 110, 225);
        // Score
        this.canvas.ctx.fillText("Level", 110, 280);
        this.canvas.ctx.fillText(this.pelota.speed - this.pelota.initialSpeed + 1, 110, 310);
        if (this.lastLevel !== this.pelota.speed - this.pelota.initialSpeed) {
            this.lastLevel = this.pelota.speed - this.pelota.initialSpeed;
            this.levelup.start();
        }
        // FPS
        this.canvas.ctx.fillText("FPS", this.canvas.width - 250, 110);
        this.canvas.ctx.fillText(this.fps, this.canvas.width - 250, 140);
        // Dashed Line
        this.canvas.ctx.save();
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(this.limite.derecho, this.limite.superior);
        this.canvas.ctx.setLineDash([5, 15]);
        this.canvas.ctx.lineTo(this.limite.derecho, this.limite.inferior);
        this.canvas.ctx.strokeStyle = "white";
        this.canvas.ctx.stroke();
        this.canvas.ctx.restore();
    };
    // ---------- MOVIMIENTOS PELOTA ---------- //
    Game.prototype.movePelota = function () {
        this.pelota.top += this.pelota.slopeY;
        this.pelota.left += this.pelota.slopeX;
        if (this.pelota.top < this.limite.superior) {
            this.pelota.top = this.limite.superior;
            return this.colisionY();
        }
        else if (this.pelota.top > this.limite.inferior - this.pelota.height) {
            this.pelota.top = this.limite.inferior - this.pelota.height;
            return this.colisionY();
        }
        if (this.pelota.left > this.limite.derecho - this.pelota.width) {
            this.pelota.left = this.limite.derecho - this.pelota.width;
            return this.colisionX(true);
        }
        else if (this.pelota.left < this.limite.izquierdo) {
            this.pelota.left = this.limite.izquierdo;
            return this.colisionX(false);
        }
    };
    Game.prototype.colisionY = function () {
        this.rebote.start();
        this.pelota.slopeY *= -1;
        this.newAngle();
    };
    Game.prototype.colisionX = function (derecha) {
        this.rebote.start();
        this.pelota.slopeX *= -1;
        if (derecha) {
            if (this.pelota.top + this.pelota.height >= this.barra.top &&
                this.pelota.top <= this.barra.top + this.barra.height) {
                this.points += 10;
            }
            else {
                this.liveLost();
            }
        }
        else {
            for (var x in this.extraPoints) {
                if (this.pelota.top + this.pelota.height >= this.extraPoints[x].top && this.pelota.top <= this.extraPoints[x].top + this.extraPoints[x].borders * 8) {
                    this.points += this.extraPoints[x].points;
                    break;
                }
            }
        }
        this.pelota.speed = this.pelota.initialSpeed + Math.floor(this.points / this.levelPerPoints);
    };
    Game.prototype.setPausa = function () {
        this.pausa = true;
        this.game_play.stop();
        this.canvas.ctx.fillText("PAUSA", this._toPixels("50%", "horizontal") - 50, this._toPixels("50%", "vertical") - 10);
    };
    Game.prototype.resume = function () {
        if (this.pausa) {
            this.pausa = false;
            this.game_play.loop();
            this.animation();
        }
    };
    Game.prototype.liveLost = function () {
        var _this = this;
        this.livelostAudio.start();
        this.lives--;
        this.canvas.ctx.fillStyle = "rgba(50,50,50,.5)";
        this.canvas.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(this.pelota.left + this.pelota.width / 2, this.pelota.top + this.pelota.height / 2, 40, 0, 2 * Math.PI);
        this.canvas.ctx.strokeStyle = "rgba(230,230,230,1)";
        this.canvas.ctx.lineWidth = 3;
        this.canvas.ctx.stroke();
        if (this.lives) {
            this.pausa = true;
            setTimeout(function () {
                _this.pausa = false;
                _this.pelota.top = _this._toPixels("50%", "vertical") - 8;
                _this.pelota.left = _this._toPixels("50%", "horizontal") - 8;
                _this.startCountDown();
            }, 2000);
        }
    };
    Game.prototype.gameOver = function () {
        this.game_play.stop();
        this.game_over.start();
        this.canvas.ctx.beginPath();
        this.canvas.ctx.fillStyle = "#FFFFFF"; // Blanco
        this.canvas.ctx.strokeStyle = "rgba(100,150,150,.7)";
        this.canvas.ctx.font = "50px invasion200";
        this.canvas.ctx.fillText("GAME OVER", this.canvas.width / 2 - 170, this.canvas.height / 2 - 15);
        this.canvas.ctx.strokeText("GAME OVER", this.canvas.width / 2 - 170, this.canvas.height / 2 - 15);
        this.canvas.ctx.fill();
        this.canvas.ctx.stroke();
    };
    // ---------- MOVER BARRA ---------- //
    Game.prototype.moveBarra = function () {
        if (Math.abs(this.barra.direction[0] - this.barra.direction[1])) {
            this.barra.top += (this.barra.direction[1] - this.barra.direction[0]) * this.barra.speed;
            if (this.barra.top < this.limite.superior)
                this.barra.top = this.limite.superior;
            else if (this.barra.top > this.limite.inferior - this.barra.height)
                this.barra.top = this.limite.inferior - this.barra.height;
        }
    };
    Game.moverBarra = function (e) {
        var index;
        if (e.keyCode === 38)
            index = 0;
        else if (e.keyCode === 40)
            index = 1;
        else
            return;
        Game.instance.barra.direction[index] = e.type === "keydown" ? 1 : 0;
    };
    Game.prototype.animation = function () {
        Game.instance.count++; // Contar Cuadros
        // Borrar Canvas
        if (!Game.instance.pausa) {
            Game.instance.canvas.ctx.clearRect(0, 0, Game.instance.canvas.width, Game.instance.canvas.height);
            Game.instance.movePelota();
            Game.instance.moveBarra();
            Game.instance.draw();
            if (Game.instance.lives)
                window.requestAnimationFrame(Game.instance.animation);
            else
                Game.instance.gameOver();
        }
    };
    Game.prototype.startCountDown = function () {
        this.countDownSteps = 3;
        this.count_down.start();
        this._countDown();
    };
    Game.prototype._countDown = function () {
        var _this = this;
        Game.instance.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.countDownSteps) {
            this.draw();
            this.canvas.ctx.font = "50px invasion200";
            this.canvas.ctx.fillText(this.countDownSteps, this._toPixels("50%", "horizontal") - 20, this._toPixels("50%", "vertical") - 30);
            this.countDownSteps--;
            setTimeout(function () { _this._countDown(); }, 5000 / 3);
        }
        else {
            this.animation();
        }
    };
    Game.prototype.reset = function () {
        this.pausa = true;
        this.animation();
        setTimeout(startGame, 1000 / 62);
    };
    // ------------- METODOS PRIVADOS ------------- //
    Game.prototype._toPixels = function (value, o) {
        if (!/^([0-9]{1,2}|100)%$/.test(value))
            throw "_toPixels: invalid longitude.";
        var a = o === "horizontal" ? this.limite.derecho - this.limite.izquierdo : this.limite.inferior - this.limite.superior, b = o === "horizontal" ? this.limite.izquierdo : this.limite.superior;
        return Math.round(parseInt(value.replace("%", "")) * a) / 100 + b;
    };
    /*
    * setSlopesToAngle mantiene la velocida siempre igual a {this.pelota.speed} pixeles por cuadro
    */
    Game.prototype.setSlopesToAngle = function () {
        this.pelota.slopeX = Math.sign(this.pelota.slopeX) * Math.round(Math.cos(this.pelota.angle * Math.PI / 180) * this.pelota.speed * 100) / 100;
        this.pelota.slopeY = Math.sign(this.pelota.slopeY) * Math.round(Math.sin(this.pelota.angle * Math.PI / 180) * this.pelota.speed * 100) / 100;
    };
    return Game;
}());
var setAudio = /** @class */ (function () {
    function setAudio(id) {
        var _this = this;
        this.loaded = false;
        this.element = document.getElementById(id);
        this.element.onload = function () {
            _this.loaded = true;
        };
    }
    setAudio.prototype.start = function () {
        this.element.pause();
        this.element.currentTime = 0;
        this.element.play();
    };
    setAudio.prototype.loop = function () {
        this.element.pause();
        this.element.autoplay = true;
        this.element.loop = true;
        this.element.play();
    };
    setAudio.prototype.stop = function () {
        this.element.pause();
    };
    return setAudio;
}());
var game;
function startGame() {
    game = new Game();
    document.addEventListener("keydown", Game.moverBarra);
    document.addEventListener("keyup", Game.moverBarra);
    game.draw();
    game.startCountDown();
}
startGame();
setInterval(function () {
    if (game) {
        game.fps = game.count;
        game.count = 0;
    }
}, 1000);
