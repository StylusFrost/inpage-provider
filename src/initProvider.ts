import MetaFlureeInpageProvider from './MetaFlureeInpageProvider'

/**
 * Initializes a MetaFlureeInpageProvider and (optionally) assigns it as window.fluree.
 *
 * @param {Object} options - An options bag.
 * @param {Object} options.connectionStream - A Node.js stream.
 * @param {number} options.maxEventListeners - The maximum number of event listeners.
 * @param {boolean} options.shouldSendMetadata - Whether the provider should send page metadata.
 * @param {boolean} options.shouldSetOnWindow - Whether the provider should be set as window.fluree
 * @returns {MetaFlureInpageProvider | Proxy} The initialized provider (whether set or not).
 */
export function initProvider(opts?: any) {
  const _opts = opts || {}
  const connectionStream = _opts['connectionStream'] || null
  const maxEventListeners = _opts['maxEventListeners'] || 100
  const shouldSendMetadata = _opts['shouldSendMetadata'] || true
  const shouldSetOnWindow = _opts['shouldSetOnWindow'] || true

  let provider = new MetaFlureeInpageProvider(connectionStream, {
    shouldSendMetadata,
    maxEventListeners,
  })

  provider = new Proxy(provider, {
    deleteProperty: () => true,
  })

  if (shouldSetOnWindow) {
    setGlobalProvider(provider)
  }

  return provider
}

/**
 * Sets the given provider instance as window.fluree and dispatches the
 * 'fluree#initialized' event on window.
 *
 * @param {MetaFlureeInpageProvider} providerInstance - The provider instance.
 */
export function setGlobalProvider(providerInstance: MetaFlureeInpageProvider) {
  window.fluree = providerInstance
  window.dispatchEvent(new Event('fluree#initialized'))
}

declare global {
  interface Window {
    fluree: any
  }
}
