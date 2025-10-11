
// --- Board Game Logic ---
// Board grid: 10x10, path and obstacles defined by coordinates
const boardRows = 10;
const boardCols = 10;

// Path tiles (row, col) - these should match the path on your board.jpg
// Example path (customize as needed to match your image):
const pathTiles = [
	[1,5],[1,6],[1,7],[1,8],[1,9],[2,9],[3,9],[3,8],[3,7],[3,6],[3,5],[4,5],[5,5],[5,6],[5,7],[6,6],[6,7],[6,8],[7,8],[8,8],[8,7],[8,6],[8,5],[8,4],[9,4],[10,4],[10,5],[10,6],[10,7],[10,8],[10,9],[11,9],[12,9],[12,8],[12,7],[12,6],[13,6],[14,6],[14,7],[14,8],[14,9],[15,9],[16,9],[16,8],[16,7],[16,6]
];

// Obstacles (row, col)
const obstacles = {
	stick: [4,5], // first obstacle (stick over brown tile)
	tiger: [10,5], // second obstacle (tiger)
	third: [16,7]  // third obstacle (1 tiles from pond)
};

// End tile (pond)
const endTile = [16,6];

// Player state
let playerPos = { row: 5, col: 1 }; // Start position (in front of house)

function isPathTile(row, col) {
	return pathTiles.some(([r, c]) => r === row && c === col);
}
function isObstacle(row, col) {
	return Object.values(obstacles).some(([r, c]) => r === row && c === col);
}

function renderPlayer() {
	const playerDiv = document.getElementById('player');
	playerDiv.style.position = 'absolute';
	playerDiv.style.width = '40px';
	playerDiv.style.height = '40px';
	playerDiv.style.backgroundImage = "url('img/jerrycan.png')";
	playerDiv.style.backgroundSize = 'cover';
	playerDiv.style.backgroundRepeat = 'no-repeat';
	playerDiv.style.borderRadius = '8px';
	playerDiv.style.border = '2px solid #000';
	// Position on grid (match #gameboard 10x10, 50px per tile, 2px gap)
	playerDiv.style.left = (playerPos.col * 60) + 'px';
	playerDiv.style.top = (playerPos.row * 60) + 'px';
	playerDiv.style.zIndex = 10;
}

function movePlayer(dir) {
	let { row, col } = playerPos;
	if (dir === 'ArrowUp') row--;
	if (dir === 'ArrowDown') row++;
	if (dir === 'ArrowLeft') col--;
	if (dir === 'ArrowRight') col++;
	// Check bounds
	if (row < 0 || row >= boardRows || col < 0 || col >= boardCols) return;
	// Check path
	if (!isPathTile(row, col)) return;
	// Check obstacle
	if (isObstacle(row, col)) {
		alert('Obstacle! Cannot move here.');
		return;
	}
	playerPos = { row, col };
	renderPlayer();
	// Check win
	if (row === endTile[0] && col === endTile[1]) {
		setTimeout(() => alert('You reached the pond!'), 100);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	// Set gamearea to relative for absolute positioning
	const gamearea = document.getElementById('gamearea');
	gamearea.style.position = 'relative';
	gamearea.style.width = '600px';
	gamearea.style.height = '600px';
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
