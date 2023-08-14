/* eslint-env mocha */

'use strict'

const Link = require('../')
const assert = require('assert')

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

  it('works with optional arguments', (done) => {
    const link = new Link({
      grape: 'http://127.0.0.1:30001'
    })
    link.start()
    link.startAnnouncing('test', 10000, null, (err) => {
      if (err) throw err
      link.lookup('test', {}, (err, res) => {
        if (err) throw err
        assert.deepStrictEqual(res, ['127.0.0.1:10000'])

        // look ma, no options passed!
        link.lookup('test', (err, res) => {
          if (err) throw err
          assert.deepStrictEqual(res, ['127.0.0.1:10000'])
          link.stop()
          done()
        })
      })
    })
  })
})
