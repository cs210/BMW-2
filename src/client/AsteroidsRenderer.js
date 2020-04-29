import { Renderer } from 'lance-gg';
import Asteroid from './../common/Asteroid';
import Bullet from './../common/Bullet';
import Ship from './../common/Ship';
import FinishLine from "../common/FinishLine";

let ctx = null;
let game = null;
let canvas = null;

export default class AsteroidsRenderer extends Renderer {

    constructor(gameEngine, clientEngine) {
        super(gameEngine, clientEngine);
        game = gameEngine;

        // Init canvas
        canvas = document.createElement('canvas');
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
        document.body.insertBefore(canvas, document.getElementById('logo'));
        game.w = canvas.width;
        game.h = canvas.height;
        game.zoom = game.h / game.spaceHeight;
        if (game.w / game.spaceWidth < game.zoom) game.zoom = game.w / game.spaceWidth;
        ctx = canvas.getContext('2d');
        ctx.lineWidth = 2 / game.zoom;
        ctx.strokeStyle = ctx.fillStyle = 'white';
        ctx.shadowBlur = 10;
        ctx.shadowColor = "white";
        this.viewer = false;
        this.groupShipPID = null;
        // remove instructions on first input
        setTimeout(this.removeInstructions.bind(this), 5000);
    }

    draw(t, dt) {
        super.draw(t, dt);

        // Clear the canvas
        ctx.clearRect(0, 0, game.w, game.h);

        // Transform the canvas
        // Note that we need to flip the y axis since Canvas pixel coordinates
        // goes from top to bottom, while physics does the opposite.
        ctx.save();
        ctx.translate(game.w/2, game.h/2); // Translate to the center
        ctx.scale(game.zoom, -game.zoom);  // Zoom in and flip y axis

        // Draw all things
        this.drawBounds();
        game.world.forEachObject((id, obj) => {
            if (obj instanceof Ship) this.drawShip(obj.physicsObj, obj.playerId === this.groupShipPID);
            else if (obj instanceof Bullet) this.drawBullet(obj.physicsObj);
            else if (obj instanceof FinishLine) this.drawFinishLine(obj.physicsObj);
            else if (obj instanceof Asteroid && this.viewer) this.drawAsteroid(obj.physicsObj);
        });

        // update status and restore
        this.updateStatus();
        ctx.restore();
    }

    updateStatus() {

        let playerShip = this.gameEngine.world.queryObject({ playerId: this.groupShipPID });

        if (!playerShip) {
            if (this.lives !== undefined)
                document.getElementById('gameover').classList.remove('hidden');
            return;
        }

        // update lives if necessary
        if (playerShip.playerId === this.groupShipPID && this.lives !== playerShip.lives) {
            document.getElementById('lives').innerHTML = 'Lives ' + playerShip.lives;
            this.lives = playerShip.lives;
        }

        // update winning if necessary
        if (playerShip.playerId === this.groupShipPID && playerShip.won) {
            document.getElementById('gamewin').classList.remove('hidden');
        }
    }

    removeInstructions() {
        document.getElementById('instructions').classList.add('hidden');
        document.getElementById('instructionsMobile').classList.add('hidden');
    }

    drawShip(body, special) {
        let radius = body.shapes[0].radius;
        if (special) {
            ctx.strokeStyle = ctx.fillStyle = "#18CAE6";
            ctx.shadowColor = "#18CAE6";
        }
        ctx.save();
        ctx.translate(body.position[0], body.position[1]); // Translate to the ship center
        ctx.rotate(body.angle); // Rotate to ship orientation
        ctx.beginPath();
        ctx.moveTo(-radius*0.6, -radius);
        ctx.lineTo(0, radius);
        ctx.lineTo( radius*0.6, -radius);
        ctx.moveTo(-radius*0.5, -radius*0.5);
        ctx.lineTo( radius*0.5, -radius*0.5);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = ctx.fillStyle = 'white';
        ctx.shadowColor = "white";
    }



    drawFinishLine(body) {
        ctx.strokeStyle = ctx.fillStyle = "#FAF602";
        ctx.shadowColor = "#FAF602";
        ctx.save();
        ctx.translate(body.position[0], body.position[1]);  // Translate to the center
        //ctx.rotate(.785);
        ctx.beginPath();
        for(let j=0; j < game.numAsteroidVerts; j++) {
            let xv = body.verts[j][0];
            let yv = body.verts[j][1];
            if (j==0) ctx.moveTo(xv, yv);
            else ctx.lineTo(xv, yv);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = ctx.fillStyle = 'white';
        ctx.shadowColor = "white";
    }

    drawAsteroid(body) {
        ctx.save();
        ctx.translate(body.position[0], body.position[1]);  // Translate to the center
        ctx.rotate(.785);
        ctx.beginPath();
        for(let j=0; j < game.numAsteroidVerts; j++) {
            let xv = body.verts[j][0];
            let yv = body.verts[j][1];
            if (j==0) ctx.moveTo(xv, yv);
            else ctx.lineTo(xv, yv);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    drawBullet(body) {
        ctx.beginPath();
        ctx.arc(body.position[0], body.position[1], game.bulletRadius, 0, 2*Math.PI);
        ctx.fill();
        ctx.closePath();
    }

    drawBounds() {
        ctx.beginPath();
        ctx.moveTo(-game.spaceWidth/2, -game.spaceHeight/2);
        ctx.lineTo(-game.spaceWidth/2, game.spaceHeight/2);
        ctx.lineTo( game.spaceWidth/2, game.spaceHeight/2);
        ctx.lineTo( game.spaceWidth/2, -game.spaceHeight/2);
        ctx.lineTo(-game.spaceWidth/2, -game.spaceHeight/2);
        ctx.closePath();
        ctx.stroke();
    }

}
