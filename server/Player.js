/**
 * Stores the state of the player on the server. This class will also store
 * other important information such as socket ID, packet number, and latency.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const Constants = require('../lib/Constants')
const Entity = require('../lib/Entity')
const Util = require('../lib/Util')
const Vector = require('../lib/Vector')

/**
 * Player class.
 * @extends Entity
 */
class Player extends Entity {
  /**
   * Constructor for a Player object.
   * @constructor
   * @param {string} name The display name of the player
   * @param {string} socketID The associated socket ID
   * @param {Vector} position The player's starting location
   * @param {number} angle The player's starting tank angle
   */
  constructor(name, socketID) {
    super()

    this.name = name
    this.socketID = socketID

    this.lastUpdateTime = 0
    this.tankAngle = 0
    this.turretAngle = 0
    this.turnRate = 0
    this.speed = Constants.PLAYER_DEFAULT_SPEED

    this.health = Constants.PLAYER_MAX_HEALTH
    this.hitboxSize = Constants.PLAYER_DEFAULT_HITBOX_SIZE

    this.kills = 0
    this.deaths = 0
  }

  /**
   * Creates a new Player object.
   * @param {string} name The display name of the player
   * @param {string} socketID The associated socket ID
   * @return {Player}
   */
  static create(name, socketID) {
    const player = new Player(name, socketID)
    player.spawn()
    return player
  }

  /**
   * Update this player given the client's input data from Input.js
   * @param {Object} data A JSON Object storing the input state
   */
  updateOnInput(data) {
    if (data.up) {
      this.velocity = new Vector(0, -this.speed)
    } else if (data.down) {
      this.velocity = new Vector(0, this.speed)
    } else if (data.left) {
      this.velocity = new Vector(-this.speed, 0)
    } else if (data.right) {
      this.velocity = new Vector(this.speed, 0)
    } else if (!(data.up ^ data.down ^ data.left ^ data.right)) {
      this.velocity = Vector.zero()
    }
  }

  /**
   * Performs a physics update.
   * @param {number} lastUpdateTime The last timestamp an update occurred
   * @param {number} deltaTime The timestep to compute the update with
   */
  update(lastUpdateTime, deltaTime) {
    this.lastUpdateTime = lastUpdateTime
    this.position.add(Vector.scale(this.velocity, deltaTime))
    this.boundToWorld()
    this.tankAngle = Util.normalizeAngle(
      this.tankAngle + this.turnRate * deltaTime)
  }

  /**
   * Returns a boolean determining if the player is dead or not.
   * @return {boolean}
   */
  isDead() {
    return this.health <= 0
  }

  /**
   * Damages the player by the given amount, factoring in shields.
   * @param {number} amount The amount to damage the player by
   */
  damage(amount) {
    this.health -= amount
  }

  /**
   * Handles the spawning (and respawning) of the player.
   */
  spawn() {
    this.position = new Vector(
      Util.randRange(Constants.WORLD_MIN + Constants.WORLD_PADDING,
        Constants.WORLD_MAX - Constants.WORLD_PADDING),
      Util.randRange(Constants.WORLD_MIN + Constants.WORLD_PADDING,
        Constants.WORLD_MAX - Constants.WORLD_PADDING))
    this.angle = Util.randRange(0, 2 * Math.PI)
    this.health = Constants.PLAYER_MAX_HEALTH
  }
}

module.exports = Player
