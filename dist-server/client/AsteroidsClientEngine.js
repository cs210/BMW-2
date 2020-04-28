"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lanceGg = require("lance-gg");

var _AsteroidsRenderer = _interopRequireDefault(require("../client/AsteroidsRenderer"));

var _Utils = _interopRequireDefault(require("lance-gg/src/lib/Utils"));

var _socket = _interopRequireDefault(require("socket.io-client"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { return function () { var Super = _getPrototypeOf(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var $ = require('jquery');

var betaTiltThreshold = 40;
var gammaTiltThreshold = 40;
var steerThreshold = 0.4;

var AsteroidsClientEngine = /*#__PURE__*/function (_ClientEngine) {
  _inherits(AsteroidsClientEngine, _ClientEngine);

  var _super = _createSuper(AsteroidsClientEngine);

  function AsteroidsClientEngine(gameEngine, options) {
    var _this;

    _classCallCheck(this, AsteroidsClientEngine);

    _this = _super.call(this, gameEngine, options, _AsteroidsRenderer["default"]);
    _this.playerOptions = options.playerOptions; //  Game input

    if (isTouchDevice()) {
      document.querySelector('#instructionsMobile').classList.remove('hidden');
      _this.actions = new Set();
      _this.fireButton = document.querySelector('.fireButton');
      _this.fireButton.style.opacity = 1;
      _this.boostButton = document.querySelector('.boostButton');
      _this.boostButton.style.opacity = 1;
      window.addEventListener('deviceorientation', _this.handleOrientation.bind(_assertThisInitialized(_this)));

      _this.fireButton.addEventListener('touchstart', _this.handleButton.bind(_assertThisInitialized(_this), 'space'), false);

      _this.boostButton.addEventListener('touchstart', _this.handleButton.bind(_assertThisInitialized(_this), 'up'), false);

      _this.gameEngine.on('client__preStep', _this.preStep.bind(_assertThisInitialized(_this)));
    } else {
      document.querySelector('#instructions').classList.remove('hidden');
      _this.controls = new _lanceGg.KeyboardControls(_assertThisInitialized(_this));

      _this.controls.bindKey('up', 'up', {
        repeat: true
      });

      _this.controls.bindKey('down', 'down', {
        repeat: true
      });

      _this.controls.bindKey('left', 'left', {
        repeat: true
      });

      _this.controls.bindKey('right', 'right', {
        repeat: true
      });

      _this.controls.bindKey('space', 'space');
    }

    return _this;
  }

  _createClass(AsteroidsClientEngine, [{
    key: "handleButton",
    value: function handleButton(action, ev) {
      this.actions.add(action);
      ev.preventDefault();
    }
  }, {
    key: "handleOrientation",
    value: function handleOrientation(event) {
      var isPortrait = window.innerHeight > window.innerWidth;
      var beta = event.beta; // In degree in the range [-180,180]

      var gamma = event.gamma; // In degree in the range [-90,90]

      var flip = gamma > 0;
      var steerValue = Math.max(-1, Math.min(1, beta / betaTiltThreshold)) * (flip ? -1 : 1);

      if (isPortrait) {
        flip = beta < 0;
        steerValue = Math.max(-1, Math.min(1, gamma / gammaTiltThreshold)) * (flip ? -1 : 1);
      }

      this.actions["delete"]('left');
      this.actions["delete"]('right');
      if (steerValue < -steerThreshold) this.actions.add('left');else if (steerValue > steerThreshold) this.actions.add('right');
    } // our pre-step is to process inputs that are "currently pressed" during the game step

  }, {
    key: "preStep",
    value: function preStep() {
      var _this2 = this;

      this.actions.forEach(function (action) {
        return _this2.sendInput(action, {
          movement: true
        });
      });
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

  }, {
    key: "connect",
    value: function connect() {
      var _this3 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var connectSocket = function connectSocket(matchMakerAnswer) {
        return new Promise(function (resolve, reject) {
          if (matchMakerAnswer.status !== 'ok') reject('matchMaker failed status: ' + matchMakerAnswer.status);
          if (_this3.options.verbose) console.log("connecting to game server ".concat(matchMakerAnswer.serverURL));
          _this3.socket = (0, _socket["default"])(matchMakerAnswer.serverURL, options);

          _this3.networkMonitor.registerClient(_this3);

          _this3.socket.once('connect', function () {
            if (_this3.options.verbose) console.log('connection made');
            resolve();
          });

          _this3.socket.once('error', function (error) {
            reject(error);
          });

          _this3.socket.on('playerJoined', function (playerData) {
            _this3.gameEngine.playerId = playerData.playerId;
            _this3.messageIndex = Number(_this3.gameEngine.playerId) * 10000;

            _this3.socket.emit('playerDataUpdate', _this3.playerOptions);
          });

          _this3.socket.on('waitingForPlayer', function (data) {
            document.getElementById('waiting-room-overlay').style.display = 'block';
            document.getElementById('waiting-room-container').style.display = 'block';
            _this3.viewer = _this3.renderer.viewer = data.viewer;
            var reqUpdate = setInterval(function () {
              _this3.socket.emit('requestGroupUpdate');
            }, 250);

            _this3.socket.on('gameBegin', function (data) {
              clearInterval(reqUpdate);
              $('#waiting-room-overlay').remove();
              _this3.gameEngine.playerReady[_this3.gameEngine.playerId] = true;
              _this3.renderer.groupShipPID = data.ship_pid;
            });

            $('#start-submit').click(function () {
              _this3.socket.emit('playerReady', {
                viewer: _this3.viewer
              });

              document.getElementById('start-submit').style.visibility = 'hidden';
            });
          });

          _this3.socket.on('groupFull', function () {
            window.alert('Group is full, please join/create another group.');
            document.getElementById('name-prompt-overlay').style.display = 'block';
            document.getElementById('name-prompt-container').style.display = 'block';
          });

          _this3.socket.on('groupUpdate', function (groupData) {
            document.getElementById('controller_label').innerHTML = groupData.c_playerName;
            document.getElementById('viewer_label').innerHTML = groupData.v_playerName;
            document.getElementById('controller_ready_img').style.visibility = groupData.c_ready ? 'visible' : 'hidden';
            document.getElementById('viewer_ready_img').style.visibility = groupData.v_ready ? 'visible' : 'hidden';
          });

          _this3.socket.on('worldUpdate', function (worldData) {
            _this3.inboundMessages.push(worldData);
          });

          _this3.socket.on('roomUpdate', function (roomData) {
            _this3.gameEngine.emit('client__roomUpdate', roomData);
          });
        });
      };

      var matchmaker = Promise.resolve({
        serverURL: this.options.serverURL,
        status: 'ok'
      });
      if (this.options.matchmaker) matchmaker = _Utils["default"].httpGetPromise(this.options.matchmaker);
      return matchmaker.then(connectSocket);
    }
  }]);

  return AsteroidsClientEngine;
}(_lanceGg.ClientEngine);

exports["default"] = AsteroidsClientEngine;

function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints;
}
//# sourceMappingURL=AsteroidsClientEngine.js.map