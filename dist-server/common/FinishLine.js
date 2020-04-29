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

var FinishLine = /*#__PURE__*/function (_PhysicalObject2D) {
  _inherits(FinishLine, _PhysicalObject2D);

  var _super = _createSuper(FinishLine);

  function FinishLine(gameEngine, options, props, dim) {
    var _this;

    _classCallCheck(this, FinishLine);

    _this = _super.call(this, gameEngine, options, props);
    _this.dim = dim;
    return _this;
  }

  _createClass(FinishLine, [{
    key: "onAddToWorld",
    // on add-to-world, create a physics body
    value: function onAddToWorld() {
      game = this.gameEngine;
      p2 = game.physicsEngine.p2;
      this.physicsObj = new p2.Body({
        mass: this.mass,
        damping: 0,
        angularDamping: 0,
        position: [this.position.x, this.position.y],
        velocity: [this.velocity.x, this.velocity.y]
      });
      this.physicsObj.addShape(new p2.Box({
        width: this.dim[0],
        height: this.dim[1],
        collisionGroup: game.FINISHLINE,
        // Belongs to the ASTEROID group
        collisionMask: game.SHIP // Can collide with SHIP group

      }));
      this.addFinishLineVerts();
      game.physicsEngine.world.addBody(this.physicsObj);
    }
  }, {
    key: "addFinishLineVerts",
    value: function addFinishLineVerts() {
      this.physicsObj.verts = [];
      var width = this.physicsObj.shapes[0].width;
      var height = this.physicsObj.shapes[0].height;
      this.physicsObj.verts.push([-width / 2, -height / 2]);
      this.physicsObj.verts.push([-width / 2, height / 2]);
      this.physicsObj.verts.push([width / 2, height / 2]);
      this.physicsObj.verts.push([width / 2, -height / 2]);
    } // on remove-from-world, remove the physics body

  }, {
    key: "onRemoveFromWorld",
    value: function onRemoveFromWorld() {
      game.physicsEngine.world.removeBody(this.physicsObj);
    }
  }, {
    key: "syncTo",
    value: function syncTo(other) {
      _get(_getPrototypeOf(FinishLine.prototype), "syncTo", this).call(this, other);

      this.dim = other.dim;
    }
  }, {
    key: "toString",
    value: function toString() {
      return "FinishLine::".concat(_get(_getPrototypeOf(FinishLine.prototype), "toString", this).call(this), " Level").concat(this.level);
    }
  }, {
    key: "bending",
    // position bending: bend fully to server position in each sync [percent=1.0],
    // unless the position difference is larger than 4.0 (i.e. wrap beyond bounds)
    get: function get() {
      return {
        position: {
          max: 4.0
        }
      };
    }
  }], [{
    key: "netScheme",
    get: function get() {
      return Object.assign({
        level: {
          type: _lanceGg.BaseTypes.TYPES.INT16
        },
        dim: {
          type: _lanceGg.BaseTypes.TYPES.CLASSINSTANCE
        }
      }, _get(_getPrototypeOf(FinishLine), "netScheme", this));
    }
  }]);

  return FinishLine;
}(_lanceGg.PhysicalObject2D);

exports["default"] = FinishLine;
//# sourceMappingURL=FinishLine.js.map