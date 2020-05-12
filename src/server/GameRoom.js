const MAX_ROOM_SIZE = 10;

export default class GameRoom {

    constructor(name, io) {
        this.name = name;
        this.players = {};
        this.num_players = 0;
        this.io = io;
        this.started = false;
    }

    addPlayer(socketId, playerObj) {
        this.players[socketId] = playerObj;
        this.num_players += 1;
    }

    removePlayer(socketId) {
        if (socketId in this.players) {
            delete this.players[socketId];
            this.num_players -= 1;
            return true;
        }
        console.log(`Tried to remove. Player ${socketId} does not exist in Room "${this.name}"`);
        return false;
    }

    playerIsReady(socketId) {
        if (socketId in this.players) {
            this.players[socketId]['ready'] = true;
            return true;
        }
        console.log(`Tried to ready. Player ${socketId} does not exist in Room "${this.name}"`);
        return false;

    }

    isAllReady() {
        for (const [socketId, playerObj] of Object.entries(this.players)) {
            if (!playerObj['ready']) {
                return false;
            }
        }
        return true;
    }

    isFull() {
        return this.num_players === MAX_ROOM_SIZE;
    }

    sendUpdate() {
        for (const [socketId, playerObj] of Object.entries(this.players)) {
            this.io.to(socketId).emit('groupUpdate', this.players);
        }
    }

    startGame() {

    }

}