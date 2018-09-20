/* eslint-env mocha */

'use strict'

const assert = require('assert')
const Link = require('../')

const { bootTwoGrapes, killGrapes } = require('./helper')

let grapes
describe('announce and lookups', () => {
  before(function (done) {
    this.timeout(20000)

    bootTwoGrapes((err, g) => {
      if (err) throw err

      grapes = g
      done()
    })
  })

  after(function (done) {
    this.timeout(5000)
    killGrapes(grapes, done)
  })

  it('start and stop announcing', (done) => {
    const link = new Link({
      grape: 'http://127.0.0.1:30001'
    })
    link.start()

    link.startAnnouncing('test', 10000, null, (err) => {
      if (err) throw err

      link.lookup('test', {}, (err, peers) => {
        if (err) throw err

        assert.deepStrictEqual(peers, ['127.0.0.1:10000'])
        link.stop()
        done()
      })
    })
  })
})
