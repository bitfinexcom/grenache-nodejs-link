/* eslint-env mocha */

'use strict'

const assert = require('assert')
const Link = require('../')

describe('chaining', () => {
  it('start/stop chains', () => {
    const link = new Link({
      grape: 'http://127.0.0.1:30001'
    }).start().stop()

    assert.ok(link instanceof Link)
  })
})
