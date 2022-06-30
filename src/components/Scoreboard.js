import { ctx } from '../constants';

export default class Scoreboard {
    constructor() {
        this.score = 0;
        this.x = 20;
        this.y = 40;
    }

    draw() {
        ctx.textAlign = 'start';
        ctx.baseLine = 'top';
        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`Score: ${this.score}`, this.x, this.y);
    }

    update() {
        this.score++;
        this.draw();
    }

    reset() {
        this.score = 0;
    }
}
