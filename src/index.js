import { randomNum, getAngleFromCoords, getDistanceFromCoords, isInBounds } from './math';
import { canvas, ctx, playerSize } from './constants';
import Scoreboard from './components/Scoreboard';
import Projectile from './components/Projectile';
import Particle from './components/Particle';
// import Player from './components/Player';
import Button from './components/Button';

// canvas.width = innerWidth;
// canvas.height = innerWidth * 0.75;
// canvas.width = document.body.clientWidth;
// canvas.height = document.body.clientHeight;

let gameId;

/mobile/i.test(navigator.userAgent) &&
    !location.hash &&
    setTimeout(function () {
        window.scrollTo(0, 1);
    }, 1000);

canvas.focus();

const drawTitleScr = () => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '100px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.baseLine = 'middle';
    ctx.fillText('Game Demo', canvas.width / 2, canvas.height / 2 - 200);

    const playButton = new Button(canvas.width / 2, canvas.height / 2, 200, 200, 'blue', 'Play Game');
    canvas.onmousedown = () => {
        resetGame();
        startGame();
    };
    playButton.draw();
};

const updateCanvasSize = () => {
    const { clientWidth, clientHeight } = document.body;
    canvas.width = clientWidth; // * level.width * scale
    canvas.height = clientHeight;
    drawTitleScr();
};

updateCanvasSize();
addEventListener('resize', updateCanvasSize);

class Player {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.velocity = 0;
        this.aimX = this.x + 16;
        this.aimY = this.y - 16;
        this.aimAngle = getAngleFromCoords(this.x + this.width / 2, this.y + this.height / 2, this.aimX, this.aimY);
        this.aimAngleRad;
        this.isDead = false;
        this.isShooting = false;
        this.offsetX;
        this.offsetY;
    }
    draw() {
        enemies.forEach((enemy) => {
            const dist = getDistanceFromCoords(
                this.x + this.width / 2,
                this.y + this.height / 2,
                enemy.x + enemy.width / 2,
                enemy.y + enemy.height / 2
            );
            if (dist <= playerSize) {
                gameOver();
            }
        });
        ctx.beginPath();
        ctx.lineWidth = '1';
        ctx.strokeStyle = this.color;
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.stroke();

        // cannon
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
        ctx.lineTo(this.aimX, this.aimY);
        ctx.stroke();
    }

    update() {
        // get angle from mouse coords
        this.aimAngle = getAngleFromCoords(
            this.x + playerSize / 2,
            player.y + playerSize / 2,
            this.offsetX,
            this.offsetY
        );
        this.aimAngleRad = getAngleFromCoords(
            this.x + playerSize / 2,
            this.y + playerSize / 2,
            this.offsetX,
            this.offsetY,
            'rad'
        );
        // recalc aim
        this.aimX = this.x + playerSize / 2 + Math.cos((Math.PI * this.aimAngle) / 180) * playerSize;
        this.aimY = this.y + playerSize / 2 + Math.sin((Math.PI * this.aimAngle) / 180) * playerSize;
        if (!this.isDead) this.draw();
    }

    isInBounds() {
        return isInBounds(this.x, this.y, this.width);
    }
}

class Enemy {
    constructor(x, y, velocity) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.color = 'red';
        this.velocity = {
            x: velocity.x,
            y: velocity.y,
        };
    }
    draw() {
        ctx.beginPath();
        ctx.lineWidth = '1';
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        const angle = getAngleFromCoords(this.x, this.y, player.x, player.y, 'rad');
        projectiles.forEach((projectile, index) => {
            const dist = getDistanceFromCoords(
                this.x + this.width / 2,
                this.y + this.height / 2,
                projectile.x + projectile.radius,
                projectile.y + projectile.radius
            );

            if (dist <= playerSize) {
                // create explosion
                for (let i = 0; i < this.width; i++) {
                    particles.push(
                        new Particle(
                            this.x + playerSize / 2,
                            this.y + playerSize / 2,
                            randomNum(2, playerSize / 4),
                            this.color,
                            {
                                x: (Math.random() - 0.5) * (Math.random() * 8),
                                y: (Math.random() - 0.5) * (Math.random() * 8),
                            }
                        )
                    );
                }
                setTimeout(() => {
                    enemies.splice(enemies.indexOf(this), 1);
                    projectiles.splice(index, 1);
                }, 0);
                scoreboard.update();
            }
        });

        this.velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle),
        };
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;

        this.draw();
    }

    isInBounds() {
        return isInBounds(this.x, this.y, this.width);
    }
}

// create new player
const player = new Player(
    canvas.width / 2 - playerSize / 2,
    canvas.height / 2 - playerSize / 2,
    playerSize,
    playerSize,
    '#fff'
);

const scoreboard = new Scoreboard();

let enemies = [];
let projectiles = [];
let particles = [];
let spawnInterval;

const startGame = () => {
    spawnEnemies();
    animate();
    window.addEventListener(
        'gamepadconnected',
        function (e) {
            gamepadHandler(e, true);
        },
        false
    );
    window.addEventListener(
        'gamepaddisconnected',
        function (e) {
            gamepadHandler(e, false);
        },
        false
    );

    // Controls - mouse
    canvas.onmousemove = (e) => {
        const { offsetX, offsetY } = e;
        player.offsetX = offsetX;
        player.offsetY = offsetY;
        player.update(player.aimX, player.aimY, player.aimAngle);
    };

    canvas.onmousedown = () => {
        shootProjectile();
    };

    canvas.onmouseup = () => {
        player.isShooting = false;
    };

    window.addEventListener('keydown', handleKeypress);
};

const gameOver = () => {
    clearInterval(spawnInterval);
    cancelAnimationFrame(gameId);
    window.removeEventListener('keydown', handleKeypress);
    player.isDead = true;
    const button = new Button(canvas.width / 2, canvas.height / 2, 200, 200, 'blue', 'Play again?');
    canvas.onmousedown = () => {
        resetGame();
        startGame();
    };
    button.draw();
};

const resetGame = () => {
    player.isDead = false;
    enemies = [];
    projectiles = [];
    particles = [];
    scoreboard.reset();
};

const spawnEnemies = () => {
    spawnInterval = setInterval(() => {
        const north = { x: Math.random() * canvas.width, y: -1 * playerSize };
        const south = { x: Math.random() * canvas.width, y: canvas.height + playerSize };
        const east = { x: canvas.width + playerSize, y: Math.random() * canvas.height };
        const west = { x: -1 * playerSize, y: Math.random() * canvas.height };
        const compass = [north, south, east, west];
        const random = Math.floor(randomNum(0, 3));
        const direction = compass[random];
        const x = direction.x;
        const y = direction.y;
        const angle = getAngleFromCoords(x, y, player.x + playerSize / 2, player.y + playerSize / 2, 'rad');
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle),
        };
        enemies.push(new Enemy(x, y, velocity));

        // setTimeout(() => spawnEnemies(), 3000);
        // if (spawnInterval > 0) spawnInterval -= 100;
        // console.log(spawnInterval);
    }, 1000);
};

const shootProjectile = () => {
    player.isShooting = true;
    const angle = getAngleFromCoords(
        player.x + playerSize / 2,
        player.y + playerSize / 2,
        player.offsetX,
        player.offsetY,
        'rad'
    );

    projectiles.push(
        new Projectile(player.aimX, player.aimY, 5, player.color, {
            x: Math.cos(angle) * 10,
            y: Math.sin(angle) * 10,
        })
    );
};

// Animation loop
const animate = () => {
    gameId = requestAnimationFrame(animate);
    // ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // this shows prev frames faded out
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    scoreboard.draw();

    enemies.forEach((enemy) => {
        enemy.update();
    });
    projectiles.forEach((projectile, index) => {
        projectile.update();
        if (!projectile.isInBounds()) {
            // console.log('removing projectile');
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        }
    });
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            particle.update();
        }

        if (!particle.isInBounds()) {
            setTimeout(() => {
                particles.splice(index, 1);
            }, 0);
        }
    });
};

const handleKeypress = (e) => {
    e.preventDefault();
    const tempX = player.x;
    const tempY = player.y;
    const { keyCode } = e;
    /* eslint-disable default-case */
    switch (keyCode) {
        case 87:
            player.y -= 10;
            break;
        case 65:
            player.x -= 10;
            break;
        case 83:
            player.y += 10;
            break;
        case 68:
            player.x += 10;
            break;
        case 32:
            shootProjectile();
    }
    if (!player.isInBounds()) {
        player.x = tempX;
        player.y = tempY;
    }

    player.update();
};

// controller support
const gamepads = {};

function gamepadHandler(event, connecting) {
    const gamepad = event.gamepad;
    // Note:
    // gamepad === navigator.getGamepads()[gamepad.index]

    if (connecting) {
        console.log('gamepad connected!!!!');
        gamepads[gamepad.index] = gamepad;
    } else {
        delete gamepads[gamepad.index];
    }
}
