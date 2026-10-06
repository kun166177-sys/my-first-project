const board = document.getElementById('game-board');
const ctx = board.getContext('2d');
const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('best-score');
const overlay = document.getElementById('overlay');
const overlayText = document.getElementById('overlay-text');
const startBtn = document.getElementById('start-btn');

const gridSize = 20;
const cellSize = board.width / gridSize;
let snake;
let direction;
let nextDirection;
let food;
let score;
let bestScore = Number(localStorage.getItem('snake-best-score') || 0);
let gameLoop;
let isRunning = false;

bestScoreEl.textContent = String(bestScore);

function setOverlay(message, buttonText, visible) {
  overlayText.textContent = message;
  startBtn.textContent = buttonText;
  overlay.classList.toggle('visible', visible);
}

function randomFoodPosition() {
  let newFood;

  do {
    newFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y));

  return newFood;
}

function updateScore() {
  scoreEl.textContent = String(score);
  bestScoreEl.textContent = String(bestScore);
}

function resetGame(initialDirection = { x: 1, y: 0 }) {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = initialDirection;
  nextDirection = initialDirection;
  score = 0;
  food = randomFoodPosition();
  updateScore();
  render();
}

function startGame(initialDirection = { x: 1, y: 0 }) {
  resetGame(initialDirection);
  isRunning = true;
  setOverlay('', '重新开始', false);
  clearInterval(gameLoop);
  gameLoop = setInterval(tick, 130);
}

function endGame() {
  isRunning = false;
  clearInterval(gameLoop);
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('snake-best-score', String(bestScore));
    bestScoreEl.textContent = String(bestScore);
  }
  setOverlay('游戏结束，按方向键再来一局', '再来一局', true);
}

function tick() {
  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  const hitWall =
    head.x < 0 ||
    head.x >= gridSize ||
    head.y < 0 ||
    head.y >= gridSize;

  const hitSelf = snake.some((segment) => segment.x === head.x && segment.y === head.y);

  if (hitWall || hitSelf) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1;
    food = randomFoodPosition();
    updateScore();

    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem('snake-best-score', String(bestScore));
      bestScoreEl.textContent = String(bestScore);
    }

    clearInterval(gameLoop);
    gameLoop = setInterval(tick, Math.max(60, 130 - score * 2));
  } else {
    snake.pop();
  }

  render();
}

function render() {
  ctx.clearRect(0, 0, board.width, board.height);

  for (let x = 0; x < gridSize; x += 1) {
    for (let y = 0; y < gridSize; y += 1) {
      ctx.fillStyle = (x + y) % 2 === 0 ? 'rgba(148, 163, 184, 0.08)' : 'rgba(15, 23, 42, 0.15)';
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }

  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#10b981' : '#34d399';
    ctx.fillRect(segment.x * cellSize + 1, segment.y * cellSize + 1, cellSize - 2, cellSize - 2);
  });

  ctx.fillStyle = '#f87171';
  ctx.beginPath();
  ctx.arc(
    food.x * cellSize + cellSize / 2,
    food.y * cellSize + cellSize / 2,
    cellSize / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function updateDirection(newDirection) {
  const isOpposite =
    newDirection.x === -direction.x && newDirection.y === -direction.y;

  if (!isOpposite) {
    nextDirection = newDirection;
  }

  if (!isRunning) {
    startGame(nextDirection);
  }
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();

  if (['arrowup', 'w', 'arrowdown', 's', 'arrowleft', 'a', 'arrowright', 'd'].includes(key)) {
    event.preventDefault();
  }

  const keyMap = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 },
  };

  if (keyMap[key]) {
    updateDirection(keyMap[key]);
  }
});

startBtn.addEventListener('click', () => {
  startGame();
});

resetGame();
setOverlay('按方向键开始游戏', '开始游戏', true);
