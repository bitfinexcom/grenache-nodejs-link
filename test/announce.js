'use strict'

const test = require('brittle')

const Link = require('../')
const { startGrapes, stopGrapes } = require('./helper')

test('start and stop announcing', { timeout: 20000 }, async (t) => {
  const grapes = await startGrapes()
  t.teardown(() => stopGrapes(grapes))

  const link = new Link({
    grape: 'http://127.0.0.1:30001'
  })
  link.start()
  t.teardown(() => link.stop())

  await new Promise((resolve, reject) => {
    link.startAnnouncing('test', 10000, null, (err) => {
      if (err) return reject(err)

      link.lookup('test', {}, (err, peers) => {
        if (err) return reject(err)

        t.alike(peers, ['127.0.0.1:10000'])
        resolve()
      })
    })
  })
})
