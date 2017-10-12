'use strict'

const Link = require('../')

const ed = require('ed25519-supercop')
const bencode = require('bencode')

const { publicKey, secretKey } = ed.createKeyPair(ed.createSeed())

const value = 'Hello World!'
const data = {
  k: publicKey.toString('hex'),
  seq: 1,
  v: value
}

const toEncode = { seq: data.seq, v: data.v }
const encoded = bencode.encode(toEncode).slice(1, -1).toString()
data.sig = ed.sign(encoded, publicKey, secretKey).toString('hex')

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

setTimeout(() => {
  link.put(data, (err, hash) => {
    console.log(err, hash)
    if (hash) {
      link.get(hash, (err, res) => {
        console.log('data requested from the DHT', err, res)
      })
    }
  })
}, 2000)
