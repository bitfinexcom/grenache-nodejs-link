'use strict'

const Link = require('../')

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})

link.start()

;(async () => {
  try {
    const hash = await link.put({ v: 'hello world2' })
    const res = await link.get(hash)

    console.log('data received:', res)
  } catch (e) { console.error(e) }
})()
