'use strict'

const test = require('brittle')

const Link = require('../')
const { startGrapes, stopGrapes } = require('./helper')

test('stores and receives values', { timeout: 20000 }, async (t) => {
  const grapes = await startGrapes()
  t.teardown(() => stopGrapes(grapes))

  const link = new Link({
    grape: 'http://127.0.0.1:30001'
  })
  link.start()
  t.teardown(() => link.stop())

  await new Promise((resolve, reject) => {
    link.put({ v: 'hello world' }, (err, hash) => {
      if (err) return reject(err)

      link.get(hash, (err, res) => {
        if (err) return reject(err)

        t.is(res.v, 'hello world')
        resolve()
      })
    })
  })
})
