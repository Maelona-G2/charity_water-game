
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
