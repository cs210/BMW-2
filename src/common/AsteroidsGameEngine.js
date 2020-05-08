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
            shipSize: 0.3,
            shipTurnSpeed: 0.05,
            shipSpeed: 4, // 2
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
            if (p.x > this.spaceWidth/2) {
                p.x = this.spaceWidth/2;
                v.x = 0;
            }
            if (p.y > this.spaceHeight/2) {
                p.y = this.spaceHeight/2;
                v.y = 0;
            }
            if(p.x < -this.spaceWidth /2) {
                p.x = -this.spaceWidth/2;
                v.x = 0;
            }
            if(p.y < -this.spaceHeight/2) {
                p.y = -this.spaceHeight/2;
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
                    playerShip.physicsObj.applyForce([0,-this.shipSpeed]);
                    // playerShip.physicsObj.applyForceLocal([0,this.shipSpeed]);
                } else if (inputData.input === 'right') {
                    playerShip.physicsObj.applyForce([this.shipSpeed, 0]);
                    // playerShip.physicsObj.angle -= this.shipTurnSpeed;
                } else if (inputData.input === 'left') {
                    playerShip.physicsObj.applyForce([-this.shipSpeed, 0]);
                    // playerShip.physicsObj.angle += this.shipTurnSpeed;
                } else if (inputData.input === 'down') {
                    playerShip.physicsObj.applyForce([0,this.shipSpeed]);
                    // playerShip.physicsObj.applyForceLocal([0,-this.shipSpeed]);
                } else if (inputData.input === 'space') {
                    this.emit('shoot', playerShip);
                }

                playerShip.refreshFromPhysics();
            }
        }
    }

    // create ship
    addShip(playerId, c_name, v_name) {
        let s = new Ship(this, {}, {
            playerId: playerId,
            mass: 10,
            angularVelocity: 0,
            position: new TwoVector(-6.4, -3.6),
            velocity: new TwoVector(0, 0),
        });
        s.score = 0;
        s.won = false;
        s.c_name = c_name;
        s.v_name = v_name;
        this.addObjectToWorld(s);
    }

    addShipOnReset(playerId, c_name, v_name, score) {
        let s = new Ship(this, {}, {
            playerId: playerId,
            mass: 10,
            angularVelocity: 0,
            position: new TwoVector(-6.4, -3.6),
            velocity: new TwoVector(0, 0),
        });
        s.score = score;
        console.log("score now: "+ s.score);
        s.won = false;
        s.c_name = c_name;
        s.v_name = v_name;
        this.addObjectToWorld(s);
    }

    getRandInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // create asteroids
    addBarriers(currentWorld) {
        let world_choice = currentWorld;
        while (world_choice === currentWorld) {
            world_choice = this.getRandInt(1, 5);
        }

        if (world_choice === 1) {
            this.world_one();
        } else if (world_choice === 2) {
            this.world_two();
        } else if (world_choice === 3) {
            this.world_three();
        } else if (world_choice === 4) {
            this.world_four();
        }
        return world_choice;
    }

    // Add finishline
    addFinishLine() {
        let a = new FinishLine(this, {}, {
            mass: 10000,
            position: new TwoVector(6.5, 3.75),
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

    resetAllShips() {
        for (let o of this.world.queryObjects({ instanceType: Ship })) {
            this.resetShip(o)
        }
    }

    resetShip(ship) {
        let old_score = ship.score;
        let c_name = ship.c_name;
        let v_name = ship.v_name;
        let old_pid = ship.playerId;
        this.removeObjectFromWorld(ship.id);
        this.addShipOnReset(old_pid, c_name, v_name, old_score);
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

    world_one() {
        let a = new Asteroid(this, {}, {
            mass: 100000,
            position: new TwoVector(-5, -1.5),
            velocity: new TwoVector(0, 0),
            angularVelocity: 0
        }, new TwoVector(1, 3));
        a.level = 0;
        this.addObjectToWorld(a);
    }

    world_two() {
        // add asteroids to the bottom half of the screen
        let a = new Asteroid(this, {}, {
            mass: 100000,
            position: new TwoVector(-5, -1.5),
            velocity: new TwoVector(0, 0),
            angularVelocity: 0
        }, new TwoVector(1, 7));
        a.level = 0;
        this.addObjectToWorld(a);

        // add asteroids to the bottom half of the screen
        let b = new Asteroid(this, {}, {
            mass: 100000,
            position: new TwoVector(5, 1.5),
            velocity: new TwoVector(0, 0),
            angularVelocity: 0
        }, new TwoVector(1, 7));
        b.level = 0;
        this.addObjectToWorld(b);

        let c = new Asteroid(this, {}, {
            mass: 100000,
            position: new TwoVector(0, 3),
            velocity: new TwoVector(0, 0),
            angularVelocity: 0
        }, new TwoVector(1, 4));
        c.level = 0;
        this.addObjectToWorld(c);

        let d = new Asteroid(this, {}, {
            mass: 100000,
            position: new TwoVector(0, -3),
            velocity: new TwoVector(0, 0),
            angularVelocity: 0
        }, new TwoVector(1, 4));
        d.level = 0;
        this.addObjectToWorld(d);
    }

    world_three() {
        // add asteroids to the bottom half of the screen
        let a = new Asteroid(this, {}, {
            mass: 100000,
            position: new TwoVector(-1.5, -2),
            velocity: new TwoVector(0, 0),
            angularVelocity: 0
        }, new TwoVector(13, 1));
        a.level = 0;
        this.addObjectToWorld(a);

        // add asteroids to the bottom half of the screen
        let b = new Asteroid(this, {}, {
            mass: 100000,
            position: new TwoVector(1.5, 2),
            velocity: new TwoVector(0, 0),
            angularVelocity: 0
        }, new TwoVector(13, 1));
        b.level = 0;
        this.addObjectToWorld(b);
    }

    world_four() {
        // add asteroids to the bottom half of the screen
        let a = new Asteroid(this, {}, {
            mass: 100000,
            position: new TwoVector(-1.5, -2),
            velocity: new TwoVector(0, 0),
            angularVelocity: 0
        }, new TwoVector(13, 1));
        a.level = 0;
        this.addObjectToWorld(a);

        let c = new Asteroid(this, {}, {
            mass: 100000,
            position: new TwoVector(0, 3),
            velocity: new TwoVector(0, 0),
            angularVelocity: 0
        }, new TwoVector(1, 4));
        c.level = 0;
        this.addObjectToWorld(c);
    }
}
