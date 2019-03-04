/* eslint-env mocha */

'use strict'

const assert = require('assert')
const ed = require('ed25519-supercop')

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

  it('provides sugar for mutable data', (done) => {
    const link = new Link({
      grape: 'http://127.0.0.1:30001'
    })
    link.start()

    const data = { v: 'hello world', seq: 1 }
    const opts = {
      keys: ed.createKeyPair(ed.createSeed())
    }

    link.putMutable(data, opts, (err, hash) => {
      if (err) throw err

      link.get(hash, (err, res) => {
        if (err) throw err

        assert.strictEqual(res.v, 'hello world')
        assert.strictEqual(typeof res.k, 'string')
        assert.strictEqual(typeof res.sig, 'string')
        assert.ok(res.sig)

        link.stop()
        done()
      })
    })
  }).timeout(7000)

  it('mutable data supports salt', (done) => {
    const link = new Link({
      grape: 'http://127.0.0.1:30001'
    })
    link.start()

    const data = { v: 'hello world', seq: 1, salt: 'foobar' }
    const opts = {
      keys: ed.createKeyPair(ed.createSeed())
    }

    link.putMutable(data, opts, (err, hash) => {
      if (err) throw err

      link.get({ hash: hash, salt: 'foobar' }, (err, res) => {
        if (err) throw err

        assert.strictEqual(res.v, 'hello world')
        assert.strictEqual(typeof res.k, 'string')
        assert.strictEqual(typeof res.sig, 'string')
        assert.strictEqual(res.salt, 'foobar')
        assert.ok(res.sig)

        link.stop()
        done()
      })
    })
  }).timeout(7000)

  it('returns errors in case of errors', (done) => {
    const link = new Link({
      grape: 'http://127.0.0.1:30001'
    })
    link.start()

    const data = { v: 'hello world', seq: 1, salt: 'foobar' }
    const opts = {
      keys: ed.createKeyPair(ed.createSeed())
    }

    link.putMutable(data, opts, (err, hash) => {
      if (err) throw err
      link.putMutable(data, opts, (err2, hash) => {
        assert.strictEqual(err2.code, 302)
        link.stop()
        done()
      })
    })
  }).timeout(7000)
})
