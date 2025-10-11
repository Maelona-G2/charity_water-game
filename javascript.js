
// --- Board Game Logic ---
// Board grid: 10x10, path and obstacles defined by coordinates
const boardRows = 10;
const boardCols = 10;

// Path tiles (row, col) - these should match the path on your board.jpg
// Example path (customize as needed to match your image):
const pathTiles = [
	[9,0],[8,0],[7,0],[6,0],[5,0],[5,1],[5,2],[4,2],[3,2],[2,2],[2,3],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[7,5],[7,6],[6,6],[5,6],[4,6],[3,6],[2,6],[1,6],[1,7],[1,8],[2,8],[3,8],[4,8],[5,8],[6,8],[7,8],[8,8],[9,8]
];

// Obstacles (row, col)
const obstacles = {
	stick: [5,2], // first obstacle (stick over brown tile)
	tiger: [4,4], // second obstacle (tiger)
	third: [7,8]  // third obstacle (2 tiles from pond)
};

// End tile (pond)
const endTile = [9,8];

// Player state
let playerPos = { row: 9, col: 0 }; // Start position (customize as needed)

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
	playerDiv.style.borderRadius = '50%';
	playerDiv.style.background = 'orange';
	playerDiv.style.border = '3px solid #fff';
	// Position on grid
	playerDiv.style.left = (playerPos.col * 52) + 'px';
	playerDiv.style.top = (playerPos.row * 52) + 'px';
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
	gamearea.style.width = '520px';
	gamearea.style.height = '520px';
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
