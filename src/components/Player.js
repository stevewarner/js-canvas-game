import { ctx, canvas, playerSize } from '../constants';
import { getAngleFromCoords, getDistanceFromCoords, isInBounds } from '../math';

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

export default class Player {
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
            this.y + playerSize / 2,
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
