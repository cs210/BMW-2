"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lanceGg = require("lance-gg");

var _Asteroid = _interopRequireDefault(require("./Asteroid"));

var _Bullet = _interopRequireDefault(require("./Bullet"));

var _Ship = _interopRequireDefault(require("./Ship"));

var _FinishLine = _interopRequireDefault(require("./FinishLine"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { return function () { var Super = _getPrototypeOf(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var AsteroidsGameEngine = /*#__PURE__*/function (_GameEngine) {
  _inherits(AsteroidsGameEngine, _GameEngine);

  var _super = _createSuper(AsteroidsGameEngine);

  function AsteroidsGameEngine(options) {
    var _this;

    _classCallCheck(this, AsteroidsGameEngine);

    _this = _super.call(this, options); // create physics with no friction; wrap positions after each step

    _this.physicsEngine = new _lanceGg.P2PhysicsEngine({
      gameEngine: _assertThisInitialized(_this)
    });
    _this.physicsEngine.world.defaultContactMaterial.friction = 10;

    _this.on('postStep', _this.warpAll.bind(_assertThisInitialized(_this))); // game variables


    Object.assign(_assertThisInitialized(_this), {
      lives: 0,
      shipSize: 0.3,
      shipTurnSpeed: 0.05,
      shipSpeed: 2,
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
      FINISHLINE: Math.pow(2, 4)
    });
    _this.playerReady = {};
    return _this;
  } // If the body is out of space bounds, warp it to the other side


  _createClass(AsteroidsGameEngine, [{
    key: "warpAll",
    value: function warpAll() {
      var _this2 = this;

      this.world.forEachObject(function (id, obj) {
        var p = obj.position;
        var v = obj.velocity;

        if (p.x > _this2.spaceWidth / 2) {
          p.x = _this2.spaceWidth / 2;
          v.x = 0;
        }

        if (p.y > _this2.spaceHeight / 2) {
          p.y = _this2.spaceHeight / 2;
          v.y = 0;
        }

        if (p.x < -_this2.spaceWidth / 2) {
          p.x = -_this2.spaceWidth / 2;
          v.x = 0;
        }

        if (p.y < -_this2.spaceHeight / 2) {
          p.y = -_this2.spaceHeight / 2;
          v.y = 0;
        }

        obj.refreshToPhysics();
      });
    }
  }, {
    key: "registerClasses",
    value: function registerClasses(serializer) {
      serializer.registerClass(_Ship["default"]);
      serializer.registerClass(_Asteroid["default"]);
      serializer.registerClass(_Bullet["default"]);
      serializer.registerClass(_FinishLine["default"]);
    }
  }, {
    key: "processInput",
    value: function processInput(inputData, playerId) {
      _get(_getPrototypeOf(AsteroidsGameEngine.prototype), "processInput", this).call(this, inputData, playerId);

      if (playerId in this.playerReady && this.playerReady[playerId]) {
        // handle keyboard presses
        var playerShip = this.world.queryObject({
          playerId: playerId,
          instanceType: _Ship["default"]
        });

        if (playerShip) {
          if (inputData.input === 'up') {
            /*
            console.log(playerShip.physicsObj.position.y);
            playerShip.physicsObj.position.y += 0.5;
            console.log(playerShip.physicsObj.position.y);
            */
            playerShip.physicsObj.applyForceLocal([0, this.shipSpeed]);
          } else if (inputData.input === 'right') {
            playerShip.physicsObj.angle -= this.shipTurnSpeed;
          } else if (inputData.input === 'left') {
            playerShip.physicsObj.angle += this.shipTurnSpeed;
          } else if (inputData.input === 'down') {
            playerShip.physicsObj.applyForceLocal([0, -this.shipSpeed]);
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
    } // returns a random number between -0.5 and 0.5

  }, {
    key: "rand",
    value: function rand() {
      return Math.random() - 0.5;
    } // create ship

  }, {
    key: "addShip",
    value: function addShip(playerId) {
      var s = new _Ship["default"](this, {}, {
        playerId: playerId,
        mass: 10,
        angularVelocity: 0,
        position: new _lanceGg.TwoVector(-6.4, -3.6),
        velocity: new _lanceGg.TwoVector(0, 0)
      });
      s.lives = this.lives;
      s.won = false;
      this.addObjectToWorld(s);
    } // create asteroids

  }, {
    key: "addAsteroids",
    value: function addAsteroids() {
      // add asteroids to the bottom half of the screen
      for (var i = -0.5; i < 0.4; i = i + 0.1) {
        var x = i * this.spaceWidth;
        var y = -2;
        var vx = 0;
        var vy = 0;
        var va = 0; // Create asteroid Body

        var a = new _Asteroid["default"](this, {}, {
          mass: 100000,
          position: new _lanceGg.TwoVector(x, y),
          velocity: new _lanceGg.TwoVector(vx, vy),
          angularVelocity: va
        }, new _lanceGg.TwoVector(1, 1));
        a.level = 0;
        this.addObjectToWorld(a);
      } // add asteroids to the top half of the screen


      for (var i = 0.5; i > -0.4; i = i - 0.1) {
        var x = i * this.spaceWidth;
        var y = 2;
        var _vx = 0;
        var _vy = 0;
        var _va = 0; // Create asteroid Body

        var a = new _Asteroid["default"](this, {}, {
          mass: 100000,
          position: new _lanceGg.TwoVector(x, y),
          velocity: new _lanceGg.TwoVector(_vx, _vy),
          angularVelocity: _va
        }, new _lanceGg.TwoVector(1, 1));
        a.level = 0;
        this.addObjectToWorld(a);
      }
    } // Add finishline

  }, {
    key: "addFinishLine",
    value: function addFinishLine() {
      var a = new _FinishLine["default"](this, {}, {
        mass: 100000,
        position: new _lanceGg.TwoVector(6.5, 3.75),
        velocity: new _lanceGg.TwoVector(0, 0),
        angularVelocity: 0
      }, new _lanceGg.TwoVector(1, 1));
      a.level = 0;
      this.addObjectToWorld(a);
    } // asteroid explosion

  }, {
    key: "explode",
    value: function explode(asteroid, bullet) {
      // Remove asteroid and bullet
      var asteroidBody = asteroid.physicsObj;
      var level = asteroid.level;
      var x = asteroidBody.position[0];
      var y = asteroidBody.position[1];
      var r = this.asteroidRadius * (this.numAsteroidLevels - level) / this.numAsteroidLevels;
      this.removeObjectFromWorld(asteroid);
      this.removeObjectFromWorld(bullet); // Add new sub-asteroids

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
  }]);

  return AsteroidsGameEngine;
}(_lanceGg.GameEngine);

exports["default"] = AsteroidsGameEngine;
//# sourceMappingURL=AsteroidsGameEngine.js.map