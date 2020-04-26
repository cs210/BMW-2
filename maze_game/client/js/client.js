require('../less/styles.less')

const $ = require('jquery')
const io = require('socket.io-client')

const Chat = require('./game/Chat')
const Game = require('./game/Game')

$(document).ready(() => {
  const socket = io()
  const game = Game.create(socket, 'canvas', 'leaderboard')
  const chat = Chat.create(socket, 'chat-display', 'chat-input')
  $('#name-input').focus()

  /**
   * Function to send the player name to the server.
   * @return {false}
   */

  const sendName = () => {
    const name = $('#name-input').val()
    var gamecode = $('#gamecode-input').val()

    const startGame = () => {
      $('#waiting-room-overlay').remove()
      $('#canvas').focus()
      game.run()
      chat.gamecode = gamecode
      chat.playerJoinMessage(name)
    }

    if (gamecode.length === 0) {
      gamecode = 'public'
    }
    if (name && name.length < 20) {
      $('#name-prompt-container').empty()
      $('#name-prompt-container').append(
        $('<span>').addClass('fa fa-2x fa-spinner fa-pulse'))
      socket.emit('join-game', { name , gamecode }, () => {
        $('#name-prompt-overlay').remove()
        $('#start-submit').click(startGame)
        document.getElementById("waiting-room-overlay").style.display = "block";
        document.getElementById("waiting-room-container").style.display = "block";
      })
    } else {
      window.alert('Your name cannot be blank or over 20 characters.')
    }
    return false
  }
  $('#name-form').submit(sendName)
  $('#name-submit').click(sendName)
})
