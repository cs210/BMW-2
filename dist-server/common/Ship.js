"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lanceGg = require("lance-gg");

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

var game = null;
var p2 = null;

var Ship = /*#__PURE__*/function (_PhysicalObject2D) {
  _inherits(Ship, _PhysicalObject2D);

  var _super = _createSuper(Ship);

  function Ship() {
    _classCallCheck(this, Ship);

    return _super.apply(this, arguments);
  }

  _createClass(Ship, [{
    key: "onAddToWorld",
    value: function onAddToWorld(gameEngine) {
      game = gameEngine;
      p2 = gameEngine.physicsEngine.p2; // Add ship physics

      var shape = this.shape = new p2.Convex({
        vertices: [[game.shipSize * 0.6, -game.shipSize], [0, game.shipSize], [-game.shipSize * 0.6, -game.shipSize]],
        radius: game.shipSize,
        collisionGroup: game.SHIP,
        // Belongs to the SHIP group
        collisionMask: game.ASTEROID | game.FINISHLINE // Only collide with the ASTEROID group

      });
      this.physicsObj = new p2.Body({
        mass: 1,
        position: [this.position.x, this.position.y],
        angle: this.angle,
        damping: .7,
        angularDamping: .7
      });
      this.physicsObj.addShape(shape);
      gameEngine.physicsEngine.world.addBody(this.physicsObj);
    }
  }, {
    key: "onRemoveFromWorld",
    value: function onRemoveFromWorld(gameEngine) {
      game.physicsEngine.world.removeBody(this.physicsObj);
    }
  }, {
    key: "toString",
    value: function toString() {
      return "Ship::".concat(_get(_getPrototypeOf(Ship.prototype), "toString", this).call(this), " lives=").concat(this.lives);
    }
  }, {
    key: "syncTo",
    value: function syncTo(other) {
      _get(_getPrototypeOf(Ship.prototype), "syncTo", this).call(this, other);

      this.lives = other.lives;
      this.won = other.won;
      this.name = other.name;
    }
  }, {
    key: "bending",
    // no position bending if difference is larger than 4.0 (i.e. wrap beyond bounds),
    // no angular velocity bending, no local angle bending
    get: function get() {
      return {
        position: {
          max: 4.0
        },
        angularVelocity: {
          percent: 0.0
        },
        angleLocal: {
          percent: 0.0
        }
      };
    }
  }], [{
    key: "netScheme",
    get: function get() {
      return Object.assign({
        lives: {
          type: _lanceGg.BaseTypes.TYPES.INT8
        },
        won: {
          type: _lanceGg.BaseTypes.TYPES.INT8
        },
        name: {
          type: _lanceGg.BaseTypes.TYPES.STRING
        }
      }, _get(_getPrototypeOf(Ship), "netScheme", this));
    }
  }]);

  return Ship;
}(_lanceGg.PhysicalObject2D);

exports["default"] = Ship;
//# sourceMappingURL=Ship.js.map