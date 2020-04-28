import querystring from 'query-string';
import { Lib } from 'lance-gg';
import AsteroidsClientEngine from '../client/AsteroidsClientEngine';
import AsteroidsGameEngine from '../common/AsteroidsGameEngine';
const qsOptions = querystring.parse(location.search);
const $ = require('jquery');

// default options, overwritten by query-string options
// is sent to both game engine and client engine
const defaults = {
    traceLevel: Lib.Trace.TRACE_NONE,
    delayInputCount: 5,
    scheduler: 'render-schedule',
    syncOptions: {
        sync: qsOptions.sync || 'extrapolate',
        localObjBending: 0.8,
        remoteObjBending: 1.0,
        bendingIncrements: 6
    }
};
let options = Object.assign(defaults, qsOptions);

// create a client engine and a game engine
// const gameEngine = new AsteroidsGameEngine(options);
// const clientEngine = new AsteroidsClientEngine(gameEngine, options);
// document.addEventListener('DOMContentLoaded', function(e) { clientEngine.start(); });

$(document).ready(() => {
    $('#name-input').focus();
    const sendName = () => {
        const name = $('#name-input').val();
        let gamecode = $('#gamecode-input').val();

        if (gamecode.length === 0) {
            gamecode = '/lobby';
        }
        if (name && name.length < 20) {
            options.playerOptions = {
                playerName: name,
                privateCode: gamecode
            };
            const gameEngine = new AsteroidsGameEngine(options);
            const clientEngine = new AsteroidsClientEngine(gameEngine, options);
            $('#name-prompt-overlay').remove();
            clientEngine.start();
        } else {
            window.alert('Your name cannot be blank or over 20 characters.');
        }
        return false;
    };
    $('#name-form').submit(sendName);
    $('#name-submit').click(sendName);
});