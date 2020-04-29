import { ServerEngine, TwoVector } from 'lance-gg';
import Asteroid from '../common/Asteroid';
import Bullet from '../common/Bullet';
import Ship from '../common/Ship';

export default class AsteroidsServerEngine extends ServerEngine {

    constructor(io, gameEngine, inputOptions) {
        super(io, gameEngine, inputOptions);
        gameEngine.physicsEngine.world.on('beginContact', this.handleCollision.bind(this));
        gameEngine.on('shoot', this.shoot.bind(this));
        this.playerReady = {}
        this.playerGroups = {}
        this.io = io;
    }

    start() {
        super.start();
        this.gameEngine.addAsteroids();
    }

    // handle a collision on server only
    handleCollision(evt) {

        // identify the two objects which collided
        let A;
        let B;
        this.gameEngine.world.forEachObject((id, obj) => {
            if (obj.physicsObj === evt.bodyA) A = obj;
            if (obj.physicsObj === evt.bodyB) B = obj;
        });

        // check bullet-asteroid and ship-asteroid collisions
        if (!A || !B) return;
        this.gameEngine.trace.trace(() => `collision between A=${A.toString()}`);
        this.gameEngine.trace.trace(() => `collision and     B=${B.toString()}`);
        if (A instanceof Bullet && B instanceof Asteroid) this.gameEngine.explode(B, A);
        if (B instanceof Bullet && A instanceof Asteroid) this.gameEngine.explode(A, B);
        if (A instanceof Ship && B instanceof Asteroid) this.kill(A);
        if (B instanceof Ship && A instanceof Asteroid) this.kill(B);

        // restart game
        if (this.gameEngine.world.queryObjects({ instanceType: Asteroid }).length === 0) this.gameEngine.addAsteroids();
    }

    // shooting creates a bullet
    shoot(player) {

        let radius = player.physicsObj.shapes[0].radius;
        let angle = player.physicsObj.angle + Math.PI / 2;
        let bullet = new Bullet(this.gameEngine, {}, {
            mass: 0.05,
            position: new TwoVector(
                radius * Math.cos(angle) + player.physicsObj.position[0],
                radius * Math.sin(angle) + player.physicsObj.position[1]
            ),
            velocity: new TwoVector(
                2 * Math.cos(angle) + player.physicsObj.velocity[0],
                2 * Math.sin(angle) + player.physicsObj.velocity[1]
            ),
            angularVelocity: 0
        });
        let obj = this.gameEngine.addObjectToWorld(bullet);
        this.gameEngine.timer.add(this.gameEngine.bulletLifeTime, this.destroyBullet, this, [obj.id]);
    }

    // destroy the missile if it still exists
    destroyBullet(bulletId) {
        if (this.gameEngine.world.objects[bulletId]) {
            this.gameEngine.trace.trace(() => `bullet[${bulletId}] destroyed`);
            this.gameEngine.removeObjectFromWorld(bulletId);
        }
    }

    kill(ship) {
        if(ship.lives-- === 0) this.gameEngine.removeObjectFromWorld(ship.id);
    }

    onPlayerConnected(socket) {
        super.onPlayerConnected(socket);
        let that = this;
        socket.on('playerDataUpdate', function(data) {
            that.connectedPlayers[socket.id].playerName = data.playerName;
            that.connectedPlayers[socket.id].privateCode = data.privateCode;
            if (data.privateCode in that.playerGroups) {
                if (that.playerGroups[data.privateCode].full) {
                    socket.emit('groupFull');
                } else {
                    if (that.playerGroups[data.privateCode].v_playerID === null) {
                        that.playerGroups[data.privateCode].v_playerID = socket.playerId;
                        that.playerGroups[data.privateCode].v_playerName = data.playerName;
                        that.playerGroups[data.privateCode].v_socketID = socket.id;
                        that.playerGroups[data.privateCode].full = true;
                        socket.emit('waitingForPlayer', {
                            viewer : true
                        });
                    } else {
                        that.playerGroups[data.privateCode].c_playerID = socket.playerId;
                        that.playerGroups[data.privateCode].c_playerName = data.playerName;
                        that.playerGroups[data.privateCode].c_socketID = socket.id;
                        that.playerGroups[data.privateCode].full = true;
                        socket.emit('waitingForPlayer', {
                            viewer : false
                        });
                    }
                }
            } else {
                that.playerGroups[data.privateCode] = {
                    c_playerID : socket.playerId,
                    c_playerName : data.playerName,
                    c_socketID : socket.id,
                    v_playerID : null,
                    v_playerName : null,
                    v_socketID : null,
                    full : false,
                    c_ready : false,
                    v_ready : false,
                    gameStarted: false
                };
                socket.emit('waitingForPlayer', {
                    viewer : false
                });
            }
        });
        socket.on('requestGroupUpdate', function() {
            socket.emit('groupUpdate', that.playerGroups[that.connectedPlayers[socket.id].privateCode])
        });
        socket.on('playerReady', function(data) {
            if (data.viewer) {
                that.playerGroups[that.connectedPlayers[socket.id].privateCode].v_ready = true;
            } else {
                that.playerGroups[that.connectedPlayers[socket.id].privateCode].c_ready = true;
            }
            let group = that.playerGroups[that.connectedPlayers[socket.id].privateCode];
            if (group.v_ready && group.c_ready) {
                that.gameEngine.addShip(group.c_playerID);
                that.gameEngine.playerReady[group.c_playerID] = true;
                that.io.to(group.c_socketID).to(group.v_socketID).emit('gameBegin', {ship_pid : group.c_playerID});
                that.playerGroups[that.connectedPlayers[socket.id].privateCode].gameStarted = true;
            }
        });
    }

    onPlayerDisconnected(socketId, playerId) {
        let group_code = this.connectedPlayers[socketId].privateCode;
        super.onPlayerDisconnected(socketId, playerId);
        if (this.playerGroups[group_code]) {
            if (playerId === this.playerGroups[group_code].c_playerID) {
                this.playerGroups[group_code].c_playerID = null;
                this.playerGroups[group_code].c_socketID = null;
                this.playerGroups[group_code].c_playerName = null;
                this.playerGroups[group_code].c_ready = false;
                this.playerGroups[group_code].full = false;
            } else {
                this.playerGroups[group_code].v_playerID = null;
                this.playerGroups[group_code].v_socketID = null;
                this.playerGroups[group_code].v_playerName = null;
                this.playerGroups[group_code].v_ready = false;
                this.playerGroups[group_code].full = false;
            }
        }
        if (this.playerGroups[group_code].c_socketID === null && this.playerGroups[group_code].v_socketID === null) {
            delete this.playerGroups[group_code];
        }
        for (let o of this.gameEngine.world.queryObjects({ playerId }))
            this.gameEngine.removeObjectFromWorld(o.id);

        if (this.playerGroups[group_code] && this.playerGroups[group_code].c_playerID && playerId !== this.playerGroups[group_code].c_playerID) {
            for (let o of this.gameEngine.world.queryObjects({ playerId : this.playerGroups[group_code].c_playerID }))
                this.gameEngine.removeObjectFromWorld(o.id);
        }
    }
}
