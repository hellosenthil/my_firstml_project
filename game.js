// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game variables
let score = 0;
let gameRunning = true;

// Player object
const player = {
    x: 50,
    y: 400,
    width: 32,
    height: 32,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpPower: 12,
    grounded: false,
    color: '#e74c3c'
};

// Physics constants
const gravity = 0.5;
const friction = 0.8;

// Platforms
const platforms = [
    { x: 0, y: 550, width: 800, height: 50, color: '#2ecc71' }, // Ground
    { x: 200, y: 450, width: 150, height: 20, color: '#27ae60' },
    { x: 400, y: 350, width: 150, height: 20, color: '#27ae60' },
    { x: 600, y: 250, width: 150, height: 20, color: '#27ae60' },
    { x: 100, y: 300, width: 100, height: 20, color: '#27ae60' },
    { x: 500, y: 500, width: 120, height: 20, color: '#27ae60' }
];

// Coins
const coins = [
    { x: 250, y: 410, width: 20, height: 20, collected: false },
    { x: 450, y: 310, width: 20, height: 20, collected: false },
    { x: 650, y: 210, width: 20, height: 20, collected: false },
    { x: 130, y: 260, width: 20, height: 20, collected: false },
    { x: 550, y: 460, width: 20, height: 20, collected: false }
];

// Keyboard input
const keys = {
    left: false,
    right: false,
    up: false
};

// Event listeners for keyboard
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === 'ArrowUp') keys.up = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'ArrowUp') keys.up = false;
});

// Update player movement
function updatePlayer() {
    // Horizontal movement
    if (keys.left) {
        player.velocityX = -player.speed;
    } else if (keys.right) {
        player.velocityX = player.speed;
    } else {
        player.velocityX *= friction;
    }

    // Jumping
    if (keys.up && player.grounded) {
        player.velocityY = -player.jumpPower;
        player.grounded = false;
    }

    // Apply gravity
    player.velocityY += gravity;

    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;

    // Keep player in bounds horizontally
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Reset grounded state
    player.grounded = false;

    // Check collision with platforms
    platforms.forEach(platform => {
        if (checkCollision(player, platform)) {
            // Landing on top of platform
            if (player.velocityY > 0 &&
                player.y + player.height - player.velocityY <= platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.grounded = true;
            }
            // Hitting bottom of platform
            else if (player.velocityY < 0 &&
                     player.y - player.velocityY >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
            // Hitting from left
            else if (player.velocityX > 0) {
                player.x = platform.x - player.width;
                player.velocityX = 0;
            }
            // Hitting from right
            else if (player.velocityX < 0) {
                player.x = platform.x + platform.width;
                player.velocityX = 0;
            }
        }
    });

    // Check if player fell off screen
    if (player.y > canvas.height) {
        resetPlayer();
    }
}

// Check collision between two rectangles
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Check coin collection
function checkCoins() {
    coins.forEach(coin => {
        if (!coin.collected && checkCollision(player, coin)) {
            coin.collected = true;
            score += 10;
            scoreElement.textContent = score;
        }
    });
}

// Reset player position
function resetPlayer() {
    player.x = 50;
    player.y = 400;
    player.velocityX = 0;
    player.velocityY = 0;
}

// Draw player
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw Mario-like features
    // Cap
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(player.x + 4, player.y, player.width - 8, 8);

    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + 8, player.y + 12, 4, 4);
    ctx.fillRect(player.x + 20, player.y + 12, 4, 4);

    // Overalls
    ctx.fillStyle = '#3498db';
    ctx.fillRect(player.x + 6, player.y + 20, player.width - 12, 12);
}

// Draw platforms
function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

        // Add grass texture on top
        ctx.fillStyle = '#229954';
        ctx.fillRect(platform.x, platform.y, platform.width, 5);
    });
}

// Draw coins
function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            // Coin body
            ctx.fillStyle = '#f39c12';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
            ctx.fill();

            // Coin shine
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width / 2 - 3, coin.y + coin.height / 2 - 3, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// Draw clouds in background
function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

    // Cloud 1
    ctx.beginPath();
    ctx.arc(100, 80, 20, 0, Math.PI * 2);
    ctx.arc(120, 80, 25, 0, Math.PI * 2);
    ctx.arc(140, 80, 20, 0, Math.PI * 2);
    ctx.fill();

    // Cloud 2
    ctx.beginPath();
    ctx.arc(400, 60, 20, 0, Math.PI * 2);
    ctx.arc(420, 60, 25, 0, Math.PI * 2);
    ctx.arc(440, 60, 20, 0, Math.PI * 2);
    ctx.fill();

    // Cloud 3
    ctx.beginPath();
    ctx.arc(650, 100, 20, 0, Math.PI * 2);
    ctx.arc(670, 100, 25, 0, Math.PI * 2);
    ctx.arc(690, 100, 20, 0, Math.PI * 2);
    ctx.fill();
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98D8E8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clouds
    drawClouds();

    // Update and draw
    updatePlayer();
    checkCoins();
    drawPlatforms();
    drawCoins();
    drawPlayer();

    // Continue loop
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Start the game
gameLoop();
