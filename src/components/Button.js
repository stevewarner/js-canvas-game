import { ctx } from '../constants';

export default class Button {
    constructor(x, y, backgroundColor, text) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.backgroundColor = backgroundColor;
    }

    draw() {
        // button text
        ctx.font = '20px Arial';
        const textWidth = ctx.measureText(this.text).width;

        ctx.beginPath();
        ctx.rect(this.x - textWidth / 2 - 20, this.y - 20, textWidth + 40, 30);
        ctx.fillStyle = this.backgroundColor;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.baseLine = 'middle';
        ctx.fillText(this.text, this.x, this.y);
    }

    update() {
        this.draw();
    }
}
