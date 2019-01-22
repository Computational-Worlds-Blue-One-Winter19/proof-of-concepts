const AM = new AssetManager();

function Animation(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale, margin) {
  this.spriteSheet = spriteSheet;
  this.frameWidth = frameWidth;
  this.frameDuration = frameDuration;
  this.frameHeight = frameHeight;
  this.sheetWidth = sheetWidth;
  this.frames = frames;
  this.totalTime = frameDuration * frames;
  this.elapsedTime = 0;
  this.loop = loop;
  this.scale = scale;
  this.margin = margin;
  this.scaledSpriteWidth = frameWidth * scale;
  this.scaledSpriteHeight = frameHeight * scale;
  this.animationCanvas = document.createElement('canvas');
  // Make the canvas slightly bigger so no parts of the sprite are cut off when rotated
  this.animationCanvas.width = this.scaledSpriteWidth;
  this.animationCanvas.height = this.scaledSpriteHeight;
  this.animationContext = this.animationCanvas.getContext('2d');
}

Animation.prototype.rotate = function rotate(degrees) {
  this.animationContext.translate(this.animationCanvas.width / 2, this.animationCanvas.height / 2);
  // Convert degrees to rotations
  this.animationContext.rotate(degrees * Math.PI / 180);
  this.animationContext.translate(-this.animationCanvas.width / 2, -this.animationCanvas.height / 2);

  // console.log('width: ' + this.animationCanvas.width);
};

Animation.prototype.drawFrame = function drawFrame(tick, ctx, x, y) {
  // Create a new canvas for the sprite
  // const rotatedSprite = new Entity().rotateAndCache(this.spriteSheet, this.rotation);

  this.elapsedTime += tick;
  if (this.isDone()) {
    if (this.loop) this.elapsedTime -= this.totalTime;
  }
  const frame = this.currentFrame();
  let xindex = 0;
  let yindex = 0;
  xindex = frame % this.sheetWidth;
  yindex = Math.floor(frame / this.sheetWidth);
  this.animationContext.clearRect(0, 0, this.animationCanvas.width, this.animationCanvas.height);

  this.animationContext.drawImage(this.spriteSheet,
    xindex * this.frameWidth, yindex * this.frameHeight, // source from sheet
    this.frameWidth, this.frameHeight,
    this.animationCanvas.width * this.margin,
    this.animationCanvas.height * this.margin,
    this.animationCanvas.width - 2 * this.animationCanvas.width * this.margin,
    this.animationCanvas.height - 2 * this.animationCanvas.height * this.margin);

  // UNCOMMENT TO SEE CANVAS BOUNDING BOX
  // this.animationContext.strokeStyle = 'red';
  // this.animationContext.strokeRect(0, 0, this.animationCanvas.width, this.animationCanvas.height);
  // this.animationContext.strokeRect(this.animationCanvas.width * this.margin,
  //   this.animationCanvas.height * this.margin,
  //   this.animationCanvas.width - 2 * this.animationCanvas.width * this.margin,
  //   this.animationCanvas.height - 2 * this.animationCanvas.height * this.margin);

  ctx.drawImage(this.animationCanvas,
    x, y,
    this.frameWidth * this.scale,
    this.frameHeight * this.scale);

  // console.log(this.frameWidth * this.scale);

  // // Draw the canvas we manipulated
  // ctx.drawImage(this.animationCanvas,
  //   x, y,
  //   , );

  // console.log(this.animationContext);
};

Animation.prototype.currentFrame = function currentFrame() {
  return Math.floor(this.elapsedTime / this.frameDuration);
};

Animation.prototype.isDone = function isDone() {
  return (this.elapsedTime >= this.totalTime);
};

function Direction(up, right, down, left) {
  this.up = up;
  this.right = right;
  this.down = down;
  this.left = left;
  this.arrayForm = [up, right, down, left];
}

Direction.prototype.turn45Left = function turn45Left() {
  let turned = false;

  // Handle case where we are travelling at a 45 degree angle
  for (let i = 0; i < 3; i += 1) {
    if (this.arrayForm[i] && this.arrayForm[i + 1]) {
      turned = true;
      this.arrayForm[i + 1] = false;
    }
  }
  // end case (simulating a wrapped array)
  if (this.arrayForm[3] && this.arrayForm[0]) {
    turned = true;
    this.arrayForm[0] = false;
  }

  if (!turned) {
    // Handle case where travelling vertical/horizontal
    for (let i = 1; i < 4; i += 1) {
      if (this.arrayForm[i]) {
        turned = true;
        this.arrayForm[i - 1] = true;
      }
    }
    // end case (simulating a wrapped array)
    if (!turned && this.arrayForm[0]) {
      turned = true;
      this.arrayForm[3] = true;
    }
  }

  // update fields
  this.up = this.arrayForm[0];
  this.right = this.arrayForm[1];
  this.down = this.arrayForm[2];
  this.left = this.arrayForm[3];
};

// PathEntity is an Entity that provides robust screen pathing support for any entities
// that inherit it.
function PathEntity(game, x, y, direction, path, initialDelay) {
  // Default direction is down right at speed 100.
  this.currentDirection = direction;
  this.initialDelay = initialDelay;
  // this.pathCopy = path.slice();
  this.dx = 0;
  this.dy = 0;
  this.isPathing = false;
  this.followingSegment = false;
  Entity.call(this, game, x, y);
}

PathEntity.prototype = new Entity();
PathEntity.prototype.constructor = PathEntity;

PathEntity.prototype.update = function update() {
  if (this.initialDelay) {
    this.initialDelay -= 1;
  } else {
    // This could be much cleaner
    // note: the length of the legs of the right triangle is about this.speed * sqrt 2/ 2
    if (this.currentDirection.right) {
      this.dx = this.speed;
    }
    if (this.currentDirection.left) {
      this.dx = -this.speed;
    }
    if (this.currentDirection.up) {
      this.dy = -this.speed;
    }
    if (this.currentDirection.down) {
      this.dy = this.speed;
    }
    this.dy *= this.game.clockTick;
    this.dx *= this.game.clockTick;

    // console.log(`updating ${  this.speed  } ${  this.dx  } ${  this.target}`);

    // if (this.path.length !== 0) {
    if (!this.followingSegment) {
      if (this.pathCopy.length === 0) {
        // this.pathCopy = this.path.slice();
      } else {
        this.currentSegment = this.pathCopy.shift();
        // console.log(this.currentSegment);
        if (this.currentSegment.turnLeft) {
          this.animation.rotate(-this.currentSegment.turnLeft);
          this.currentDirection.turn45Left();
          // console.log(this.currentDirection.arrayForm);
          // rotating messes up values with rounding errors, fix this
        } else if (this.currentSegment.forward) {
          const distance = this.currentSegment.forward;
          const sqrt2over2 = Math.sqrt(2) / 2;
          let targetSet = false;
          this.followingSegment = true;
          if (this.currentDirection.right) {
          // handle straight right case
            this.target = this.x + distance;
            targetSet = true;
            // overwrite with diagonal case if applicable
            if (this.currentDirection.up || this.currentDirection.down) {
              this.target = this.x + sqrt2over2 * distance;
            }
          }
          if (!targetSet && this.currentDirection.left) {
          // handle straight right case
            this.target = this.x - distance;
            targetSet = true;
            // overwrite with diagonal case if applicable
            if (this.currentDirection.up || this.currentDirection.down) {
              this.target = this.x - sqrt2over2 * distance;
            }
          }
          if (!targetSet) {
          // must be going straight up or straight down
            if (this.currentDirection.up) {
              this.target = this.y - distance;
            } else {
            // going down
              this.target = this.y + distance;
            }
          }

          // console.log(this.target);

        // super temporary
        // this.target = this.x + this.currentSegment.forward;
        // console.log('should have started again '+this.target);
        }
      }
    } else {
    // Following a segment
    // Increment
      this.x += this.dx;
      this.y += this.dy;
      // Check to see if we made it.

      if (this.currentDirection.right && this.x >= this.target) {
        this.followingSegment = false;
        // console.log(`currentDirection is right and ${this.x } >= ${this.target}`);
      } else if (this.currentDirection.left && this.x <= this.target) {
        this.followingSegment = false;
        // console.log(`currentDirection is left and ${this.x } <= ${this.target}`);
      }
      if (this.currentDirection.down && !this.currentDirection.right && !this.currentDirection.left && this.y >= this.target) {
        this.followingSegment = false;
        // console.log(`currentDirection is down and ${this.y } >= ${this.target}`);
      } else if (this.currentDirection.up && !this.currentDirection.right && !this.currentDirection.left && this.y <= this.target) {
        this.followingSegment = false;
        // console.log(`currentDirection is up and ${this.y } <= ${this.target}`);
      }
    }
    // }
    Entity.prototype.update.call(this);
  }
};

PathEntity.prototype.draw = function draw() {
  Entity.prototype.draw.call(this);
};

PathEntity.prototype.loadRoute = function loadRoute(path) {
  this.pathCopy = path.slice();
};

PathEntity.prototype.startPath = function startPath() {
  this.isPathing = true;
};


function Plane(game, spritesheet, x, y, path, delay) {
  this.animation = new Animation(spritesheet, 300, 330, 8, 0.10, 1, true, 0.25, 0.15);
  this.ctx = game.ctx;
  this.speed = 100;
  this.pathCopy = path.slice();

  // console.log(this.pathCopy);

  // All planes start upright, so always use that direction
  PathEntity.call(this, game, x, y, new Direction(true, false, false, false), path, delay);
}

Plane.prototype = new PathEntity();
Plane.prototype.constructor = Plane;

Plane.prototype.update = function update() {
  if (!this.isPathing) {
    // Load the path
    // this.loadRoute(this.path);
    this.startPath();
  }

  PathEntity.prototype.update.call(this);
  // this.x += this.game.clockTick * this.speed;
  // this.y -= this.game.clockTick * this.speed;
  // // if (this.x > 800) this.x = -50;
  // if (this.y < -this.animation.animationCanvas.height) {
  //   this.y = 500;
  //   this.x = -this.animation.animationCanvas.width;
  // }
};

Plane.prototype.draw = function draw() {
  this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
  PathEntity.prototype.draw.call(this);
};

// no inheritance
// function Background(game, spritesheet) {
//     this.x = 0;
//     this.y = 0;
//     this.spritesheet = spritesheet;
//     this.game = game;
//     this.ctx = game.ctx;
// };

// Background.prototype.draw = function () {
//     this.ctx.drawImage(this.spritesheet,
//                    this.x, this.y);
// };

// Background.prototype.update = function () {
// };


// function MushroomDude(game, spritesheet) {
//   this.animation = new Animation(spritesheet, 189, 230, 0, 5, 0.10, 14, true, 1);
//   this.x = 0;
//   this.y = 0;
//   this.speed = 100;
//   this.game = game;
//   this.ctx = game.ctx;
// }

// MushroomDude.prototype.draw = function draw() {
//   this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
// };

// MushroomDude.prototype.update = function update() {
//   if (this.animation.elapsedTime < this.animation.totalTime * 8 / 14) {
//     this.x += this.game.clockTick * this.speed;
//   }
//   if (this.x > 800) this.x = -230;
// };


// inheritance
// function Cheetah(game, spritesheet) {
//   this.animation = new Animation(spritesheet, 512, 256, 0, 2, 0.05, 8, true, 0.5);
//   this.speed = 350;
//   this.ctx = game.ctx;
//   Entity.call(this, game, 0, 250);
// }

// Cheetah.prototype = new Entity();
// Cheetah.prototype.constructor = Cheetah;

// Cheetah.prototype.update = function update() {
//   this.x += this.game.clockTick * this.speed;
//   if (this.x > 800) this.x = -230;
//   Entity.prototype.update.call(this);
// };

// Cheetah.prototype.draw = function draw() {
//   this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
//   Entity.prototype.draw.call(this);
// };


// inheritance
// function Guy(game, spritesheet) {
//   this.animation = new Animation(spritesheet, 154, 215, 0, 4, 0.15, 8, true, 0.5);
//   this.speed = 100;
//   this.ctx = game.ctx;
//   Entity.call(this, game, 0, 450);
// }

// Guy.prototype = new Entity();
// Guy.prototype.constructor = Guy;

// Guy.prototype.update = function update() {
//   this.x += this.game.clockTick * this.speed;
//   if (this.x > 800) this.x = -230;
//   Entity.prototype.update.call(this);
// };

// Guy.prototype.draw = function draw() {
//   this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
//   Entity.prototype.draw.call(this);
// };

// AM.queueDownload('./img/RobotUnicorn.png');
// AM.queueDownload('./img/guy.jpg');
// AM.queueDownload('./img/mushroomdude.png');
// AM.queueDownload('./img/runningcat.png');
// AM.queueDownload('./img/background.jpg');
AM.queueDownload('./img/red_plane.png');
AM.queueDownload('./img/purple_plane.png');

AM.downloadAll(() => {
  const canvas = document.getElementById('gameWorld');
  const ctx = canvas.getContext('2d');

  const gameEngine = new GameEngine();
  gameEngine.init(ctx);
  gameEngine.start();

  // Some simple paths
  const leftToRightCircle = [];
  leftToRightCircle.push({ turnLeft: 45 });
  leftToRightCircle.push({ turnLeft: 45 });
  leftToRightCircle.push({ turnLeft: 45 });
  leftToRightCircle.push({ turnLeft: 45 });
  leftToRightCircle.push({ turnLeft: 45 });
  leftToRightCircle.push({ turnLeft: 45 });
  leftToRightCircle.push({ forward: 500 });
  leftToRightCircle.push({ turnLeft: 45 });
  leftToRightCircle.push({ forward: 100 });
  leftToRightCircle.push({ turnLeft: 45 });
  leftToRightCircle.push({ forward: 100 });
  leftToRightCircle.push({ turnLeft: 45 });
  leftToRightCircle.push({ forward: 100 });
  leftToRightCircle.push({ turnLeft: 45 });
  leftToRightCircle.push({ forward: 100 });
  leftToRightCircle.push({ turnLeft: 45 });
  leftToRightCircle.push({ forward: 100 });
  leftToRightCircle.push({ turnLeft: 45 });
  leftToRightCircle.push({ forward: 100 });
  leftToRightCircle.push({ turnLeft: 45 });
  leftToRightCircle.push({ forward: 100 });
  leftToRightCircle.push({ turnLeft: 45 });
  leftToRightCircle.push({ forward: 10000 });

  const rightToLeftCircle = [];
  rightToLeftCircle.push({ turnLeft: 45 });
  rightToLeftCircle.push({ turnLeft: 45 });
  rightToLeftCircle.push({ forward: 500 });
  rightToLeftCircle.push({ turnLeft: 45 });
  rightToLeftCircle.push({ forward: 100 });
  rightToLeftCircle.push({ turnLeft: 45 });
  rightToLeftCircle.push({ forward: 100 });
  rightToLeftCircle.push({ turnLeft: 45 });
  rightToLeftCircle.push({ forward: 100 });
  rightToLeftCircle.push({ turnLeft: 45 });
  rightToLeftCircle.push({ forward: 100 });
  rightToLeftCircle.push({ turnLeft: 45 });
  rightToLeftCircle.push({ forward: 100 });
  rightToLeftCircle.push({ turnLeft: 45 });
  rightToLeftCircle.push({ forward: 100 });
  rightToLeftCircle.push({ turnLeft: 45 });
  rightToLeftCircle.push({ forward: 100 });
  rightToLeftCircle.push({ turnLeft: 45 });
  rightToLeftCircle.push({ forward: 10000 });

  const topToBottomCircle = [];
  topToBottomCircle.push({ turnLeft: 45 });
  topToBottomCircle.push({ turnLeft: 45 });
  topToBottomCircle.push({ turnLeft: 45 });
  topToBottomCircle.push({ turnLeft: 45 });
  topToBottomCircle.push({ forward: 500 });
  topToBottomCircle.push({ turnLeft: 45 });
  topToBottomCircle.push({ forward: 100 });
  topToBottomCircle.push({ turnLeft: 45 });
  topToBottomCircle.push({ forward: 100 });
  topToBottomCircle.push({ turnLeft: 45 });
  topToBottomCircle.push({ forward: 100 });
  topToBottomCircle.push({ turnLeft: 45 });
  topToBottomCircle.push({ forward: 100 });
  topToBottomCircle.push({ turnLeft: 45 });
  topToBottomCircle.push({ forward: 100 });
  topToBottomCircle.push({ turnLeft: 45 });
  topToBottomCircle.push({ forward: 100 });
  topToBottomCircle.push({ turnLeft: 45 });
  topToBottomCircle.push({ forward: 100 });
  topToBottomCircle.push({ turnLeft: 45 });
  topToBottomCircle.push({ forward: 10000 });

  const bottomToTopCircle = [];
  bottomToTopCircle.push({ forward: 500 });
  bottomToTopCircle.push({ turnLeft: 45 });
  bottomToTopCircle.push({ forward: 100 });
  bottomToTopCircle.push({ turnLeft: 45 });
  bottomToTopCircle.push({ forward: 100 });
  bottomToTopCircle.push({ turnLeft: 45 });
  bottomToTopCircle.push({ forward: 100 });
  bottomToTopCircle.push({ turnLeft: 45 });
  bottomToTopCircle.push({ forward: 100 });
  bottomToTopCircle.push({ turnLeft: 45 });
  bottomToTopCircle.push({ forward: 100 });
  bottomToTopCircle.push({ turnLeft: 45 });
  bottomToTopCircle.push({ forward: 100 });
  bottomToTopCircle.push({ turnLeft: 45 });
  bottomToTopCircle.push({ forward: 100 });
  bottomToTopCircle.push({ turnLeft: 45 });
  bottomToTopCircle.push({ forward: 10000 });

  const lowRightToTopLeft = [];
  lowRightToTopLeft.push({ turnLeft: 45 });
  lowRightToTopLeft.push({ forward: 10000 });
  
  const lowLeftToTopRight = [];
  lowLeftToTopRight.push({ turnLeft: 45 });
  lowLeftToTopRight.push({ turnLeft: 45 });
  lowLeftToTopRight.push({ turnLeft: 45 });
  lowLeftToTopRight.push({ turnLeft: 45 });
  lowLeftToTopRight.push({ turnLeft: 45 });
  lowLeftToTopRight.push({ turnLeft: 45 });
  lowLeftToTopRight.push({ turnLeft: 45 });
  lowLeftToTopRight.push({ forward: 10000 });
  
  // gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/background.jpg")));
  // gameEngine.addEntity(new MushroomDude(gameEngine, AM.getAsset("./img/mushroomdude.png")));
  // gameEngine.addEntity(new Cheetah(gameEngine, AM.getAsset("./img/runningcat.png")));
  // gameEngine.addEntity(new Guy(gameEngine, AM.getAsset("./img/guy.jpg")));
  for (let i = 0; i < 1000; i += 100) {
    gameEngine.addEntity(new Plane(gameEngine, AM.getAsset('./img/red_plane.png'), -100, 300, leftToRightCircle.slice(), i));
    gameEngine.addEntity(new Plane(gameEngine, AM.getAsset('./img/purple_plane.png'), -100, 300, leftToRightCircle.slice(), i + 50));
    
    gameEngine.addEntity(new Plane(gameEngine, AM.getAsset('./img/red_plane.png'), 800, 300, rightToLeftCircle.slice(), i));
    gameEngine.addEntity(new Plane(gameEngine, AM.getAsset('./img/purple_plane.png'), 800, 300, rightToLeftCircle.slice(), i + 50));
    
    gameEngine.addEntity(new Plane(gameEngine, AM.getAsset('./img/red_plane.png'), 300, -100, topToBottomCircle.slice(), i));
    gameEngine.addEntity(new Plane(gameEngine, AM.getAsset('./img/purple_plane.png'), 300, -100, topToBottomCircle.slice(), i + 50));
    
    gameEngine.addEntity(new Plane(gameEngine, AM.getAsset('./img/red_plane.png'), 300, 800, bottomToTopCircle.slice(), i));
    gameEngine.addEntity(new Plane(gameEngine, AM.getAsset('./img/purple_plane.png'), 300, 800, bottomToTopCircle.slice(), i + 50));
    
    // gameEngine.addEntity(new Plane(gameEngine, AM.getAsset('./img/red_plane.png'), -100, 800, lowLeftToTopRight.slice(), i));
    // gameEngine.addEntity(new Plane(gameEngine, AM.getAsset('./img/purple_plane.png'), -100, 800, lowLeftToTopRight.slice(), i + 50));
    
    // gameEngine.addEntity(new Plane(gameEngine, AM.getAsset('./img/red_plane.png'), 800, 800, lowRightToTopLeft.slice(), i));
    // gameEngine.addEntity(new Plane(gameEngine, AM.getAsset('./img/purple_plane.png'), 800, 800, lowRightToTopLeft.slice(), i + 50));
  }
  
  console.log('All Done!');
});
