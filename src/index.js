import { randomNum, getAngleFromCoords, getDistanceFromCoords } from './math';
import { canvas, ctx } from './constants';
import Scoreboard from './components/Scoreboard';

// canvas.width = innerWidth;
// canvas.height = innerWidth * 0.75;
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

let gameId;

canvas.focus();

// const updateWidth = () => {
//     console.log('updateWidth');
//     canvas.width = innerWidth;
//     canvas.height = innerWidth * 0.75;
// };

// addEventListener('resize', updateWidth);
// removeEventListener('resize', updateWidth);

const isInBounds = (x, y, size) => {
    return x >= 0 && x + size <= canvas.width && y >= 0 && y + size <= canvas.height;
};

const playerSize = 32;

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

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }

    isInBounds() {
        return isInBounds(this.x, this.y, this.radius);
    }
}

const friction = 0.99;

class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }

    isInBounds() {
        return isInBounds(this.x, this.y, this.radius);
    }
}

ctx.fillStyle = 'green';
ctx.fillRect(10, 10, 150, 100);

// create new player
const player = new Player(
    canvas.width / 2 - playerSize / 2,
    canvas.height / 2 - playerSize / 2,
    playerSize,
    playerSize,
    '#fff'
);

const scoreboard = new Scoreboard();

const enemies = [];
const projectiles = [];
const particles = [];
let spawnInterval;

const gameOver = () => {
    clearInterval(spawnInterval);
    cancelAnimationFrame(gameId);
    window.removeEventListener('keydown', handleKeypress);
    player.isDead = true;
    ctx.font = '40px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.baseLine = 'middle';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
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

window.addEventListener('keydown', handleKeypress);

spawnEnemies();
animate();
