import { ClientEngine, KeyboardControls } from 'lance-gg';
import AsteroidsRenderer from '../client/AsteroidsRenderer';
import Utils from "lance-gg/src/lib/Utils";
import io from 'socket.io-client';

const betaTiltThreshold = 40;
const gammaTiltThreshold = 40;
const steerThreshold = 0.4;

export default class AsteroidsClientEngine extends ClientEngine {

    constructor(gameEngine, options) {
        super(gameEngine, options, AsteroidsRenderer);
        this.playerOptions = options.playerOptions;
        //  Game input
        if (isTouchDevice()) {
            document.querySelector('#instructionsMobile').classList.remove('hidden');

            this.actions = new Set();

            this.fireButton = document.querySelector('.fireButton');
            this.fireButton.style.opacity = 1;
            this.boostButton = document.querySelector('.boostButton');
            this.boostButton.style.opacity = 1;
            window.addEventListener('deviceorientation', this.handleOrientation.bind(this));
            this.fireButton.addEventListener('touchstart', this.handleButton.bind(this, 'space'), false);
            this.boostButton.addEventListener('touchstart', this.handleButton.bind(this, 'up'), false);
            this.gameEngine.on('client__preStep', this.preStep.bind(this));
        } else {
            document.querySelector('#instructions').classList.remove('hidden');
            this.controls = new KeyboardControls(this);
            this.controls.bindKey('up', 'up', { repeat: true } );
            this.controls.bindKey('down', 'down', { repeat: true } );
            this.controls.bindKey('left', 'left', { repeat: true } );
            this.controls.bindKey('right', 'right', { repeat: true } );
            this.controls.bindKey('space', 'space');
        }
    }

    handleButton(action, ev) {
        this.actions.add(action);
        ev.preventDefault();
    }

    handleOrientation(event) {
        let isPortrait = window.innerHeight > window.innerWidth;
        let beta = event.beta;  // In degree in the range [-180,180]
        let gamma = event.gamma; // In degree in the range [-90,90]
        let flip = gamma > 0;
        let steerValue = Math.max(-1, Math.min(1, beta / betaTiltThreshold)) * (flip?-1:1);
        if (isPortrait) {
            flip = beta < 0;
            steerValue = Math.max(-1, Math.min(1, gamma / gammaTiltThreshold)) * (flip?-1:1);
        }

        this.actions.delete('left');
        this.actions.delete('right');
        if (steerValue < -steerThreshold) this.actions.add('left');
        else if (steerValue > steerThreshold) this.actions.add('right');
    }

    // our pre-step is to process inputs that are "currently pressed" during the game step
    preStep() {
        this.actions.forEach((action) => this.sendInput(action, { movement: true }));
        this.actions = new Set();
    }

    /**
     * Makes a connection to the game server.  Extend this method if you want to add additional
     * logic on every connection. Call the super-class connect first, and return a promise which
     * executes when the super-class promise completes.
     *
     * @param {Object} [options] additional socket.io options
     * @return {Promise} Resolved when the connection is made to the server
     */
    connect(options = {}) {

        let connectSocket = matchMakerAnswer => {
            return new Promise((resolve, reject) => {

                if (matchMakerAnswer.status !== 'ok')
                    reject('matchMaker failed status: ' + matchMakerAnswer.status);

                if (this.options.verbose)
                    console.log(`connecting to game server ${matchMakerAnswer.serverURL}`);
                this.socket = io(matchMakerAnswer.serverURL, options);

                this.networkMonitor.registerClient(this);

                this.socket.once('connect', () => {
                    if (this.options.verbose)
                        console.log('connection made');
                    resolve();
                });

                this.socket.once('error', (error) => {
                    reject(error);
                });

                this.socket.on('playerJoined', (playerData) => {
                    this.gameEngine.playerId = playerData.playerId;
                    this.messageIndex = Number(this.gameEngine.playerId) * 10000;
                    this.socket.emit('playerDataUpdate', this.playerOptions);
                });

                this.socket.on('worldUpdate', (worldData) => {
                    this.inboundMessages.push(worldData);
                });

                this.socket.on('roomUpdate', (roomData) => {
                    this.gameEngine.emit('client__roomUpdate', roomData);
                });
            });
        };

        let matchmaker = Promise.resolve({ serverURL: this.options.serverURL, status: 'ok' });
        if (this.options.matchmaker)
            matchmaker = Utils.httpGetPromise(this.options.matchmaker);

        return matchmaker.then(connectSocket);
    }
}

function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints;
}
