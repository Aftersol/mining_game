/*

  https://editor.p5js.org/gwong31/sketches/85tpYAdpQ
*/

player = {
  x: 9,
  y: 0,
  hasTreasure: false,
};

treasure = {
  x: rand(18) + 1,
  y: rand(14) + 1,
  isVisible: true,
};

direction = {
  NORTH: 0,
  SOUTH: 1,
  WEST: 2,
  EAST: 3,
};

hazardType = {
  BOULDER: 0,
  BOMB: 1,
};

class hazard {
  x;
  y;
  type;

  draw() {
    switch (this.type) {
      case hazardType.BOULDER: {
        image(boulderImage, this.x * tileSize, this.y * tileSize, tileSize);
        break;
      }
      case hazardType.BOMB: {
        image(bombImage, this.x * tileSize, this.y * tileSize, tileSize);
        break;
      }
      default:
        break;
    }
  }

  // checks if the position of an object is the same as the position of a hazard object
  isInSamePosition(myX, myY) {
    return myX === this.x && myY === this.y;
  }

  constructor(newX, newY, newType) {
    this.x = newX;
    this.y = newY;
    this.type = newType;
  }
}

class tile {
  type;
  breakCount; // counts how much of mining action until a block breaks

  setType(newType) {
    this.type = newType;
  }

  getType() {
    return this.type;
  }

  breakBlock() {
    this.breakCount--;
    if (this.breakCount > 0) { // break the block by switching the block to void
      this.type = tileType.TILE_VOID;
      //dirtBreak[rand(4)].play(); // play one of the four dirt breaking sounds
    }
  }

  changeTile(newType) {
    this.type = newType;
  }
  constructor(newType) {
    this.breakCount = 2;
    this.type = newType;
  }
}

tileType = {
  TILE_VOID: 0,
  TILE_WALL: 1,
  TILE_BREAKABLE: 2,
};

// set the resolution of the screen rounded to the tile size
screenRes = {
  w: 640,
  h: 512,
};

var timer = 0;
var timeLimit = 10;
var lavaLevel = 30;

var dirtImage;
var brickImage;
var instructionImage;

var dirtBreak;
var lavaWarningMusic;

const tileSize = 32;
var numCols = screenRes.w / tileSize;
var numRows = screenRes.h / tileSize;

var tiles = new Array(numCols * numRows);

var hazards = new Array(75);

var drawGame = function () {};
var getKeyCode = function () {};

var currMaxTime = 30;
var hazardGenBiasedBombNum = 7;

function clearTiles() {
  // fill every tiles with breakable tiles
  /*for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < numRows; row++) {
      tiles[row * numRows + col] = new tile(tileType.TILE_BREAKABLE);
    }
  }*/

  //tiles.fill(new tile(tileType.TILE_BREAKABLE));

  for (let i = 0; i < tiles.length; i++) {
    tiles[i] = new tile(tileType.TILE_BREAKABLE);
  }

  // Fill surface with void tiles
  for (let col = 0; col < numCols; col++) {
    tiles[col].setType(tileType.TILE_VOID);
  }
}

function fillBorders() {
  // Fill bottom wall
  for (let col = 0; col < numCols; col++) {
    tiles[(numRows - 1) * numCols + col].setType(tileType.TILE_WALL);
  }

  // Fill sides of wall
  for (let row = 1; row < numRows; row++) {
    tiles[row * numCols].setType(tileType.TILE_WALL);
    tiles[row * numCols + numCols - 1].setType(tileType.TILE_WALL);
  }
}

function playerTouchingWall(dir) {
  switch (dir) {
    case direction.NORTH: {
      if (player.y < 1) {
        return true;
      }

      //console.log(tiles[numCols * (player.y - 1) + player.x]);
      //console.log(numCols * (player.y - 1) + player.x);

      if (
        tiles[numCols * (player.y - 1) + player.x].getType() ===
        tileType.TILE_WALL
      ) {
        return true;
      } else if (
        tiles[numCols * (player.y - 1) + player.x].getType() ===
        tileType.TILE_BREAKABLE
      ) {
        tiles[numCols * (player.y - 1) + player.x].breakBlock();
        if (tiles[numCols * (player.y - 1) + player.x].breakCount > 0) {
          return true;
        }
      } else {
        let isBomb = false;
        let isHazard = false;
        for (let i = 0; i < hazards.length; i++) {
          if (hazards[i].isInSamePosition(player.x, player.y - 1)) {
            isHazard = true;
            if (hazards[i].type === hazardType.BOMB) {
              isBomb = true;
            }
          }
        }
        
        if (isBomb) {
          displayEndScreen(false);
          //boomSound.play();
          return true;
        }
        
        if (isHazard) return true;
      }
      break;
    }
    case direction.SOUTH: {
      if (player.y > numRows - 1) {
        return true;
      }

      //console.log(tiles[numCols * (player.y + 1) + player.x]);
      //console.log(numCols * (player.y + 1) + player.x);

      if (
        tiles[numCols * (player.y + 1) + player.x].getType() ===
        tileType.TILE_WALL
      ) {
        return true;
      }
      // check if wall is breakable
      else if (
        tiles[numCols * (player.y + 1) + player.x].getType() ===
        tileType.TILE_BREAKABLE
      ) {
        tiles[numCols * (player.y + 1) + player.x].breakBlock();
        if (tiles[numCols * (player.y + 1) + player.x].breakCount > 0) {
          return true;
        }
      } else {
        let isBomb = false;
        let isHazard = false;
        for (let i = 0; i < hazards.length; i++) {
          if (hazards[i].isInSamePosition(player.x, player.y + 1)) {
            isHazard = true;
            if (hazards[i].type === hazardType.BOMB) {
              isBomb = true;
            }
          }
        } 
        if (isBomb) {
          displayEndScreen(false);
          //boomSound.play();
          return true;
        }
        if (isHazard) return true;
      }
      break;
    }
    case direction.WEST: {
      if (player.x <= 0) {
        return true;
      }

      //console.log(tiles[numCols * player.y + player.x - 1]);
      //console.log(numCols * player.y + player.x - 1);

      if (
        tiles[numCols * player.y + player.x - 1].getType() ===
        tileType.TILE_WALL
      ) {
        return true;
      } else if (
        tiles[numCols * player.y + player.x - 1].getType() ===
        tileType.TILE_BREAKABLE
      ) {
        tiles[numCols * player.y + player.x - 1].breakBlock();
        if (tiles[numCols * player.y + player.x - 1].breakCount > 0) {
          return true;
        }
      } else {
        let isBomb = false;
        let isHazard = false;
        for (let i = 0; i < hazards.length; i++) {
          if (hazards[i].isInSamePosition(player.x - 1, player.y)) {
            isHazard = true;
            if (hazards[i].type === hazardType.BOMB) {
              isBomb = true;
            }
          }
        }
        
        if (isBomb) {
          displayEndScreen(false);
          //boomSound.play();
          return true;
        }
        if (isHazard) return true;
      }
      break;
    }
    case direction.EAST: {
      if (player.x > numCols - 1) {
        return true;
      }

      //console.log(tiles[numCols * player.y + player.x + 1]);
      //console.log(numCols * player.y + player.x + 1);

      if (
        tiles[numCols * player.y + player.x + 1].getType() ===
        tileType.TILE_WALL
      ) {
        return true;
      } else if (
        tiles[numCols * player.y + player.x + 1].getType() ===
        tileType.TILE_BREAKABLE
      ) {
        tiles[numCols * player.y + player.x + 1].breakBlock();
        if (tiles[numCols * player.y + player.x + 1].breakCount > 0) {
          return true;
        }
      } else {
        let isBomb = false;
        let isHazard = false;
        for (let i = 0; i < hazards.length; i++) {
          if (hazards[i].isInSamePosition(player.x + 1, player.y)) {
            isHazard = true;
            if (hazards[i].type === hazardType.BOMB) {
              isBomb = true;
            }
          }
        }
        
        if (isBomb) {
          displayEndScreen(false);
          //boomSound.play();
          return true;
        }
        if (isHazard) return true;
      }

      break;
    }
    default: {
      break;
    }
  }

  return false;
}

function backToSurface() {
  return player.y === 0;
}

function keyPressed() {
  getKeyCode();
}

function generateHazards() {
  for (let i = 0; i < hazards.length; i++) {
    hazards[i] = new hazard(
      rand(18) + 1,
      rand(14) + 1,
      biasedRand() < hazardGenBiasedBombNum
        ? hazardType.BOMB
        : hazardType.BOULDER
    );
  }
}

function drawLevel() {
  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < numRows; row++) {
      if (tiles[numCols * row + col].getType() === tileType.TILE_VOID) {
        fill(0, 0, 0);
        square(col * tileSize, row * tileSize, tileSize);
      } else if (tiles[numCols * row + col].getType() === tileType.TILE_WALL) {
        fill(215, 215, 215);
        image(brickImage, col * tileSize, row * tileSize);
      } else {
        fill(255, 128, 128);
        image(dirtImage, col * tileSize, row * tileSize);
      }
    }
  }
}

function drawLava() {
  if (lavaLevel < numRows) {
    for (let col = 0; col < numCols; col++) {
      image(lavaTopImage, col * tileSize, lavaLevel * tileSize, tileSize);
    }
    for (let col = 0; col < numCols; col++)
      for (let row = lavaLevel + 1; row < numRows; row++) {
        image(lavaFullImage, col * tileSize, row * tileSize, tileSize);
      }
  }
}

function drawPlayer() {
  fill(255, 255, 255);
  image(playerImage, player.x * tileSize, player.y * tileSize, tileSize);
}

function drawTreasure() {
  fill(255, 255, 0);
  image(treasureImage, treasure.x * tileSize, treasure.y * tileSize, tileSize);
}
var isInLava = false;

function drawHazards() {
  for (let i = 0; i < hazards.length; i++) {
    hazards[i].draw();
  }
}

function buildMenu()
{
  drawGame = function () {
    drawMenu();
  };
  getKeyCode = function () {
    getMenuKeyCode(keyCode);
  };
}

function drawMenu() {
  image(instructionImage, 0, 0);
}


function displayEndScreen(won) {
  if (won) {
    //winnerSound.play();

    if (rand(2) === 0 && hazardGenBiasedBombNum <= 13) {
      console.log("More chances of bomb");

      hazardGenBiasedBombNum = min(14, hazardGenBiasedBombNum + 1);
    } else {
      console.log("Timer decremented");
      currMaxTime = max(5, currMaxTime - 1);
    }
    
  }
  drawGame = function () {
    drawEndScreen(won);
  };
  getKeyCode = function () {
    getEndScreenKeyCode(keyCode);
  };
  
  lavaWarningMusic.stop();
}

function drawEndScreen(won) {
  if (won) {
    background(51, 24, 0);
    image(youWonText, 320 - youWonText.width / 2, 120);
    image(fasterTimeText, 320 - fasterTimeText.width / 2, 200);
    image(resetInstructionText, 320 - resetInstructionText.width / 2, 320);
  } else {
    background(51, 24, 0);
    lavaLevel = 10;
    drawLava();
    image(youDiedText, 320 - youDiedText.width / 2, 120);
    image(resetInstructionText, 320 - resetInstructionText.width / 2, 240);
  }
}

function drawMainGame() {
  background(220);

  drawLevel();
  drawPlayer();
  //drawLava();

  if (player.x === treasure.x && player.y === treasure.y) {
    // remove treasure when the player grabs the treasure
    if (treasure.isVisible === true) {
      treasure.isVisible = false;
      player.hasTreasure = true;
      //interfaceSound.play();
      //interfaceSound.play();
    }
  }
  
  drawHazards();
  
  if (treasure.isVisible === true) {
    drawTreasure();
  }
  
  drawLava();
  
  if (player.y >= lavaLevel && isInLava === false) {
    //console.log("OH NOES! HE DED!");
    displayEndScreen(false);
    //aughSound.play();
    return;
    //buildGame();
  }

  timer = Math.min(timer + 1, timeLimit * 60 + Math.floor(numRows * 60));
  lavaLevel = Math.max(0, numRows + timeLimit - Math.floor(timer / 60));
  
  if (lavaLevel < 21 && !lavaWarningMusic.isPlaying())
  {
    //lavaWarningMusic.play();
  }
  
  fill(255, 255, 255);
  textSize(32);
  text("Press R to reset", 32, 508);
}

function getGameKeyCode(myKeyCode) {
  switch (myKeyCode) {
    case LEFT_ARROW: {
      //if (player.x > 0)
      if (playerTouchingWall(direction.WEST) === false) {
        player.x -= 1;
      }

      break;
    }

    case RIGHT_ARROW: {
      //if (player.x < numCols-1)
      if (playerTouchingWall(direction.EAST) === false) {
        player.x += 1;
      }
      break;
    }

    case UP_ARROW: {
      //if (player.y > 0)
      if (playerTouchingWall(direction.NORTH) === false) {
        player.y -= 1;
      }
      break;
    }

    case DOWN_ARROW: {
      //if (player.y < numRows-1)
      if (playerTouchingWall(direction.SOUTH) === false) {
        player.y += 1;
      }
      break;
    }
    case 82: { // press r key to reset
      buildGame();
      break;
    }

    default: {
      break;
    }
  }

  if (backToSurface() && player.hasTreasure === true) {
    //console.log("BACK TO SURFACE");

    displayEndScreen(true);
    //buildGame();
  }
  //console.log(keyCode);
}
function getEndScreenKeyCode(myKeyCode) {
  switch (myKeyCode) {
    case 82: {
      buildGame();
      break;
    }
    case 32: { // Space
      //interfaceSound.play();
      buildGame();
      break;
    }
    default: {
      break;
    }
  }
}


function getMenuKeyCode(myKeyCode)
{
  if (myKeyCode === 32) // space
    //interfaceSound.play();
    buildGame();
}

function buildGame() {
  clearTiles();
  fillBorders();

  generateHazards();

  while (true) {
    let candidateX = rand(18) + 1;
    let candidateY = biasedRand() + 1;

    let i = 0;

    // check if the treasure is inside the hazard tile
    for (i = 0; i < hazards.length; i++) {
      if (hazards[i].isInSamePosition(candidateX, candidateY)) break;
    }

    // check if a treasure can be reached by a player
    if (
      i === hazards.length &&
      DFS(player.x, player.y, candidateX, candidateY) === true
    ) {
      treasure.x = candidateX;
      treasure.y = candidateY;
      break;
    }
  }
  
  // set the player starting position
  player.x = 9;
  player.y = 0;
  
  // set up treasure
  player.hasTreasure = false;
  treasure.isVisible = true;

  tiles[numCols * treasure.y + treasure.x].setType(tileType.TILE_VOID);

  // reset the timer
  timer = 0;
  timeLimit = currMaxTime;
  lavaLevel = 32;

  // set the draw and input functions
  drawGame = function () {
    drawMainGame();
  };
  getKeyCode = function () {
    getGameKeyCode(keyCode);
  };
}

function preload() {
  //soundFormats('mp3', 'ogg', 'wav')
  
  // load all the images needed for the game
  playerImage = loadImage("images/player.png");
  dirtImage = loadImage("images/dirt.png");
  brickImage = loadImage("images/brick.png");
  treasureImage = loadImage("images/treasure.png");
  lavaTopImage = loadImage("images/lava_top.png");
  lavaFullImage = loadImage("images/lava_full.png");
  boulderImage = loadImage("images/boulder.png");
  bombImage = loadImage("images/bomb.png");
  instructionImage = loadImage('images/instructions.png');
  
  // load text as an image
  youDiedText = loadImage("images/youDied.png");
  resetInstructionText = loadImage("images/resetInstruction.png");
  youWonText = loadImage("images/youWon.png");
  fasterTimeText = loadImage('images/fasterTime.png');
  
  // load sound
  //boomSound = loadSound('sounds/boom.wav');
  //aughSound = loadSound('sounds/augh.mp3');
  //winnerSound = loadSound('sounds/winner.mp3');
  
  //interfaceSound = loadSound('sounds/interface.mp3');
  
  //lavaWarningMusic = loadSound('sounds/one_winged_angel.mp3');
  
  // array used for randomizing dirt sounds
  /*dirtBreak = [
    loadSound('sounds/dirt0.mp3'),
    loadSound('sounds/dirt1.mp3'),
    loadSound('sounds/dirt2.mp3'),
    loadSound('sounds/dirt3.mp3')
  ];*/
}

function setup() {
  createCanvas(screenRes.w, screenRes.h);
  biasedWeightsGenerate(14);
  buildMenu();

  noStroke();
}

function draw() {
  drawGame();
}
