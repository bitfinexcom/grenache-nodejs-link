'use strict'

const test = require('brittle')
const Link = require('../')

test('start/stop chains', (t) => {
  const link = new Link({
    grape: 'http://127.0.0.1:30001'
  }).start().stop()

  t.ok(link instanceof Link)
})
