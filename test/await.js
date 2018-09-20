/* eslint-env mocha */

'use strict'

const assert = require('assert')
const ed = require('ed25519-supercop')

const Link = require('../')

const { bootTwoGrapes, killGrapes } = require('./helper')

const getLink = () => {
  const link = new Link({
    grape: 'http://127.0.0.1:30001'
  })
  link.start()

  return link
}

let grapes
describe('await: put-get integration', () => {
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

  it('handles errors', async () => {
    const link = getLink()
    try {
      await link.put()
      throw new Error('test fail')
    } catch (e) {
      assert.ok(e)
      link.stop()
    }
  })

  it('stores and receives values', async () => {
    const link = getLink()

    try {
      const hash = await link.put({ v: 'hello world2' })
      const res = await link.get(hash)

      assert.equal(res.v, 'hello world2')

      link.stop()
    } catch (e) { throw new Error('test fail') }
  }).timeout(7000)

  it('provides sugar for mutable data', async () => {
    const link = getLink()

    const data = { v: 'hello world', seq: 1 }
    const opts = {
      keys: ed.createKeyPair(ed.createSeed())
    }

    try {
      const hash = await link.putMutable(data, opts)
      const res = await link.get(hash)

      assert.equal(res.v, 'hello world')
      assert.equal(typeof res.k, 'string')
      assert.equal(typeof res.sig, 'string')
      assert.ok(res.sig)

      link.stop()
    } catch (e) { throw new Error('test fail') }
  }).timeout(7000)
})
