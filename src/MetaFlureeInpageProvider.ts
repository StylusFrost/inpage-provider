const pump = require('pump')
const RpcEngine = require('json-rpc-engine')
const createIdRemapMiddleware = require('json-rpc-engine/src/idRemapMiddleware')
const createJsonRpcStream = require('json-rpc-middleware-stream')
const ObservableStore = require('obs-store')
const asStream = require('obs-store/lib/asStream')
const ObjectMultiplex = require('obj-multiplex')
const SafeEventEmitter = require('safe-event-emitter')
const dequal = require('fast-deep-equal')
import { flureeErrors } from 'fluree-rpc-errors'
const { duplex: isDuplex } = require('is-stream')

import { messages } from './messages'
import { sendSiteMetadata } from './siteMetadata'
import {
  createErrorMiddleware,
  EMITTED_NOTIFICATIONS,
  getRpcPromiseCallback,
  logStreamDisconnectWarning,
  NOOP,
} from './utils'

/**
 * @typedef {Object} ConsoleLike
 * @property {function} debug - Like console.debug
 * @property {function} error - Like console.error
 * @property {function} info - Like console.info
 * @property {function} log - Like console.log
 * @property {function} trace - Like console.trace
 * @property {function} warn - Like console.warn
 */

export default class MetaFlureeInpageProvider extends SafeEventEmitter {
  /**
   * @param {Object} connectionStream - A Node.js duplex stream
   * @param {Object} options - An options bag
   * @param {ConsoleLike} [options.logger] - The logging API to use. Default: console
   * @param {number} [options.maxEventListeners] - The maximum number of event
   * listeners. Default: 100
   * @param {boolean} [options.shouldSendMetadata] - Whether the provider should
   * send page metadata. Default: true
   */

  constructor(connectionStream: any, opts?: any) {
    super()
    this.opts = opts || {}
    this.logger = this.opts['logger'] || console
    this.maxEventListeners = this.opts['maxEventListeners'] || 100
    this.shouldSendMetadata = this.opts['shouldSendMetadata'] || true

    validateLoggerObject(this.logger)

    if (!isDuplex(connectionStream)) {
      throw new Error(messages.errors.invalidDuplexStream())
    }

    if (
      typeof this.maxEventListeners !== 'number' ||
      typeof this.shouldSendMetadata !== 'boolean'
    ) {
      throw new Error(
        messages.errors.invalidOptions(
          this.opts['maxEventListeners'],
          this.opts['shouldSendMetadata'],
        ),
      )
    }

    this.isMetaFluree = true

    this.setMaxListeners(this.maxEventListeners)

    // private state
    this.state = {
      sentWarnings: {
        // methods
        experimentalMethods: false,
        // misc
        publicConfigStore: false,
      },
      isConnected: undefined,
      accounts: undefined,
      isUnlocked: undefined,
    }

    this.metafluree = this.getExperimentalApi()

    // public state
    this.selectedAuthID = null
    this.db = null

    // bind functions
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this)
    this.handleDisconnect = this.handleDisconnect.bind(this)
    this.rpcRequest = this.rpcRequest.bind(this)
    this.request = this.request.bind(this)
    this.sendAsync = this.sendAsync.bind(this)

    // setup connectionStream multiplexing
    const mux = new ObjectMultiplex()
    pump(connectionStream, mux, connectionStream, this.handleDisconnect.bind(this, 'MetaFluree'))

    // subscribe to metafluree public config (one-way)
    this._publicConfigStore = new ObservableStore({ storageKey: 'MetaFluree-Config' })

    // handle isUnlocked changes, and dbChanged events
    this._publicConfigStore.subscribe((state: any) => {
      if ('isUnlocked' in state && state.isUnlocked !== this.state.isUnlocked) {
        this.state.isUnlocked = state.isUnlocked
        if (this.state.isUnlocked) {
          // this will get the exposed accounts, if any
          try {
            this.rpcRequest(
              { method: 'fluree_accounts', params: [] },
              NOOP,
              true, // indicating that fluree_accounts _should_ update accounts
            )
          } catch (_) {
            /* no-op */
          }
        } else {
          // accounts are never exposed when the extension is locked
          this.handleAccountsChanged([])
        }
      }

      // Emit databaseChanged event on database change
      if ('db' in state && state.db !== this.db) {
        this.db = state.db || null
        this.emit('databaseChanged', this.db)
      }
    })

    pump(
      mux.createStream('publicConfig'),
      asStream(this._publicConfigStore),
      // RPC requests should still work if only this stream fails
      logStreamDisconnectWarning.bind(this, this.logger, 'MetaFluree PublicConfigStore'),
    )

    // ignore phishing warning message (handled elsewhere)
    mux.ignoreStream('phishing')

    // setup own event listeners

    this.on('connect', () => {
      this.state.isConnected = true
    })

    // setup RPC connection

    const jsonRpcConnection = createJsonRpcStream()
    pump(
      jsonRpcConnection.stream,
      mux.createStream('provider'),
      jsonRpcConnection.stream,
      this.handleDisconnect.bind(this, 'MetaFluree RpcProvider'),
    )

    // handle RPC requests via dapp-side rpc engine
    const rpcEngine = new RpcEngine()
    rpcEngine.push(createIdRemapMiddleware())
    rpcEngine.push(createErrorMiddleware(this.logger))
    rpcEngine.push(jsonRpcConnection.middleware)
    this.rpcEngine = rpcEngine

    // json rpc notification listener
    jsonRpcConnection.events.on('notification', (payload: any) => {
      const { method, params, result } = payload

      if (method === 'wallet_accountsChanged') {
        this.handleAccountsChanged(result)
        return
      }
      if (EMITTED_NOTIFICATIONS.includes(method)) {
        this.emit('message', {
          type: method,
          data: params,
        })
      }
    })

    // miscellanea

    // send website metadata
    if (this.shouldSendMetadata) {
      const domContentLoadedHandler = async () => {
        await sendSiteMetadata(this.rpcEngine, this.logger)
        window.removeEventListener('DOMContentLoaded', domContentLoadedHandler)
      }
      window.addEventListener('DOMContentLoaded', domContentLoadedHandler)
    }

    // indicate that we've connected
    setTimeout(() => this.emit('connect', { db: this.db }))
  }

  get publicConfigStore() {
    if (!this.state.sentWarnings.publicConfigStore) {
      this.logger.warn(messages.warnings.publicConfigStore)
      this.state.sentWarnings.publicConfigStore = true
    }
    return this._publicConfigStore
  }

  //====================
  // Public Methods
  //====================

  /**
   * Returns whether the provider can process RPC requests.
   */
  public isConnected() {
    return this.state.isConnected
  }

  /**
   * Submits an RPC request for the given method, with the given params.
   * Resolves with the result of the method call, or rejects on error.
   *
   * @param {Object} args - The RPC request arguments.
   * @param {string} args.method - The RPC method name.
   * @param {unknown[] | Object} [args.params] - The parameters for the RPC method.
   * @returns {Promise<unknown>} A Promise that resolves with the result of the RPC method,
   * or rejects if an error is encountered.
   */
  public async request(args: any) {
    if (!args || typeof args !== 'object' || Array.isArray(args)) {
      throw flureeErrors.rpc.invalidRequest({
        message: messages.errors.invalidRequestArgs(),
        data: args,
      })
    }

    const { method, params } = args

    if (typeof method !== 'string' || method.length === 0) {
      throw flureeErrors.rpc.invalidRequest({
        message: messages.errors.invalidRequestMethod(),
        data: args,
      })
    }

    if (
      params !== undefined &&
      !Array.isArray(params) &&
      (typeof params !== 'object' || params === null)
    ) {
      throw flureeErrors.rpc.invalidRequest({
        message: messages.errors.invalidRequestParams(),
        data: args,
      })
    }

    return new Promise((resolve, reject) => {
      this.rpcRequest({ method, params }, getRpcPromiseCallback(resolve, reject))
    })
  }

  /**
   * Submits an RPC request per the given JSON-RPC request object.
   *
   * @param {Object} payload - The RPC request object.
   * @param {Function} cb - The callback function.
   */
  public sendAsync(payload: any, cb: Function) {
    this.rpcRequest(payload, cb)
  }

  /**
   * We override the following event methods so that we can warn consumers
   * about deprecated events:
   *   addListener, on, once, prependListener, prependOnceListener
   */

  /**
   * @inheritdoc
   */
  public addListener(eventName: string, listener: any) {
    return super.addListener(eventName, listener)
  }

  /**
   * @inheritdoc
   */
  public on(eventName: string, listener: any) {
    return super.on(eventName, listener)
  }

  /**
   * @inheritdoc
   */
  public once(eventName: string, listener: any) {
    return super.once(eventName, listener)
  }

  /**
   * @inheritdoc
   */
  public prependListener(eventName: string, listener: any) {
    return super.prependListener(eventName, listener)
  }

  /**
   * @inheritdoc
   */
  public prependOnceListener(eventName: string, listener: any) {
    return super.prependOnceListener(eventName, listener)
  }

  //====================
  // Private Methods
  //====================

  /**
   * Internal RPC method. Forwards requests to background via the RPC engine.
   * Also remap ids inbound and outbound.
   *
   * @param {Object} payload - The RPC request object.
   * @param {Function} callback - The consumer's callback.
   * @param {boolean} [isInternal=false] - Whether the request is internal.
   */
  private rpcRequest(payload: any, callback: Function, isInternal: Boolean = false) {
    let cb = callback

    if (!Array.isArray(payload)) {
      if (!payload.jsonrpc) {
        payload.jsonrpc = '2.0'
      }

      if (payload.method === 'fluree_accounts' || payload.method === 'fluree_request_accounts') {
        // handle accounts changing
        cb = (err: Error, res: any) => {
          this.handleAccountsChanged(
            res.result || [],
            payload.method === 'fluree_accounts',
            isInternal,
          )
          callback(err, res)
        }
      }
    }
    this.rpcEngine.handle(payload, cb)
  }

  /**
   * Called when connection is lost to critical streams.
   */
  private handleDisconnect(streamName: string, err: Error) {
    logStreamDisconnectWarning.bind(this)(this.logger, streamName, err)

    const disconnectError = {
      code: 1011,
      reason: messages.errors.disconnected(),
    }

    if (this.state.isConnected) {
      this.emit('disconnect', disconnectError)
    }
    this.state.isConnected = false
  }

  /**
   * Called when accounts may have changed. Diffs the new accounts value with
   * the current one, updates all state as necessary, and emits the
   * accountsChanged event.
   *
   * @param {string[]} accounts - The new accounts value.
   * @param {boolean} isFlureeAccounts - Whether the accounts value was returned by
   * a call to fluree_accounts.
   * @param {boolean} isInternal - Whether the accounts value was returned by an
   * internally initiated request.
   */
  private handleAccountsChanged(
    accounts: Array<Buffer>,
    isFlureeAccounts: Boolean = false,
    isInternal: Boolean = false,
  ) {
    let _accounts = accounts

    if (!Array.isArray(accounts)) {
      this.logger.error(
        'MetaFluree: Received non-array accounts parameter. Please report this bug.',
        accounts,
      )
      _accounts = []
    }

    // emit accountsChanged if anything about the accounts array has changed
    if (!dequal(this.state.accounts, _accounts)) {
      // we should always have the correct accounts even before fluree_accounts
      // returns, except in cases where isInternal is true
      if (isFlureeAccounts && this.state.accounts !== undefined && !isInternal) {
        this.logger.error(
          `MetaFluree: 'fluree_accounts' unexpectedly updated accounts. Please report this bug.`,
          _accounts,
        )
      }

      this.state.accounts = _accounts

      // handle selectedAuthID
      if (this.selectedAuthID !== _accounts[0]) {
        this.selectedAuthID = _accounts[0] || null
      }

      // only emit the event once all state has been updated
      this.emit('accountsChanged', _accounts)
    }
  }

  /**
   * Constructor helper.
   * Gets experimental metafluree API as Proxy, so that we can warn consumers
   * about its experiment nature.
   */
  private getExperimentalApi() {
    return new Proxy(
      {
        /**
         * Determines if MetaFluree is unlocked by the user.
         *
         * @returns {Promise<boolean>} - Promise resolving to true if MetaFluree is currently unlocked
         */
        isUnlocked: async () => {
          if (this.state.isUnlocked === undefined) {
            await new Promise(resolve => this._publicConfigStore.once('update', () => resolve()))
          }
          return this.state.isUnlocked
        },

        /**
         * Make a batch RPC request.
         */
        requestBatch: async (requests: any) => {
          if (!Array.isArray(requests)) {
            throw flureeErrors.rpc.invalidRequest({
              message: 'Batch requests must be made with an array of request objects.',
              data: requests,
            })
          }

          return new Promise((resolve, reject) => {
            this.rpcRequest(requests, getRpcPromiseCallback(resolve, reject))
          })
        },

        // TODO:deprecation:remove isEnabled, isApproved
        /**
         * Synchronously determines if this domain is currently enabled, with a potential false negative if called to soon
         *
         * @deprecated
         * @returns {boolean} - returns true if this domain is currently enabled
         */
        isEnabled: () => {
          return Array.isArray(this.state.accounts) && this.state.accounts.length > 0
        },

        /**
         * Asynchronously determines if this domain is currently enabled
         *
         * @deprecated
         * @returns {Promise<boolean>} - Promise resolving to true if this domain is currently enabled
         */
        isApproved: async () => {
          if (this.state.accounts === undefined) {
            await new Promise(resolve => this.once('accountsChanged', () => resolve()))
          }
          return Array.isArray(this.state.accounts) && this.state.accounts.length > 0
        },
      },
      {
        get: (obj: any, prop: string) => {
          if (!this.state.sentWarnings.experimentalMethods) {
            this.logger.warn(messages.warnings.experimentalMethods)
            this.state.sentWarnings.experimentalMethods = true
          }
          return obj[prop]
        },
      },
    )
  }
}
function validateLoggerObject(logger: any) {
  if (logger !== console) {
    if (typeof logger === 'object') {
      const methodKeys = ['log', 'warn', 'error', 'debug', 'info', 'trace']
      for (const key of methodKeys) {
        if (typeof logger[key] !== 'function') {
          throw new Error(messages.errors.invalidLoggerMethod(key))
        }
      }
      return
    }
    throw new Error(messages.errors.invalidLoggerObject())
  }
}
