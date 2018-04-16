/* eslint-env mocha */

'use strict'

const assert = require('assert')
const { bootTwoGrapes, killGrapes } = require('./helper')
const Link = require('../')

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

  it('caches lookups and does not explode', (done) => {
    const link = new Link({
      grape: 'http://127.0.0.1:30001'
    })
    link.start()
    link.startAnnouncing('test', 10000, null, (err) => {
      link.lookup('foo', (err, hash) => {
        if (err) throw err
        link.lookup('foo', (err, hash) => {
          if (err) throw err
          done()
        })
      })
    })
  })
})
