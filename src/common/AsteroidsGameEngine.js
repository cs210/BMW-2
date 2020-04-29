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
            lives: 0, shipSize: 0.3, shipTurnSpeed: 0.05, shipSpeed: 2, bulletRadius: 0.03, bulletLifeTime: 60,
            asteroidRadius: 1.125, numAsteroidLevels: 4, numAsteroidVerts: 4, maxAsteroidSpeed: 0,
            spaceWidth: 16, spaceHeight: 9, SHIP: Math.pow(2, 1), BULLET: Math.pow(2, 2),
            ASTEROID: Math.pow(2, 3), FINISHLINE: Math.pow(2, 4)
        });

        this.playerReady = {};
    }

    // If the body is out of space bounds, warp it to the other side
    warpAll() {
        
        this.world.forEachObject((id, obj) => {
            let p = obj.position;
            let v = obj.velocity;
            if(p.x > this.spaceWidth/2)
            {
                p.x = this.spaceWidth/2; 
                v.x = 0;
            }  
            if(p.y > this.spaceHeight/2)
            {
                p.y = this.spaceHeight/2; 
                v.y = 0;
            }  
            if(p.x < -this.spaceWidth /2)
            {
                p.x = -this.spaceWidth/2; 
                v.x = 0; 
            } 
            if(p.y < -this.spaceHeight/2) 
            {
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
                if (inputData.input === 'up')
                {
                    /*
                    console.log(playerShip.physicsObj.position.y);
                    playerShip.physicsObj.position.y += 0.5;
                    console.log(playerShip.physicsObj.position.y);
                    */
                    playerShip.physicsObj.applyForceLocal([0,this.shipSpeed]);
                }
                else if (inputData.input === 'right')
                {
                    playerShip.physicsObj.angle -= this.shipTurnSpeed;
                }
                else if (inputData.input === 'left')
                {
                    playerShip.physicsObj.angle += this.shipTurnSpeed;
                }
                else if (inputData.input === 'down')
                {
                    playerShip.physicsObj.applyForceLocal([0,-this.shipSpeed]);
                }
                /*
                else if (inputData.input === 'space')
                {
                    this.emit('shoot', playerShip);
                }
                */
                playerShip.refreshFromPhysics();
            }
        }
    }

    // returns a random number between -0.5 and 0.5
    rand() {
        return Math.random() - 0.5;
    }

    // create ship
    addShip(playerId) {
        let s = new Ship(this, {}, {
            playerId: playerId,
            mass: 10, angularVelocity: 0,
            position: new TwoVector(-6.4, -3.6), velocity: new TwoVector(0, 0)
        });
        s.lives = this.lives;
        s.won = false;
        this.addObjectToWorld(s);
    }

    // create asteroids
    addAsteroids() {

        // add asteroids to the bottom half of the screen
        for(var i = -0.5; i < 0.4; i = i + 0.1) {
            var x = i * this.spaceWidth;
            var y = -2;
            let vx = 0;
            let vy = 0;
            let va = 0;

            // Create asteroid Body
            var a = new Asteroid(this, {}, {
                mass: 100000,
                position: new TwoVector(x, y),
                velocity: new TwoVector(vx, vy),
                angularVelocity: va
            }, new TwoVector(1, 1));
            a.level = 0;
            this.addObjectToWorld(a);
        }

        // add asteroids to the top half of the screen
        for(var i = 0.5; i > -0.4; i = i - 0.1) {
            var x = i * this.spaceWidth;
            var y = 2;
            let vx = 0;
            let vy = 0;
            let va = 0;

            // Create asteroid Body
            var a = new Asteroid(this, {}, {
                mass: 100000,
                position: new TwoVector(x, y),
                velocity: new TwoVector(vx, vy),
                angularVelocity: va
            }, new TwoVector(1, 1));
            a.level = 0;
            this.addObjectToWorld(a);
        }

        
    }

    // Add finishline
    addFinishLine() {
        var a = new FinishLine(this, {}, {
            mass: 100000,
            position: new TwoVector(6.5, 3.75),
            velocity: new TwoVector(0, 0),
            angularVelocity: 0
        },
            new TwoVector(1, 1)
        );
        a.level = 0;
        this.addObjectToWorld(a);
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
}
