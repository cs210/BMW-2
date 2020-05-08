"use strict";

var _queryString = _interopRequireDefault(require("query-string"));

var _lanceGg = require("lance-gg");

var _AsteroidsClientEngine = _interopRequireDefault(require("../client/AsteroidsClientEngine"));

var _AsteroidsGameEngine = _interopRequireDefault(require("../common/AsteroidsGameEngine"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var qsOptions = _queryString["default"].parse(location.search);

var $ = require('jquery'); // default options, overwritten by query-string options
// is sent to both game engine and client engine


var defaults = {
  traceLevel: _lanceGg.Lib.Trace.TRACE_NONE,
  delayInputCount: 5,
  scheduler: 'render-schedule',
  syncOptions: {
    sync: qsOptions.sync || 'extrapolate',
    localObjBending: 0.8,
    remoteObjBending: 1.0,
    bendingIncrements: 6
  }
};
var options = Object.assign(defaults, qsOptions);
$(document).ready(function () {
  $('#name-input').focus();

  var sendName = function sendName() {
    var name = $('#name-input').val();
    var gamecode = $('#gamecode-input').val();

    if (gamecode.length === 0) {
      gamecode = '/lobby';
    }

    if (name && name.length < 20) {
      options.playerOptions = {
        playerName: name,
        privateCode: gamecode,
        verbose: true
      }; // create a client engine and a game engine

      var gameEngine = new _AsteroidsGameEngine["default"](options);
      var clientEngine = new _AsteroidsClientEngine["default"](gameEngine, options);
      document.getElementById('name-prompt-overlay').style.display = 'none';
      document.getElementById('name-prompt-container').style.display = 'none';
      clientEngine.start();
    } else {
      window.alert('Your name cannot be blank or over 20 characters.');
    }

    return false;
  };

  $('#name-form').submit(sendName);
  $('#name-submit').click(sendName);
});
//# sourceMappingURL=ClientEntryPoint.js.map