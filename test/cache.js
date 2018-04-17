/* eslint-env mocha */

'use strict'

const { bootTwoGrapes, killGrapes } = require('./helper')
const Link = require('../')
const assert = require('assert')

let grapes
describe('caching', () => {
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

  it('caches lookups', (done) => {
    const link = new Link({
      grape: 'http://127.0.0.1:30001'
    })
    link.start()
    link.startAnnouncing('test', 10000, null, (err) => {
      if (err) throw err
      link.lookup('test', {}, (err, hash) => {
        if (err) throw err
        link.lookup('test', {}, (err, hash) => {
          if (err) throw err
          assert.deepEqual(
            link.cache['lookup'].get('lookup:"test"'),
            [ '127.0.0.1:10000' ]
          )
          link.stop()
          done()
        })
      })
    })
  })
})
