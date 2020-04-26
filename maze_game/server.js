
const PORT = process.env.PORT || 5000
const FRAME_RATE = 1000 / 60
const CHAT_TAG = '[Maze Game]'

// Dependencies.
const express = require('express')
const http = require('http')
const morgan = require('morgan')
const path = require('path')
const socketIO = require('socket.io')

const Game = require('./server/Game')

const Constants = require('./lib/Constants')

// Initialization.
const app = express()
const server = http.Server(app)
const io = socketIO(server)
let games = new Map()
games['public'] = new Game()
let sid2game = new Map()

app.set('port', PORT)

app.use(morgan('dev'))
app.use('/client', express.static(path.join(__dirname, '/client')))
app.use('/dist', express.static(path.join(__dirname, '/dist')))

// Routing
app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, 'views/index.html'))
})

/**
 * Server side input handler, modifies the state of the players and the
 * game based on the input it receives. Everything runs asynchronously with
 * the game loop.
 */
io.on('connection', socket => {

  //TEST ONLY
  socket.on('join-game', (data, callback) => {
    if (data.gamecode in games) {
      games[data.gamecode].addNewPlayer(data.name, socket)
    } else {
      games[data.gamecode] = new Game()
      games[data.gamecode].addNewPlayer(data.name, socket)
    }
    sid2game[socket.id] = data.gamecode
    io.sockets.emit(Constants.SOCKET_CHAT_SERVER_CLIENT, {
      name: CHAT_TAG,
      gamecode: data.gamecode,
      message: `${data.name} has joined the game.`,
      isNotification: true
    })
    callback()
  })


  socket.on(Constants.SOCKET_NEW_PLAYER, (data, callback) => {
    const gamecode = sid2game[socket.id]
    games[gamecode].addNewPlayer(data.name, socket)
    io.sockets.emit(Constants.SOCKET_CHAT_SERVER_CLIENT, {
      name: CHAT_TAG,
      gamecode: gamecode,
      message: `${data.name} has joined the game.`,
      isNotification: true
    })
    callback()
  })

  socket.on(Constants.SOCKET_PLAYER_ACTION, data => {
    games[sid2game[socket.id]].updatePlayerOnInput(socket.id, data)
  })

  socket.on(Constants.SOCKET_CHAT_CLIENT_SERVER, data => {
    io.sockets.emit(Constants.SOCKET_CHAT_SERVER_CLIENT, {
      name: games[sid2game[socket.id]].getPlayerNameBySocketId(socket.id),
      message: data
    })
  })

  socket.on(Constants.SOCKET_DISCONNECT, () => {
    const gamecode = sid2game[socket.id]
    if (games[gamecode]) {
      const name = games[gamecode].removePlayer(socket.id)
      sid2game.delete(socket.id)
      if (games[gamecode].getNumPlayers() === 0) {
        games.delete(gamecode)
      }
      io.sockets.emit(Constants.SOCKET_CHAT_SERVER_CLIENT, {
        name: CHAT_TAG,
        gamecode: gamecode,
        message: `${name} has left the game .`,
        isNotification: true
      })
      console.log(`Game (${gamecode}) removed.`)
    }
  })
})

/**
 * Server side game loop, runs at 60Hz and sends out update packets to all
 * clients every update.
 */
setInterval(() => {
  for (const game of Object.values(games)) {
    game.update()
    game.sendState()
  }
}, FRAME_RATE)

// Starts the server.
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Starting server on port ${PORT}`)
})
