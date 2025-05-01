/* eslint-env mocha */

'use strict'

const assert = require('assert')

const Link = require('../')
const { startGrapes, stopGrapes } = require('./helper')

describe('announce and lookups', () => {
  let grapes
  before(async function () {
    this.timeout(20000)

    grapes = await startGrapes()
  })

  after(async function () {
    this.timeout(5000)
    await stopGrapes(grapes)
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
