function init() {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Player(gameEngine));

    //numProjectiles should be within [1, 36]
    gameEngine.addEntity(new Turret(gameEngine, 400, 400));
    // gameEngine.addEntity(new Turret(gameEngine, 100, 100));
    
    // gameEngine.addEntity(new Turret(gameEngine, 200, 200));
    // gameEngine.addEntity(new Turret(gameEngine, 300, 300));
    // gameEngine.addEntity(new Turret(gameEngine, 500, 500));
    // gameEngine.addEntity(new Turret(gameEngine, 600, 600));
    // gameEngine.addEntity(new Turret(gameEngine, 700, 700));
    
    
    // var numProjectiles = 36;

    // for(var i = 0; i <= numProjectiles * 10; i+= 30)    {
    //     setTimeout(function() {gameEngine.addEntity(new Projectiles(gameEngine, i));}, 50);

    // }

    console.log("game started");
}

function Turret(game, x, y) {
    this.game = game;
    this.speed = 50;
    this.x = x;
    this.y = y;
    this.ctx = game.ctx;
    this.idx = 0;
    this.bullets = [];
    this.numProjectiles = 8;
    this.redraw = true;
    // this.initial = 
    this.makeBullets();
    // for(var i = 0; i < this.numProjectiles; i++) {
    //     this.bullets.push(new Bullet(45 * i, 50, 400, 400));
    //     console.log(this.idx); 
    //     this.idx++;
    // }
    
}

Turret.prototype.makeBullets = function()   {
    var i = 0;
    var loop = setInterval(() => {
        if(this.idx >= this.numProjectiles) {
            console.log("exit loop");
            clearInterval(loop);
        } else {
            this.bullets[this.idx] = (new Bullet(360/this.numProjectiles * this.idx, 50, this.x, this.y));
            if (this.idx === 20) {
                console.log("shouldn't happen");
            }
            console.log(this.idx + ", bullet pushed");
            this.idx++;
        }
    }, 50);

    // if (this.idx === this.numProjectiles - 1) {
    //     console.log("the ouside check worked")
    //     clearInterval(loop);
    // }
}


Turret.prototype.draw = function()  {
    //The turret itself
    //this.ctx.strokeRect(390, 390, 20, 20);
    //console.log(this.idx);
    for(var i = 0; i < this.idx; i++)    {
        this.ctx.beginPath();
        this.ctx.arc(this.bullets[i].x, this.bullets[i].y, 10, 0*Math.PI, 2*Math.PI);
        this.ctx.stroke();
        this.ctx.fill();
    }
}

Turret.prototype.update = function()    {
    if(this.idx === this.numProjectiles)  {
        this.bullets.forEach(bullet => {
            if(!bullet.offscreen())    {
                // console.log('offscreen');
                // bullet.reset();
                bullet.x += bullet.deltaX * 0.08;
                bullet.y += bullet.deltaY * 0.08;
                bullet.deltaX = (bullet.x - bullet.oX);
                bullet.deltaY = (bullet.y - bullet.oY);
            }
            if(this.allBulletsOffscreen())  {
                console.log("make bullets");
                this.idx = 0;
                this.makeBullets();
            }
            
        });
    }
}

Turret.prototype.allBulletsOffscreen = function()    {
    var allOffScreen = true;
    this.bullets.forEach(bullet => {
        if (!bullet.offscreen()) {
            allOffScreen = false;
        }
        
    })
    return allOffScreen;
}


class Bullet {
    constructor(angle, radius, originX, originY) {
        this.radius = radius;
        this.angle = angle;
        this.oX = originX;
        this.oY = originY;
        this.reset();
        this.deltaX = (this.x - this.oX);
        this.deltaY = (this.y - this.oY);
        this.wait = false;
    }

    offscreen() {
        return (this.x < 0 - this.radius || this.x > 800 + this.radius || this.y < 0 - this.radius || this.y > 800 + this.radius);
    }

    reset() {
        this.x = this.radius * Math.cos(toRadians(this.angle)) + this.oX;
        this.y = this.radius * Math.sin(toRadians(this.angle)) + this.oY;
    }
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
    this.radius = 50;
    this.speed = 50;
    this.ctx = game.ctx;
    this.angle = angle;
    this.originX = 400;
    this.originY = 400;
    this.x = this.radius * Math.cos(toRadians(this.angle)) + this.originX;
    this.y = this.radius * Math.sin(toRadians(this.angle)) + this.originY;
    this.deltaX = (this.x - this.originX);
    this.deltaY = (this.y - this.originY);
    //De Catlejaus Algorithm:
    this.t = 0;
    //this.bulletX = Math.pow((1 - this.t), 2) * 390 + 2 * (1 - this.t) * this.t * this.x + Math.pow(this.t, 2) * playerX;
    //this.bulletY = Math.pow((1 - this.t), 2) * 390 + 2 * (1 - this.t) * this.t * this.y + Math.pow(this.t, 2) * playerY;
};

Projectiles.prototype.draw = function() {
    this.ctx.strokeRect(390, 390, 20, 20);
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, 10, 0*Math.PI, 2*Math.PI);
    this.ctx.stroke();
    this.ctx.fill();
};

Projectiles.prototype.update = function()   {
    // this.bulletX = Math.pow((1 - this.t), 2) * 390 + 2 * (1 - this.t) * this.t * this.x + Math.pow(this.t, 2) * playerX;
    // this.bulletY = Math.pow((1 - this.t), 2) * 390 + 2 * (1 - this.t) * this.t * this.y + Math.pow(this.t, 2) * playerY;
    // this.t += 0.01;
    // if(this.t >= 1) {
    //     this.t = 0;
    // }
    //  this.x = this.radius * Math.cos(toRadians(this.angle)) + 400;
    //  this.y = this.radius * Math.sin(toRadians(this.angle)) + 400;
    //  this.angle += 10;
    // this.deltaX = (this.x - this.originX);
    // this.deltaY = (this.y - this.originY);
    // this.x += this.deltaX * 0.01;
    // this.y += this.deltaY * 0.01;
    if(this.x > 800 || this.x < 0 || this.y < 0 || this.y > 800)  {
        this.angle += 45;
        this.x = this.radius * Math.cos(toRadians(this.angle)) + this.originX;
        this.y = this.radius * Math.sin(toRadians(this.angle)) + this.originY;
        this.deltaX = (this.x - this.originX);
        this.deltaY = (this.y - this.originY);
    } else {
        this.deltaX = (this.x - this.originX);
        this.deltaY = (this.y - this.originY);
        this.x += this.deltaX * 0.1;
        this.y += this.deltaY * 0.1;
    }
}

function toRadians (angle) {
    return angle * (Math.PI / 180);
}

function toDegrees (angle) {
  return angle * (180 / Math.PI);
}

window.onload = init;
