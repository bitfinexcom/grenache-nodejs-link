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
