'use strict'

const async = require('async')
const { v4: uuidv4 } = require('uuid')
const LRU = require('lru')
const fetch = require('node-fetch')
const CbQ = require('cbq')

class Link {
  constructor (conf) {
    this.conf = {
      grape: '',
      monitorTimeout: 2000,
      requestTimeout: 2500,
      lruMaxSizeLookup: 2500,
      lruMaxAgeLookup: 10000,
      ...conf
    }
  }

  init () {
    this._inited = true
    this.cache = {}
    this.cbq0 = new CbQ()
    this._reqs = new Map()
    this._announces = new Map()
  }

  async _post (url, data, opts, cb) {
    try {
      const resp = await fetch(url, {
        ...opts,
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          ...opts.headers,
          'content-type': 'application/json'
        }
      })

      let respBody = await resp.text()
      try {
        respBody = JSON.parse(respBody)
      } catch (err) {
        // noop
      }

      if (!resp.ok) {
        const err = new Error(respBody)
        err.code = resp.status
        return cb(err)
      }

      return cb(null, respBody)
    } catch (err) {
      return cb(err)
    }
  }

  getRequestHash (type, payload) {
    return `${type}:${JSON.stringify(payload)}`
  }

  request (type, payload, _opts = {}, cb) {
    async.retry(_opts.retry || 1, next => {
      this._request(type, payload, _opts, next)
    }, cb)
  }

  _request (type, payload, _opts, cb) {
    const opts = { timeout: this.conf.requestTimeout, ..._opts }

    const cache = this.cache[type]

    if (cache) {
      const qhash = this.getRequestHash(type, payload)
      const cval = cache.get(qhash)

      if (cval) {
        cb(null, cval)
        return
      }
    }

    const req = this.newRequest(type, payload, opts, cb)
    this.addRequest(req)

    this.cbq0.push(req.qhash, (err, data) => {
      this.handleReply(req.rid, err, data)
    })

    const kcnt = this.cbq0.cnt(req.qhash)
    if (kcnt > 1) {
      return
    }

    this._post(
      `${this.conf.grape}/${type}`,
      { rid: req.rid, data: req.payload },
      {
        timeout: opts.timeout
      },
      (err, msg) => {
        this.handleReply(req.rid, err, msg, true)
      }
    )
  }

  handleReply (rid, err, data, fromGrape = false) {
    const req = this._reqs.get(rid)
    if (!req) {
      return
    }

    if (fromGrape) {
      if (!err && data) {
        const cache = this.cache[req.type]
        if (cache) {
          cache.set(req.qhash, data)
        }
      }

      this.cbq0.trigger(req.qhash, err, data)
      return
    }

    this.delRequest(req)
    req.cb(err, data)
  }

  newRequest (type, payload, opts, cb) {
    const rid = uuidv4()

    const req = {
      rid,
      type,
      payload,
      opts,
      cb: typeof cb === 'function' ? cb : () => {},
      _ts: Date.now()
    }

    req.qhash = this.getRequestHash(type, payload)

    return req
  }

  addRequest (req) {
    this._reqs.set(req.rid, req)
  }

  delRequest (req) {
    this._reqs.delete(req.rid)
  }

  getRequest (rid) {
    return this._reqs.get(rid)
  }

  lookup (key, _opts = {}, cb) {
    if (typeof _opts === 'function') return this.lookup(key, {}, _opts)

    const opts = { retry: 3, ..._opts }

    this.request('lookup', key, opts, (err, res) => {
      if (err) {
        cb(err)
        return
      }

      if (!Array.isArray(res) || !res.length) {
        return cb(new Error('ERR_GRAPE_LOOKUP_EMPTY'))
      }

      cb(null, res)
    })
  }

  startAnnouncing (key, port, opts = {}, cb) {
    if (typeof opts === 'function') return this.startAnnouncing(key, port, undefined, opts)
    const id = port + ':' + key
    if (this._announces.has(id)) return false

    const info = { timeout: null, stopped: false }
    const interval = (opts && opts.interval) || 2 * 60 * 1000
    const ann = () => this.announce(key, port, opts, reann)
    const reann = (err) => {
      if (cb) cb(err)
      cb = null
      if (info.stopped) return
      const ms = Math.ceil(0.5 * interval + Math.random() * interval)
      info.timeout = setTimeout(ann, ms)
    }

    ann()
    this._announces.set(id, info)
  }

  stopAnnouncing (key, port) {
    const id = port + ':' + key
    const info = this._announces.get(id)
    if (!info) return false

    this._announces.delete(id)
    info.stopped = true
    clearTimeout(info.timeout)
  }

  announce (key, port, _opts = {}, cb) {
    if (typeof _opts === 'function') return this.announce(key, port, undefined, _opts)

    if (!cb) {
      cb = () => {}
    }

    const opts = { retry: 3, ..._opts }

    this.request('announce', [key, port], opts, cb)
  }

  put (opts, cb) {
    if (!opts || !cb) throw new Error('ERR_MISSING_ARGS')

    this.request('put', opts, {}, cb)
  }

  get (hash, cb) {
    this.request('get', hash, {}, cb)
  }

  monitor () {
    const now = Date.now()

    this._reqs.forEach(req => {
      if (now > req._ts + req.opts.timeout) {
        this.handleReply(req.rid, new Error('ERR_TIMEOUT'), null, true)
      }
    })

    return this
  }

  start () {
    if (!this._inited) {
      this.init()
    }

    this._monitorItv = setInterval(this.monitor.bind(this), this.conf.monitorTimeout)

    this.cache.lookup = new LRU({
      max: this.conf.lruMaxSizeLookup,
      maxAge: this.conf.lruMaxAgeLookup
    })

    return this
  }

  stop () {
    clearInterval(this._monitorItv)

    for (const entry of Object.values(this.cache)) {
      entry.clear()
    }

    for (const info of this._announces.values()) {
      info.stopped = true
      clearTimeout(info.timeout)
    }

    this._announces.clear()

    return this
  }
}

module.exports = Link
