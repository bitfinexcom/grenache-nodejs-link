'use strict'

const ed = require('ed25519-supercop')
const Link = require('../')

const data = {
  seq: 1,
  v: 'Hello World!'
  // salt: "foobar"
}

const opts = {
  keys: ed.createKeyPair(ed.createSeed())
}

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

setTimeout(() => {
  link.putMutable(data, opts, (err, hash) => {
    console.log('putMutable:', err, hash)
    if (hash) {
      link.get(hash, (err, res) => {
        console.log('data requested from the DHT', err, res)
      })
    }
  })
}, 2000)
