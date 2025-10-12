


// --- UI Logic for Username, Greeting, and Game Visibility ---
document.addEventListener('DOMContentLoaded', () => {
  // Username form logic
  const usernameForm = document.getElementById('username-form');
  const usernameInput = document.getElementById('username-input');
  const greetingMessage = document.getElementById('greeting-message');
  const instructionsSection = document.getElementById('instructions-section');
  const gameContainer = document.getElementById('game-container');
  const newGameBtn = document.getElementById('newgame-btn');
  const restartBtn = document.getElementById('restart-btn');
  const levelDisplay = document.getElementById('level');
  const timeDisplay = document.getElementById('time');
  const checkpointsDisplay = document.getElementById('checkpoints');

  let timer = null;
  let timeElapsed = 0;
  let started = false;
  let checkpointsReached = 0;
  let checkpointTiles = [ [5,7], [8,6], [13,6] ]; // Example checkpoint tiles (col,row)

  function resetGameState() {
    playerPos = { col: 1, row: 5 };
    timeElapsed = 0;
    started = false;
    checkpointsReached = 0;
    if (timer) clearInterval(timer);
    if (timeDisplay) timeDisplay.textContent = '00:00';
    if (levelDisplay) levelDisplay.textContent = '1';
    if (checkpointsDisplay) checkpointsDisplay.textContent = '0/3';
    renderPlayer();
  }

  if (usernameForm) {
    usernameForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = usernameInput.value.trim();
      if (name) {
        greetingMessage.textContent = `Welcome to Carry the Jerry, ${name}!`;
        greetingMessage.style.display = 'block';
        instructionsSection.style.display = 'block';
        usernameForm.style.display = 'none';
      }
    });
  }

  function showGame() {
    gameContainer.style.display = 'block';
    resetGameState();
  }
  if (newGameBtn) newGameBtn.addEventListener('click', showGame);
  if (restartBtn) restartBtn.addEventListener('click', showGame);

  // --- Board Game Logic ---
  const boardRows = 10;
  const boardCols = 17;
  const pathTiles = [
    [1,5],[1,6],[1,7],[1,8],[1,9],[2,9],[3,9],[3,8],[3,7],[3,6],[3,5],[4,5],[5,5],[5,6],[5,7],[6,6],[6,7],[6,8],[7,8],[8,8],[8,7],[8,6],[8,5],[8,4],[9,4],[10,4],[10,5],[10,6],[10,7],[10,8],[10,9],[11,9],[12,9],[12,8],[12,7],[12,6],[13,6],[14,6],[14,7],[14,8],[14,9],[15,9],[16,9],[16,8],[16,7],[16,6]
  ];
  const obstacles = {
    stick: [4,5],
    tiger: [10,5],
    third: [16,7]
  };
  const endTile = [16,6];
  let playerPos = { col: 1, row: 5 };

  function isPathTile(col, row) {
    return pathTiles.some(([c, r]) => c === col && r === row);
  }
  function isObstacle(col, row) {
    return Object.values(obstacles).some(([c, r]) => c === col && r === row);
  }
  function isCheckpoint(col, row) {
    return checkpointTiles.some(([c, r]) => c === col && r === row);
  }

  function renderPlayer() {
    const playerDiv = document.getElementById('player');
    playerDiv.style.position = 'absolute';
    playerDiv.style.width = '50px';
    playerDiv.style.height = '50px';
    playerDiv.style.backgroundImage = "url('img/jerrycan.png')";
    playerDiv.style.backgroundSize = 'contain';
    playerDiv.style.backgroundRepeat = 'no-repeat';
    playerDiv.style.borderRadius = '8px';
    playerDiv.style.border = '2px solid #000';
    const tileSize = 50;
    const tileGap = 2;
    playerDiv.style.left = (playerPos.col * tileSize + playerPos.col * tileGap) + 'px';
    playerDiv.style.top = (playerPos.row * tileSize + playerPos.row * tileGap) + 'px';
    playerDiv.style.zIndex = 10;
  }

  function startTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      timeElapsed++;
      if (timeDisplay) {
        const min = String(Math.floor(timeElapsed/60)).padStart(2,'0');
        const sec = String(timeElapsed%60).padStart(2,'0');
        timeDisplay.textContent = `${min}:${sec}`;
      }
    }, 1000);
  }

  function movePlayer(dir) {
    let { col, row } = playerPos;
    if (dir === 'ArrowUp') row--;
    if (dir === 'ArrowDown') row++;
    if (dir === 'ArrowLeft') col--;
    if (dir === 'ArrowRight') col++;
    if (row < 0 || row >= boardRows || col < 0 || col >= boardCols) return;
    if (!isPathTile(col, row)) return;
    if (isObstacle(col, row)) {
      alert('Obstacle! Cannot move here.');
      return;
    }
    // Start timer on first move
    if (!started) {
      started = true;
      startTimer();
    }
    // Checkpoint logic
    if (isCheckpoint(col, row)) {
      // Only count if not already reached
      if (checkpointsReached < checkpointTiles.length &&
          (col !== playerPos.col || row !== playerPos.row)) {
        checkpointsReached++;
        if (checkpointsDisplay) checkpointsDisplay.textContent = `${checkpointsReached}/3`;
        if (levelDisplay) levelDisplay.textContent = String(checkpointsReached+1);
      }
    }
    playerPos = { col, row };
    renderPlayer();
    if (col === endTile[0] && row === endTile[1]) {
      setTimeout(() => alert('You reached the pond!'), 100);
      if (timer) clearInterval(timer);
    }
  }

  // Set gamearea to relative for absolute positioning
  const gamearea = document.getElementById('gamearea');
  if (gamearea) {
    gamearea.style.position = 'relative';
    gamearea.style.width = (boardCols * 50 + boardCols * 2) + 'px';
    gamearea.style.height = (boardRows * 50 + boardRows * 2) + 'px';
  }
  renderPlayer();
  window.addEventListener('keydown', (e) => {
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
      movePlayer(e.key);
      e.preventDefault();
    }
  });
});

// --- Board Game Logic ---
// Board grid: 10x10, path and obstacles defined by coordinates
const boardRows = 10;
const boardCols = 17;

// Path tiles (col, row) - these should match the path on your board.jpg
// Example path (customize as needed to match your image):
const pathTiles = [
	[1,5],[1,6],[1,7],[1,8],[1,9],[2,9],[3,9],[3,8],[3,7],[3,6],[3,5],[4,5],[5,5],[5,6],[5,7],[6,6],[6,7],[6,8],[7,8],[8,8],[8,7],[8,6],[8,5],[8,4],[9,4],[10,4],[10,5],[10,6],[10,7],[10,8],[10,9],[11,9],[12,9],[12,8],[12,7],[12,6],[13,6],[14,6],[14,7],[14,8],[14,9],[15,9],[16,9],[16,8],[16,7],[16,6]
];

// Obstacles (col, row)
const obstacles = {
	stick: [4,5], // first obstacle (stick over brown tile)
	tiger: [10,5], // second obstacle (tiger)
	third: [16,7]  // third obstacle (1 tiles from pond)
};

// End tile (pond)
const endTile = [16,6];

// Player state
let playerPos = { col: 1, row: 5 }; // Start position (in front of house)

function isPathTile(col, row) {
  return pathTiles.some(([c, r]) => c === col && r === row);
}
function isObstacle(col, row) {
  return Object.values(obstacles).some(([c, r]) => c === col && r === row);
}

function renderPlayer() {
  const playerDiv = document.getElementById('player');
    playerDiv.style.position = 'absolute';
    playerDiv.style.width = '50px';
    playerDiv.style.height = '50px';
    playerDiv.style.backgroundImage = "url('img/jerrycan.png')";
    playerDiv.style.backgroundSize = 'contain';
    playerDiv.style.backgroundRepeat = 'no-repeat';
    playerDiv.style.borderRadius = '8px';
    playerDiv.style.border = '2px solid #000';
    // Position on grid (match #gameboard 10x10, 50px per tile, 2px gap)
    const tileSize = 50;
    const tileGap = 2;
    const tileSpacing = tileSize + tileGap;

    playerDiv.style.left = (playerPos.col * 50 + playerPos.col * 2) + 'px';
    playerDiv.style.top = (playerPos.row * 50 + playerPos.row * 2) + 'px';
    playerDiv.style.zIndex = 10;
}

function movePlayer(dir) {
  let { col, row } = playerPos;
  if (dir === 'ArrowUp') row--;
  if (dir === 'ArrowDown') row++;
  if (dir === 'ArrowLeft') col--;
  if (dir === 'ArrowRight') col++;
  // Check bounds
  if (row < 0 || row >= boardRows || col < 0 || col >= boardCols) return;
  // Check path
  if (!isPathTile(col, row)) return;
  // Check obstacle
  if (isObstacle(col, row)) {
    alert('Obstacle! Cannot move here.');
    return;
  }
  playerPos = { col, row };
  renderPlayer();
  // Check win
  if (col === endTile[0] && row === endTile[1]) {
    setTimeout(() => alert('You reached the pond!'), 100);
  }
}

document.addEventListener('DOMContentLoaded', () => {
	// Set gamearea to relative for absolute positioning
	const gamearea = document.getElementById('gamearea');
	gamearea.style.position = 'relative';
	gamearea.style.width = (boardCols * tileSpacing) + 'px';
	gamearea.style.height = (boardRows * tileSpacing) + 'px';
	// Render player
	renderPlayer();
	// Keyboard controls
	window.addEventListener('keydown', (e) => {
		if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
			movePlayer(e.key);
			e.preventDefault();
		}
	});
});
