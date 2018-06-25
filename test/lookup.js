/* eslint-env mocha */

'use strict'

const { bootTwoGrapes, killGrapes } = require('./helper')
const Link = require('../')
const assert = require('assert')

let grapes
describe('lookup', () => {
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

  it('works with optional arguments', (done) => {
    const link = new Link({
      grape: 'http://127.0.0.1:30001'
    })
    link.start()
    link.startAnnouncing('test', 10000, null, (err) => {
      if (err) throw err
      link.lookup('test', {}, (err, res) => {
        if (err) throw err
        assert.deepEqual(res, [ '127.0.0.1:10000' ])

        // look ma, no options passed!
        link.lookup('test', (err, res) => {
          if (err) throw err
          assert.deepEqual(res, [ '127.0.0.1:10000' ])
          link.stop()
          done()
        })
      })
    })
  })
})
