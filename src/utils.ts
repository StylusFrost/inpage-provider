const EventEmitter = require('events')
import { flureeErrors } from 'fluree-rpc-errors'
const SafeEventEmitter = require('safe-event-emitter')

// utility functions

/**
 * json-rpc-engine middleware that logs RPC errors and and validates req.method.
 *
 * @param {Object} log - The logging API to use.
 * @returns {Function} json-rpc-engine middleware function
 */
export function createErrorMiddleware(log: any) {
  return (req: any, res: any, next: Function) => {
    // json-rpc-engine will terminate the request when it notices this error
    if (typeof req.method !== 'string' || !req.method) {
      res.error = flureeErrors.rpc.invalidRequest({
        message: `The request 'method' must be a non-empty string.`,
        data: req,
      })
    }

    next((done: Function) => {
      const { error } = res
      if (!error) {
        return done()
      }
      log.error(`MetaFluree - RPC Error: ${error.message}`, error)
      return done()
    })
  }
}

// resolve response.result or response, reject errors
export const getRpcPromiseCallback = (
  resolve: Function,
  reject: Function,
  unwrapResult: Boolean = true,
) => (error: Error, response: any) => {
  if (error || response.error) {
    reject(error || response.error)
  } else {
    !unwrapResult || Array.isArray(response) ? resolve(response) : resolve(response.result)
  }
}

/**
 * Logs a stream disconnection error. Emits an 'error' if bound to an
 * EventEmitter that has listeners for the 'error' event.
 *
 * @param {Object} log - The logging API to use.
 * @param {string} remoteLabel - The label of the disconnected stream.
 * @param {Error} err - The associated error to log.
 */
export function logStreamDisconnectWarning(this: any, log: any, remoteLabel: string, err: Error) {
  let warningMsg = `MetaFlureeInpageProvider - lost connection to ${remoteLabel}`
  if (err) {
    warningMsg += `\n${err.stack}`
  }
  log.warn(warningMsg)
  if (this instanceof EventEmitter || this instanceof SafeEventEmitter) {
    if (this.listenerCount('error') > 0) {
      this.emit('error', warningMsg)
    }
  }
}

// eslint-disable-next-line no-empty-function
export const NOOP = () => {}

// constants

export const EMITTED_NOTIFICATIONS = ['fluree_subscription']
