import { GameEngine, P2PhysicsEngine, TwoVector } from 'lance-gg';
import Asteroid from './Asteroid';
import Bullet from './Bullet';
import Ship from './Ship';
import FinishLine from "./FinishLine";

export default class AsteroidsGameEngine extends GameEngine {

    constructor(options) {
        super(options);

        // create physics with no friction; wrap positions after each step
        this.physicsEngine = new P2PhysicsEngine({ gameEngine: this });
        this.physicsEngine.world.defaultContactMaterial.friction = 10;
        this.on('postStep', this.warpAll.bind(this));

        // game variables
        Object.assign(this, {
            lives: 0,
            shipSize: 0.4,
            shipTurnSpeed: 0.035,
            shipSpeed: 4,
            bulletRadius: 0.03,
            bulletLifeTime: 60,
            asteroidRadius: 1.125,
            numAsteroidLevels: 4,
            numAsteroidVerts: 4,
            maxAsteroidSpeed: 0,
            spaceWidth: 16,
            spaceHeight: 9,
            SHIP: Math.pow(2, 1),
            BULLET: Math.pow(2, 2),
            ASTEROID: Math.pow(2, 3),
            FINISHLINE: Math.pow(2, 4),
        });

        this.playerReady = {};
    }

    // If the body is out of space bounds, warp it to the other side
    warpAll() {
        this.world.forEachObject((id, obj) => {
            let p = obj.position;
            let v = obj.velocity;
            if (p.x > this.spaceWidth / 2) {
                p.x = this.spaceWidth / 2;
                v.x = 0;
            }
            if (p.y > this.spaceHeight / 2) {
                p.y = this.spaceHeight / 2;
                v.y = 0;
            }
            if (p.x < -this.spaceWidth / 2) {
                p.x = -this.spaceWidth / 2;
                v.x = 0;
            }
            if (p.y < -this.spaceHeight / 2) {
                p.y = -this.spaceHeight / 2;
                v.y = 0;
            }
            obj.refreshToPhysics();
        });

    }

    registerClasses(serializer) {
        serializer.registerClass(Ship);
        serializer.registerClass(Asteroid);
        serializer.registerClass(Bullet);
        serializer.registerClass(FinishLine);
    }

    processInput(inputData, playerId) {
        super.processInput(inputData, playerId);
        if (playerId in this.playerReady && this.playerReady[playerId]) {
            // handle keyboard presses
            let playerShip = this.world.queryObject({ playerId: playerId, instanceType: Ship });
            if (playerShip) {
                if (inputData.input === 'up') {
                    playerShip.physicsObj.applyForceLocal([0, -this.shipSpeed]);
                } else if (inputData.input === 'right') {
                    playerShip.physicsObj.angle += this.shipTurnSpeed;
                } else if (inputData.input === 'left') {
                    playerShip.physicsObj.angle -= this.shipTurnSpeed;
                } else if (inputData.input === 'down') {
                    playerShip.physicsObj.applyForceLocal([0, this.shipSpeed]);
                } else if (inputData.input === 'space') {
                    this.emit('shoot', playerShip);
                }
                playerShip.refreshFromPhysics();
            }
        }
    }

    // create ship
    addShip(playerId, c_name, v_name, score = 0) {
        let s = new Ship(this, {}, {
            playerId: playerId,
            mass: 10,
            angularVelocity: 0,
            position: new TwoVector(-6.4, 3.6),
            velocity: new TwoVector(0, 0),
        });
        s.score = score;
        s.won = false;
        s.c_name = c_name;
        s.v_name = v_name;
        this.addObjectToWorld(s);
    }

    getRandInt(min, max) {
        // Includes min and max.
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    resetAllShips() {
        for (let o of this.world.queryObjects({ instanceType: Ship })) {
            this.resetShip(o);
        }
    }

    resetShip(ship) {
        let old_score = ship.score;
        let c_name = ship.c_name;
        let v_name = ship.v_name;
        let old_pid = ship.playerId;
        this.removeObjectFromWorld(ship.id);
        this.addShip(old_pid, c_name, v_name, old_score);
    }

    // asteroid explosion
    explode(asteroid, bullet) {
        // Remove asteroid and bullet
        let asteroidBody = asteroid.physicsObj;
        let level = asteroid.level;
        let x = asteroidBody.position[0];
        let y = asteroidBody.position[1];
        let r = this.asteroidRadius * (this.numAsteroidLevels - level) / this.numAsteroidLevels;
        this.removeObjectFromWorld(asteroid);
        this.removeObjectFromWorld(bullet);

        // Add new sub-asteroids
        /*
        if (level < 3) {
            let angleDisturb = Math.PI/2 * Math.random();
            for (let i=0; i<4; i++) {
                let angle = Math.PI/2 * i + angleDisturb;
                let subAsteroid = new Asteroid(this, {}, {
                    mass: 10,
                    position: new TwoVector(x + r * Math.cos(angle), y + r * Math.sin(angle)),
                    velocity: new TwoVector(0, 0)
                });
                subAsteroid.level = level + 1;
                this.trace.info(() => `creating sub-asteroid with radius ${r}: ${subAsteroid.toString()}`);
                this.addObjectToWorld(subAsteroid);
            }
        }
        */
    }

    buildBarrier(posX, posY, sizeX, sizeY) {
        let barrier = new Asteroid(this, {}, {
            mass: 100000,
            position: new TwoVector(posX, posY),
            velocity: new TwoVector(0, 0),
            angularVelocity: 0
        }, new TwoVector(sizeX, sizeY));
        barrier.level = 0;
        this.addObjectToWorld(barrier);
    }

    // Add finishline
    addFinishLine(posX, posY) {
        let a = new FinishLine(this, {}, {
            mass: 10000,
            position: new TwoVector(posX, posY),
            velocity: new TwoVector(0, 0),
            angularVelocity: 0
        }, new TwoVector(1, 1));
        a.level = 0;
        this.addObjectToWorld(a);
    }

    removeAllBarriers() {
        for (let o of this.world.queryObjects({ instanceType: Asteroid })) {
            this.removeObjectFromWorld(o.id);
        }
        for (let o of this.world.queryObjects({ instanceType: FinishLine })) {
            this.removeObjectFromWorld(o.id);
        }
    }

    /*
     * World Generation Code
     * 10 different levels
     */
    addBarriers(currentWorld) {
        let world_choice = currentWorld;
        while (!world_choice || world_choice === currentWorld) {
            world_choice = this.getRandInt(0, 7);
        }
        switch(world_choice) {
            case 0:
                this.empty_world();
                break;
            case 1:
                this.one_block_world();
                break;
            case 2:
                this.over_middle_under_world();
                break;
            case 3:
                this.s_world();
                break;
            case 4:
                this.enter_the_room();
                break;
            case 5:
                this.crossroads();
                break;
            case 6:
                this.s_tunnel();
                break;
            case 7:
                this.spiral();
                break;
        }
        return world_choice;
    }

    empty_world() {
        this.addFinishLine(6.5, -3.75);
    }

    one_block_world() {
        this.buildBarrier(-5, 1.5, 1, 3);
        this.addFinishLine(6.5, -3.75);
    }

    over_middle_under_world() {
        this.buildBarrier(-5, 1.5, 1, 7);
        this.buildBarrier(5, -1.5, 1, 7);
        this.buildBarrier(0, -3, 1, 4);
        this.buildBarrier(0, 3, 1, 4);
        this.addFinishLine(6.5, -3.75);
    }

    s_world() {
        this.buildBarrier(-1.5, 2, 13, 1);
        this.buildBarrier(1.5, -2, 13, 1);
        this.addFinishLine(6.5, -3.75);
    }

    enter_the_room() {
        this.buildBarrier(-1.5, 2, 13, 1);
        this.buildBarrier(0, -3, 1, 4);
        this.addFinishLine(-6.5, -3.75);
    }

    crossroads() {
        this.buildBarrier(5, 3, 1, 1);
        this.buildBarrier(5, 0, 1, 1);
        this.addFinishLine(5, -3);

        this.buildBarrier(2.5, 3, 1, 1);
        this.buildBarrier(2.5, 0, 1, 1);
        this.buildBarrier(2.5, -3, 1, 1);

        this.buildBarrier(0, 3, 1, 1);
        this.buildBarrier(0, 0, 1, 1);
        this.buildBarrier(0, -3, 1, 1);

        this.buildBarrier(-2.5, 3, 1, 1);
        this.buildBarrier(-2.5, 0, 1, 1);
        this.buildBarrier(-2.5, -3, 1, 1);

        this.buildBarrier(-5, 3, 1, 1);
        this.buildBarrier(-5, 0, 1, 1);
        this.buildBarrier(-5, -3, 1, 1);
    }

    s_tunnel() {
        // Top and Bottom
        this.buildBarrier(0, 5, 11, 1);
        this.buildBarrier(0, -5, 11, 1);

        // Left and Right
        this.buildBarrier(5, -1, 1, 6);
        this.buildBarrier(-5, 1, 1, 6);

        // Middle
        this.buildBarrier(-1, -1.5, 7, 1);
        this.buildBarrier(1, 1.5, 7, 1);

        this.addFinishLine(6.5, -3.75);
    }

    spiral() {
        // Top and Bottom
        this.buildBarrier(0, 7, 11, 1);
        this.buildBarrier(0, -7, 11, 1);

        // Left and Right
        this.buildBarrier(6, 0, 1, 13);
        this.buildBarrier(-5, 1, 1, 6);
        this.buildBarrier(2, 0.5, 1, 3);

        // Middle
        this.buildBarrier(-1, -1.5, 7, 1);
        this.buildBarrier(0, 1.5, 5, 1);

        this.addFinishLine(0, 0);
    }
}
