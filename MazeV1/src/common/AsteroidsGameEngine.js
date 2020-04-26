import { GameEngine, P2PhysicsEngine, TwoVector } from 'lance-gg';
import Asteroid from './Asteroid';
import Bullet from './Bullet';
import Ship from './Ship';

export default class AsteroidsGameEngine extends GameEngine {

    constructor(options) {
        super(options);

        // create physics with no friction; wrap positions after each step
        this.physicsEngine = new P2PhysicsEngine({ gameEngine: this });
        this.physicsEngine.world.defaultContactMaterial.friction = 0;
        this.on('postStep', this.warpAll.bind(this));

        // game variables
        Object.assign(this, {
            lives: 3, shipSize: 0.3, shipTurnSpeed: 0.05, shipSpeed: 2, bulletRadius: 0.03, bulletLifeTime: 60,
            asteroidRadius: 0.9, numAsteroidLevels: 4, numAsteroidVerts: 4, maxAsteroidSpeed: 0,
            spaceWidth: 16, spaceHeight: 9, SHIP: Math.pow(2, 1), BULLET: Math.pow(2, 2), ASTEROID: Math.pow(2, 3)
        });
    }

    // If the body is out of space bounds, warp it to the other side
    warpAll() {
        this.world.forEachObject((id, obj) => {
            let p = obj.position;
            if(p.x > this.spaceWidth/2) p.x = -this.spaceWidth/2;
            if(p.y > this.spaceHeight/2) p.y = -this.spaceHeight/2;
            if(p.x < -this.spaceWidth /2) p.x = this.spaceWidth/2;
            if(p.y < -this.spaceHeight/2) p.y = this.spaceHeight/2;
            obj.refreshToPhysics();
        });
    }

    registerClasses(serializer) {
        serializer.registerClass(Ship);
        serializer.registerClass(Asteroid);
        serializer.registerClass(Bullet);
    }

    processInput(inputData, playerId) {

        super.processInput(inputData, playerId);

        // handle keyboard presses
        let playerShip = this.world.queryObject({ playerId: playerId, instanceType: Ship });
        if (playerShip) {
            if (inputData.input === 'up') playerShip.physicsObj.applyForceLocal([0, this.shipSpeed]);
            else if (inputData.input === 'right') playerShip.physicsObj.angle -= this.shipTurnSpeed;
            else if (inputData.input === 'left') playerShip.physicsObj.angle += this.shipTurnSpeed;
            else if (inputData.input === 'space') this.emit('shoot', playerShip);
            playerShip.refreshFromPhysics();
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
            position: new TwoVector(6.4, -3.6), velocity: new TwoVector(0, 0)
        });
        s.lives = this.lives;
        this.addObjectToWorld(s);
    }

    // create asteroids
    addAsteroids() {

        // add asteroids to the bottom half of the screen
        for(var i = -0.5; i < 0.4; i = i + 0.1) {
            var x = i * this.spaceWidth;
            var y = -2;
            console.log(x);
            console.log(y);
            let vx = 0;
            let vy = 0;
            let va = 0;

            // Create asteroid Body
            var a = new Asteroid(this, {}, {
                mass: 100,
                position: new TwoVector(x, y),
                velocity: new TwoVector(vx, vy),
                angularVelocity: va
            });
            a.level = 0;
            this.addObjectToWorld(a);
        }

        // add asteroids to the top half of the screen
        for(var i = 0.5; i > -0.4; i = i - 0.1) {
            var x = i * this.spaceWidth;
            var y = 2;
            console.log(x);
            console.log(y);
            let vx = 0;
            let vy = 0;
            let va = 0;

            // Create asteroid Body
            var a = new Asteroid(this, {}, {
                mass: 100,
                position: new TwoVector(x, y),
                velocity: new TwoVector(vx, vy),
                angularVelocity: va
            });
            a.level = 0;
            this.addObjectToWorld(a);
        }

        
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
