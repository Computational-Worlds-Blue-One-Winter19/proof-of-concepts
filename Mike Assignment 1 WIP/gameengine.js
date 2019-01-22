window.requestAnimFrame = (function () {
  return window.requestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.oRequestAnimationFrame
            || window.msRequestAnimationFrame
            || function (/* function */ callback, /* DOMElement */ element) {
              window.setTimeout(callback, 1000 / 60);
            };
}());

function GameEngine() {
  this.entities = [];
  this.ctx = null;
  this.surfaceWidth = null;
  this.surfaceHeight = null;
}

GameEngine.prototype.init = function (ctx) {
  this.ctx = ctx;
  this.surfaceWidth = this.ctx.canvas.width;
  this.surfaceHeight = this.ctx.canvas.height;
  this.timer = new Timer();
  console.log('game initialized');
};

GameEngine.prototype.start = function () {
  console.log('starting game');
  const that = this;
  (function gameLoop() {
    that.loop();
    requestAnimFrame(gameLoop, that.ctx.canvas);
  }());
};

GameEngine.prototype.addEntity = function (entity) {
  console.log('added entity');
  this.entities.push(entity);
};

GameEngine.prototype.draw = function () {
  this.ctx.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
  this.ctx.save();
  for (let i = 0; i < this.entities.length; i++) {
    this.entities[i].draw(this.ctx);
  }
  this.ctx.restore();
};

GameEngine.prototype.update = function () {
  const entitiesCount = this.entities.length;

  for (let i = 0; i < entitiesCount; i++) {
    const entity = this.entities[i];

    entity.update();
  }
};

GameEngine.prototype.loop = function () {
  this.clockTick = this.timer.tick();
  this.update();
  this.draw();
};

function Timer() {
  this.gameTime = 0;
  this.maxStep = 0.05;
  this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
  const wallCurrent = Date.now();
  const wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
  this.wallLastTimestamp = wallCurrent;

  const gameDelta = Math.min(wallDelta, this.maxStep);
  this.gameTime += gameDelta;
  return gameDelta;
};

function Entity(game, x, y) {
  this.game = game;
  this.x = x;
  this.y = y;
  this.removeFromWorld = false;
}

Entity.prototype.update = function () {
};

Entity.prototype.draw = function (ctx) {
  if (this.game.showOutlines && this.radius) {
    this.game.ctx.beginPath();
    this.game.ctx.strokeStyle = 'green';
    this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.game.ctx.stroke();
    this.game.ctx.closePath();
  }
};

Entity.prototype.rotateAndCache = function rotateAndCache(image, angle) {
  const offscreenCanvas = document.createElement('canvas');
  const size = Math.max(image.width, image.height);
  offscreenCanvas.width = size;
  offscreenCanvas.height = size;
  const offscreenCtx = offscreenCanvas.getContext('2d');
  offscreenCtx.save();
  offscreenCtx.translate(size / 2, size / 2);
  offscreenCtx.rotate(angle);
  offscreenCtx.translate(0, 0);
  offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
  offscreenCtx.restore();
  // offscreenCtx.strokeStyle = "red";
  // offscreenCtx.strokeRect(0,0,size,size);
  return offscreenCanvas;
};
