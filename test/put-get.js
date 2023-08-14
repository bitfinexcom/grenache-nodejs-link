/* eslint-env mocha */

'use strict'

const assert = require('assert')

const Link = require('../')

const createGrapes = require('bfx-svc-test-helper/grapes')

let grapes
describe('announce and lookups', () => {
  before(function (done) {
    this.timeout(20000)

    grapes = createGrapes()
    grapes.start(done)
  })

  after(function (done) {
    this.timeout(5000)
    grapes.stop(done)
  })

  it('stores and receives values', (done) => {
    const link = new Link({
      grape: 'http://127.0.0.1:30001'
    })
    link.start()

    link.put({ v: 'hello world' }, (err, hash) => {
      if (err) throw err

      link.get(hash, (err, res) => {
        if (err) throw err

        assert.strictEqual(res.v, 'hello world')

        link.stop()
        done()
      })
    })
  }).timeout(7000)
})
