


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
      if (!name) return;

      console.log('submit: name=', name);

      // Fade out the welcome header/subheading
      const welcome = document.getElementById('welcome');
      if (welcome) {
        welcome.classList.remove('visible');
        welcome.classList.add('hidden');
        // remove from layout after the fade duration (600ms)
        setTimeout(() => { welcome.style.display = 'none'; }, 700);
      }

      // Fade the form and then hide it after the same duration
      usernameForm.classList.remove('visible');
      usernameForm.classList.add('hidden');
      setTimeout(() => { usernameForm.style.display = 'none'; }, 700);

      // After a short delay (let the fade begin), show the greeting
      setTimeout(() => {
        console.log('showing greeting');
        greetingMessage.textContent = `Welcome to Carry the Jerry, ${name}!`;
        // ensure greeting is visible
        greetingMessage.style.display = 'block';
        greetingMessage.style.visibility = 'visible';
        greetingMessage.style.opacity = '1';
        greetingMessage.classList.remove('hidden');
        greetingMessage.classList.add('visible');
      }, 600);

      // Save name so UI persists across refreshes
      try { localStorage.setItem('cw_username', name); } catch (err) { console.warn(err); }

      // After 5 seconds from greeting, show instructions and buttons
      setTimeout(() => {
        console.log('showing instructions');
        instructionsSection.style.display = 'block';
        instructionsSection.style.visibility = 'visible';
        instructionsSection.style.opacity = '1';
        instructionsSection.classList.remove('hidden');
        instructionsSection.classList.add('visible');
      }, 5600);
    });
  }

function startGame() {
  alert("Game starting...");
  // Add your game logic here
}

  function showGame() {
    gameContainer.style.display = 'block';
    resetGameState();
  }
  if (newGameBtn) newGameBtn.addEventListener('click', showGame);
  if (restartBtn) restartBtn.addEventListener('click', showGame);

  // persist game visibility flag
  function setGameVisible(visible) {
    try { localStorage.setItem('cw_gameVisible', visible ? '1' : '0'); } catch (e) {}
  }
  if (newGameBtn) newGameBtn.addEventListener('click', () => setGameVisible(true));
  if (restartBtn) restartBtn.addEventListener('click', () => setGameVisible(true));

  // On load: restore username and whether the game was visible
  try {
    const savedName = localStorage.getItem('cw_username');
    const gameVisible = localStorage.getItem('cw_gameVisible') === '1';
    if (savedName) {
      // simulate that the form was submitted already and ensure visibility
      greetingMessage.textContent = `Welcome to Carry the Jerry, ${savedName}!`;
      greetingMessage.style.display = 'block';
      greetingMessage.style.visibility = 'visible';
      greetingMessage.style.opacity = '1';
      greetingMessage.classList.remove('hidden');
      greetingMessage.classList.add('visible');

      instructionsSection.style.display = 'block';
      instructionsSection.style.visibility = 'visible';
      instructionsSection.style.opacity = '1';
      instructionsSection.classList.remove('hidden');
      instructionsSection.classList.add('visible');

      // hide the form and welcome header
      if (usernameForm) usernameForm.style.display = 'none';
      const welcome = document.getElementById('welcome');
      if (welcome) welcome.style.display = 'none';
    }
    if (gameVisible) {
      gameContainer.style.display = 'block';
      resetGameState();
    }
  } catch (err) { console.warn(err); }

  // --- Board Game Logic ---
  // Match the CSS grid: 16 columns x 9 rows (tiles are 1-based indices in path data)
  const boardCols = 16;
  const boardRows = 9;
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
    // obstacles are now passable; keep the function for future use (e.g., penalties)
    return Object.values(obstacles).some(([c, r]) => c === col && r === row);
  }
  function isCheckpoint(col, row) {
    return checkpointTiles.some(([c, r]) => c === col && r === row);
  }

  function renderPlayer() {
    const playerDiv = document.getElementById('player');
    // style the player (size will be adjusted based on tile size)
    playerDiv.style.position = 'absolute';
    playerDiv.style.backgroundImage = "url('img/jerrycan.png')";
    playerDiv.style.backgroundSize = 'contain';
    playerDiv.style.backgroundRepeat = 'no-repeat';
    playerDiv.style.borderRadius = '8px';
    playerDiv.style.border = '2px solid #000';
    playerDiv.style.zIndex = 10;

    const board = document.getElementById('gameboard');
    if (!board) return;
    const rect = board.getBoundingClientRect();
    // compute tile size from the rendered board dimensions (1-based tile indices)
    const tileWidth = rect.width / boardCols;
    const tileHeight = rect.height / boardRows;

    // size the player relative to the tile (80%)
    const playerW = Math.round(tileWidth * 0.8);
    const playerH = Math.round(tileHeight * 0.8);
    playerDiv.style.width = playerW + 'px';
    playerDiv.style.height = playerH + 'px';

    // compute position using 1-based indices: (col-1, row-1)
    const left = (playerPos.col - 1) * tileWidth + (tileWidth - playerW) / 2;
    const top = (playerPos.row - 1) * tileHeight + (tileHeight - playerH) / 2;
    playerDiv.style.left = left + 'px';
    playerDiv.style.top = top + 'px';
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
    // only allow movement along defined path tiles
    if (!isPathTile(col, row)) return;
    // obstacles are passable now; keep detection for optional effects
    if (isObstacle(col, row)) {
      console.log('stepped on obstacle at', col, row);
      // could add penalty/animation here
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

  // Ensure the game area is positioned relative so player absolute positions are inside it
  const gamearea = document.getElementById('gamearea');
  if (gamearea) {
    gamearea.style.position = 'relative';
  }
  // render player after a short delay to allow CSS to lay out the board (safe across viewports)
  setTimeout(renderPlayer, 50);
  window.addEventListener('keydown', (e) => {
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
      movePlayer(e.key);
      e.preventDefault();
    }
  });
});


