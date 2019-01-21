function init() {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();
    
    gameEngine.addEntity(new Player(gameEngine));
    
    //numProjectiles should be within [1, 36]
    var numProjectiles = 3;
    
    for(var i = 0; i <= numProjectiles * 10; i+= 10)    {
        gameEngine.addEntity(new Projectiles(gameEngine, i));
    }
    
    console.log("game started");
}

//must be able to access player x,y inside projectile prototype
var playerX = 700;
var playerY = 600;

function Player(game)   {
    this.game = game;
    this.speed = 50;
    this.ctx = game.ctx;
    this.angle = 90;
    //x = playerX
    //y = playerY
}

Player.prototype.draw = function()  {
    this.ctx.strokeRect(playerX, playerY, 20, 20);
}

Player.prototype.update = function()    {
    //400 = radius of orbiting circle
    //390 = x/y point circle is orbiting around
    playerX = 400 * Math.cos(toRadians(this.angle)) + 390;
    playerY = 400 * Math.sin(toRadians(this.angle)) + 390;
    this.angle += 1;
}

function Projectiles(game, angle)  {
    this.game = game;
    this.radius = 200;
    this.speed = 50;
    this.ctx = game.ctx;
    this.angle = angle;
    this.x = this.radius * Math.cos(toRadians(this.angle)) + this.originX;
    this.y = this.radius * Math.sin(toRadians(this.angle)) + this.originY;
    //De Catlejaus Algorithm:
    this.t = 0;
    this.bulletX = Math.pow((1 - this.t), 2) * 390 + 2 * (1 - this.t) * this.t * this.x + Math.pow(this.t, 2) * playerX;
    this.bulletY = Math.pow((1 - this.t), 2) * 390 + 2 * (1 - this.t) * this.t * this.y + Math.pow(this.t, 2) * playerY;
};

Projectiles.prototype.draw = function() {
    this.ctx.strokeRect(390, 390, 20, 20);
    this.ctx.beginPath();
    this.ctx.arc(this.bulletX, this.bulletY, 10, 0*Math.PI, 2*Math.PI);
    this.ctx.stroke();
    this.ctx.fill();
};

Projectiles.prototype.update = function()   {
    this.bulletX = Math.pow((1 - this.t), 2) * 390 + 2 * (1 - this.t) * this.t * this.x + Math.pow(this.t, 2) * playerX;
    this.bulletY = Math.pow((1 - this.t), 2) * 390 + 2 * (1 - this.t) * this.t * this.y + Math.pow(this.t, 2) * playerY;
    this.t += 0.01;
    if(this.t >= 1) {
        this.t = 0;
    }
     this.x = this.radius * Math.cos(toRadians(this.angle)) + 400;
     this.y = this.radius * Math.sin(toRadians(this.angle)) + 400;
     this.angle += 10;
}

function toRadians (angle) {
    return angle * (Math.PI / 180);
}

function toDegrees (angle) {
  return angle * (180 / Math.PI);
}

window.onload = init;

 