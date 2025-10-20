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
  // Tiles are stored as [row, col]
  let checkpointTiles = [ [5,7], [8,6], [16,7] ]; // Example checkpoint tiles (row,col)

  function resetGameState() {
    // playerPos uses { row, col }
    playerPos = { row: 5, col: 1 };
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
  let pathTiles = [
  [1,4],[1,5],[1,6],[1,7],[1,8],[2,8],[3,8],[3,7],[3,6],[3,4],[4,4],[5,4],[5,5],[6,5],[6,6],[6,7],[7,7],[8,7],[8,6],[8,5],[8,4],[8,3],[9,3],[10,3],[10,4],[10,5],[10,6],[10,7],[10,8],[11,8],[12,8],[12,7],[12,6],[12,5],[13,5],[14,5],[14,6],[14,7],[15,7],[16,7],[16,6],[16,5],[16,4]
  ];
  // Data was originally stored as [col,row] — convert to [row,col]
  pathTiles = pathTiles.map(([a,b]) => [b,a]);
  const obstacles = {
    // coordinates are [row, col]
    // original user positions were given as [col,row] (4,5), (10,5), (16,7)
    // converted to [row,col] they become [5,4], [5,10], [7,16]
    stick: [5,4],
    tiger: [5,10],
    third: [7,16]
  };
  // obstacle configuration for matching game: pairs target and allowed wrongs
  const obstacleConfig = {
    stick: { pairs: 3, // 3 pairs -> 6 cards
             wrongsAllowed: 1,
             name: 'Stick' },
    tiger: { pairs: 4, // 4 pairs -> 8 cards
             wrongsAllowed: 2,
             name: 'Tiger' },
    third: { pairs: 6, // 6 pairs -> 12 cards
             wrongsAllowed: 3,
             name: 'Third Obstacle' }
  };
  // track if obstacle cleared
  const obstacleState = {
    stick: { cleared: false },
    tiger: { cleared: false },
    third: { cleared: false }
  };

  // color palette for card variants (index -> color class)
  const cardColors = [
    'yellow','blue','purple','red','pink','orange','green','white','black','gray','teal','brown'
  ];

  // modal elements
  const obstacleModal = document.getElementById('obstacle-modal');
  const obstacleTitle = document.getElementById('obstacle-title');
  const obstacleInstructions = document.getElementById('obstacle-instructions');
  const obstacleCards = document.getElementById('obstacle-cards');
  const matchedCountEl = document.getElementById('matched-count');
  const matchedTargetEl = document.getElementById('matched-target');
  const wrongCountEl = document.getElementById('wrong-count');
  const obstacleRetry = document.getElementById('obstacle-retry');
  const obstacleGiveUp = document.getElementById('obstacle-giveup');

  let currentObstacle = null;
  let deck = [];
  let revealed = []; // indices of currently revealed cards
  let matched = new Set();
  let wrongs = 0;

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function buildDeck(pairs) {
    // build 'pairs' pairs of colored jerrycan cards
    const cards = [];
    for (let i = 0; i < pairs; i++) {
      const color = cardColors[i % cardColors.length];
      // two copies for a pair
      cards.push({ id: i, color });
      cards.push({ id: i, color });
    }
    shuffle(cards);
    return cards;
  }

  function openObstacleModal(key, prevPos) {
    currentObstacle = { key, prevPos };
    const cfg = obstacleConfig[key];
    if (!cfg) return;
    matched.clear();
    revealed = [];
    wrongs = 0;
    deck = buildDeck(cfg.pairs);
    // render modal
    if (obstacleTitle) obstacleTitle.textContent = `Obstacle: ${cfg.name}`;
    if (matchedCountEl) matchedCountEl.textContent = '0';
    if (matchedTargetEl) matchedTargetEl.textContent = String(cfg.pairs);
    if (wrongCountEl) wrongCountEl.textContent = '0';
    if (obstacleCards) {
      obstacleCards.innerHTML = '';
      deck.forEach((card, idx) => {
        const d = document.createElement('div');
        d.className = 'card';
        d.dataset.index = idx;

        // inner container
        const inner = document.createElement('div');
        inner.className = 'card-inner';

        // back face (face-down)
        const back = document.createElement('div');
        back.className = 'card-face card-back';
        back.textContent = '';

        // front face (revealed) - jerrycan image
        const front = document.createElement('div');
        front.className = 'card-face card-front';
        front.style.backgroundColor = card.color || 'yellow';
        const img = document.createElement('img');
        img.src = 'img/jerrycan.png';
        img.alt = 'card';
        front.appendChild(img);

        inner.appendChild(back);
        inner.appendChild(front);
        d.appendChild(inner);

        d.addEventListener('click', () => handleCardClick(idx));
        obstacleCards.appendChild(d);
      });
    }
    // show modal
    if (obstacleModal) obstacleModal.style.display = 'flex';
  }

  function closeObstacleModal() {
    if (obstacleModal) obstacleModal.style.display = 'none';
    currentObstacle = null;
    deck = [];
    revealed = [];
    matched.clear();
  }

  function handleCardClick(index) {
    if (matched.has(index)) return;
    if (revealed.includes(index)) return;
    revealed.push(index);
    const cardEl = obstacleCards.querySelector(`.card[data-index="${index}"]`);
    if (cardEl) cardEl.classList.add('flipped');
    if (revealed.length === 2) {
      // check match
      const [a, b] = revealed;
      tryMatch(a, b);
    }
  }

  function tryMatch(aIdx, bIdx) {
    const a = deck[aIdx];
    const b = deck[bIdx];
    if (!a || !b) return;
    if (a.id === b.id) {
      // matched
      matched.add(aIdx);
      matched.add(bIdx);
      matchedCountEl.textContent = String(matched.size / 2);
      // keep them flipped and disabled
      [aIdx, bIdx].forEach(i => {
        const el = obstacleCards.querySelector(`.card[data-index="${i}"]`);
        if (el) el.classList.add('disabled');
      });
      revealed = [];
      // success condition
      const cfg = obstacleConfig[currentObstacle.key];
      if ((matched.size / 2) >= cfg.pairs) {
        // cleared
        obstacleState[currentObstacle.key].cleared = true;
        closeObstacleModal();
      }
    } else {
      // wrong
      wrongs++;
      wrongCountEl.textContent = String(wrongs);
      // flip back after short delay
      setTimeout(() => {
        // re-enable the two cards
        revealed.forEach(idx => {
          const el = obstacleCards.querySelector(`.card[data-index="${idx}"]`);
          if (el) {
            el.classList.remove('flipped');
            el.classList.remove('disabled');
          }
        });
        revealed = [];
      }, 600);
      const cfg = obstacleConfig[currentObstacle.key];
      if (wrongs > cfg.wrongsAllowed) {
        // failure -> move player back to previous tile and close modal
        const prev = currentObstacle.prevPos;
        playerPos = prev;
        renderPlayer();
        closeObstacleModal();
      }
    }
  }

  if (obstacleRetry) obstacleRetry.addEventListener('click', () => {
    // rebuild deck and reset counts
    if (!currentObstacle) return;
    const cfg = obstacleConfig[currentObstacle.key];
    deck = buildDeck(cfg.pairs);
    matched.clear();
    revealed = [];
    wrongs = 0;
    matchedCountEl.textContent = '0';
    wrongCountEl.textContent = '0';
    // re-render cards
    if (obstacleCards) {
      obstacleCards.innerHTML = '';
      deck.forEach((card, idx) => {
        const d = document.createElement('div');
        d.className = 'card';
        d.dataset.index = idx;
        const img = document.createElement('img');
        img.src = 'img/jerrycan.png';
        img.alt = 'card';
        d.style.backgroundColor = card.color || 'yellow';
        d.appendChild(img);
        d.addEventListener('click', () => handleCardClick(idx));
        obstacleCards.appendChild(d);
      });
    }
  });

  if (obstacleGiveUp) obstacleGiveUp.addEventListener('click', () => {
    // give up: send player back to previous tile and close
    if (!currentObstacle) return;
    const prev = currentObstacle.prevPos;
    playerPos = prev;
    renderPlayer();
    closeObstacleModal();
  });
  const endTile = [5,16]; // [row, col] (swapped from original)
  // playerPos uses { row, col }
  let playerPos = { row: 5, col: 1 };

  // note: arrays are [row, col]
  function isPathTile(row, col) {
    return pathTiles.some(([r, c]) => r === row && c === col);
  }
  function isObstacle(row, col) {
    // obstacles are now passable; keep the function for future use (e.g., penalties)
    return Object.values(obstacles).some(([r, c]) => r === row && c === col);
  }
  // find obstacle key by position (row,col)
  function obstacleKeyAt(row, col) {
    for (const k of Object.keys(obstacles)) {
      const [r, c] = obstacles[k];
      if (r === row && c === col) return k;
    }
    return null;
  }
  function isCheckpoint(row, col) {
    return checkpointTiles.some(([r, c]) => r === row && c === col);
  }

  // Movement configuration: set to false to allow full free movement across the board
  let restrictToPath = false;

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
    let { row, col } = playerPos;
    if (dir === 'ArrowUp') row--;
    if (dir === 'ArrowDown') row++;
    if (dir === 'ArrowLeft') col--;
    if (dir === 'ArrowRight') col++;
  // board uses 1-based tile indices: rows 1..boardRows, cols 1..boardCols
  if (row < 1 || row > boardRows || col < 1 || col > boardCols) return;
  // optionally restrict movement to defined path tiles
  if (restrictToPath && !isPathTile(row, col)) return;
    // obstacles are passable now; but trigger obstacle modal if present and not yet cleared
    const key = obstacleKeyAt(row, col);
    if (key && !obstacleState[key].cleared) {
      // move into tile visually then open modal for matching game
      const prevPos = { ...playerPos };
      playerPos = { row, col };
      renderPlayer();
      console.log('trigger obstacle', key);
      openObstacleModal(key, prevPos);
      return;
    }
    // Start timer on first move
    if (!started) {
      started = true;
      startTimer();
    }
    // Checkpoint logic
    if (isCheckpoint(row, col)) {
      // Only count if not already reached
      if (checkpointsReached < checkpointTiles.length &&
          (col !== playerPos.col || row !== playerPos.row)) {
        checkpointsReached++;
        if (checkpointsDisplay) checkpointsDisplay.textContent = `${checkpointsReached}/3`;
        if (levelDisplay) levelDisplay.textContent = String(checkpointsReached+1);
      }
    }
    playerPos = { row, col };
    renderPlayer();
    if (row === endTile[0] && col === endTile[1]) {
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


