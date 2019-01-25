function init() {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();
    
    gameEngine.addEntity(new Player(gameEngine));
    gameEngine.addEntity(new Turret(gameEngine));
    
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
    playerX = 300 * Math.cos(toRadians(this.angle)) + 390;
    playerY = 300 * Math.sin(toRadians(this.angle)) + 390;
    this.angle += 1;
}

function Turret(game)   {
    this.game = game;
    this.ctx = game.ctx;
    this.bullets = [];
    var i = 0;
    var loop = setInterval(() => {
        this.bullets.push(new circleBullet(12, this.ctx));
        i++;
    }, 300);
    //this.bullets.push(new circleBullet(12, this.ctx));
}

Turret.prototype.draw = function()  {
    //Draw me
    this.ctx.strokeRect(390, 390, 20, 20);
    //Draw my bullets
    this.bullets.forEach(b =>   {
        b.draw();
    });
}

Turret.prototype.update = function()    {
    this.bullets.forEach(b =>   {
        b.update();
    })
}

class Bullet    {
    constructor(originX, originY, angle, ctx)    {
        this.ctx = ctx;
        this.radius = 10;
        this.oX = originX;
        this.oY = originY;
        this.angle = angle;
        this.x = this.radius * Math.cos(toRadians(this.angle)) + this.oX;
        this.y = this.radius * Math.sin(toRadians(this.angle)) + this.oY;
    }

    offscreen() {
        return (this.x < 0 - this.radius || this.x > 800 + this.radius || this.y < 0 - this.radius || this.y > 800 + this.radius);
    }

    draw()  {
        //If not offscreen, draw me.
        //console.log("bullet draw");
        //console.log(this.x + ", " + this.y);
        if(!this.offscreen())    {
            //console.log("draw");
            //console.log(this.x + ", " + this.y);
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0*Math.PI, 2*Math.PI);
            this.ctx.stroke();
            this.ctx.fill();  
        }  
    }
}

class circleBullet   {
    constructor(numBullets, ctx)   {
        this.numBullets = numBullets;
        this.bullets = [];
        for(var i = 0; i < this.numBullets; i++)    {
            this.bullets.push(new Bullet(400, 400, i * (360 / this.numBullets), ctx));
            this.bullets[i].deltaX = (this.bullets[i].x - this.bullets[i].oX);
            this.bullets[i].deltaY = (this.bullets[i].y - this.bullets[i].oY);
            //console.log(this.bullets[i].x + ", " + this.bullets[i].y + ", ANGLE: " + this.bullets[i].angle);
        }
    }

    update()    {
        this.bullets.forEach(bullet =>  {
            bullet.deltaX = (bullet.x - bullet.oX);
            bullet.deltaY = (bullet.y - bullet.oY);
            bullet.x += bullet.deltaX * 0.05;
            bullet.y += bullet.deltaY * 0.05;
        });
    }

    draw()  {
        this.bullets.forEach(bullet =>  {
            //console.log("draw circle bullets");
            bullet.draw();
        })
    }
}


function toRadians (angle) {
    return angle * (Math.PI / 180);
}

function toDegrees (angle) {
  return angle * (180 / Math.PI);
}

window.onload = init;

 