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

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

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
      shipSpeed: 4,
      // 2
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
            playerShip.physicsObj.applyForce([0, this.shipSpeed]); // playerShip.physicsObj.applyForceLocal([0,this.shipSpeed]);
          } else if (inputData.input === 'right') {
            playerShip.physicsObj.applyForce([this.shipSpeed, 0]); // playerShip.physicsObj.angle -= this.shipTurnSpeed;
          } else if (inputData.input === 'left') {
            playerShip.physicsObj.applyForce([-this.shipSpeed, 0]); // playerShip.physicsObj.angle += this.shipTurnSpeed;
          } else if (inputData.input === 'down') {
            playerShip.physicsObj.applyForce([0, -this.shipSpeed]); // playerShip.physicsObj.applyForceLocal([0,-this.shipSpeed]);
          } else if (inputData.input === 'space') {
            this.emit('shoot', playerShip);
          }

          playerShip.refreshFromPhysics();
        }
      }
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
    }
  }, {
    key: "getRandInt",
    value: function getRandInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    } // create asteroids

  }, {
    key: "addBarriers",
    value: function addBarriers(currentWorld) {
      var world_choice = currentWorld;

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
    } // Add finishline

  }, {
    key: "addFinishLine",
    value: function addFinishLine() {
      var a = new _FinishLine["default"](this, {}, {
        mass: 10000,
        position: new _lanceGg.TwoVector(6.5, 3.75),
        velocity: new _lanceGg.TwoVector(0, 0),
        angularVelocity: 0
      }, new _lanceGg.TwoVector(1, 1));
      a.level = 0;
      this.addObjectToWorld(a);
    }
  }, {
    key: "removeAllBarriers",
    value: function removeAllBarriers() {
      var _iterator = _createForOfIteratorHelper(this.world.queryObjects({
        instanceType: _Asteroid["default"]
      })),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var o = _step.value;
          this.removeObjectFromWorld(o.id);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      var _iterator2 = _createForOfIteratorHelper(this.world.queryObjects({
        instanceType: _FinishLine["default"]
      })),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _o = _step2.value;
          this.removeObjectFromWorld(_o.id);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "resetShip",
    value: function resetShip() {
      var _iterator3 = _createForOfIteratorHelper(this.world.queryObjects({
        instanceType: _Ship["default"]
      })),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var o = _step3.value;
          this.removeObjectFromWorld(o.id);
          this.addShip(o.playerId);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
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
  }, {
    key: "world_one",
    value: function world_one() {
      var a = new _Asteroid["default"](this, {}, {
        mass: 100000,
        position: new _lanceGg.TwoVector(-5, -1.5),
        velocity: new _lanceGg.TwoVector(0, 0),
        angularVelocity: 0
      }, new _lanceGg.TwoVector(1, 3));
      a.level = 0;
      this.addObjectToWorld(a);
    }
  }, {
    key: "world_two",
    value: function world_two() {
      // add asteroids to the bottom half of the screen
      var a = new _Asteroid["default"](this, {}, {
        mass: 100000,
        position: new _lanceGg.TwoVector(-5, -1.5),
        velocity: new _lanceGg.TwoVector(0, 0),
        angularVelocity: 0
      }, new _lanceGg.TwoVector(1, 7));
      a.level = 0;
      this.addObjectToWorld(a); // add asteroids to the bottom half of the screen

      var b = new _Asteroid["default"](this, {}, {
        mass: 100000,
        position: new _lanceGg.TwoVector(5, 1.5),
        velocity: new _lanceGg.TwoVector(0, 0),
        angularVelocity: 0
      }, new _lanceGg.TwoVector(1, 7));
      b.level = 0;
      this.addObjectToWorld(b);
      var c = new _Asteroid["default"](this, {}, {
        mass: 100000,
        position: new _lanceGg.TwoVector(0, 3),
        velocity: new _lanceGg.TwoVector(0, 0),
        angularVelocity: 0
      }, new _lanceGg.TwoVector(1, 4));
      c.level = 0;
      this.addObjectToWorld(c);
      var d = new _Asteroid["default"](this, {}, {
        mass: 100000,
        position: new _lanceGg.TwoVector(0, -3),
        velocity: new _lanceGg.TwoVector(0, 0),
        angularVelocity: 0
      }, new _lanceGg.TwoVector(1, 4));
      d.level = 0;
      this.addObjectToWorld(d);
    }
  }, {
    key: "world_three",
    value: function world_three() {
      // add asteroids to the bottom half of the screen
      var a = new _Asteroid["default"](this, {}, {
        mass: 100000,
        position: new _lanceGg.TwoVector(-1.5, -2),
        velocity: new _lanceGg.TwoVector(0, 0),
        angularVelocity: 0
      }, new _lanceGg.TwoVector(13, 1));
      a.level = 0;
      this.addObjectToWorld(a); // add asteroids to the bottom half of the screen

      var b = new _Asteroid["default"](this, {}, {
        mass: 100000,
        position: new _lanceGg.TwoVector(1.5, 2),
        velocity: new _lanceGg.TwoVector(0, 0),
        angularVelocity: 0
      }, new _lanceGg.TwoVector(13, 1));
      b.level = 0;
      this.addObjectToWorld(b);
    }
  }, {
    key: "world_four",
    value: function world_four() {
      // add asteroids to the bottom half of the screen
      var a = new _Asteroid["default"](this, {}, {
        mass: 100000,
        position: new _lanceGg.TwoVector(-1.5, -2),
        velocity: new _lanceGg.TwoVector(0, 0),
        angularVelocity: 0
      }, new _lanceGg.TwoVector(13, 1));
      a.level = 0;
      this.addObjectToWorld(a);
      var c = new _Asteroid["default"](this, {}, {
        mass: 100000,
        position: new _lanceGg.TwoVector(0, 3),
        velocity: new _lanceGg.TwoVector(0, 0),
        angularVelocity: 0
      }, new _lanceGg.TwoVector(1, 4));
      c.level = 0;
      this.addObjectToWorld(c);
    }
  }]);

  return AsteroidsGameEngine;
}(_lanceGg.GameEngine);

exports["default"] = AsteroidsGameEngine;
//# sourceMappingURL=AsteroidsGameEngine.js.map