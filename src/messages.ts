export const errors = {
  disconnected: () => `MetaFluree: Lost connection to MetaFluree background process.`,
  sendSiteMetadata: () =>
    `MetaFluree: Failed to send site metadata. This is an internal error, please report this bug.`,
  unsupportedSync: (method: string) =>
    `MetaFluree: The MetaFluree fluree_Web3 object does not support synchronous methods like ${method} without a callback parameter.`,
  invalidDuplexStream: () => 'Must provide a Node.js-style duplex stream.',
  invalidOptions: (maxEventListeners: any, shouldSendMetadata: any) =>
    `Invalid options. Received: { maxEventListeners: ${maxEventListeners}, shouldSendMetadata: ${shouldSendMetadata} }`,
  invalidRequestArgs: () => `Expected a single, non-array, object argument.`,
  invalidRequestMethod: () => `'args.method' must be a non-empty string.`,
  invalidRequestParams: () => `'args.params' must be an object or array if provided.`,
  invalidLoggerObject: () => `'args.logger' must be an object if provided.`,
  invalidLoggerMethod: (method: string) =>
    `'args.logger' must include required method '${method}'.`,
}

export const warnings = {
  // misc
  experimentalMethods: `MetaFluree: 'fluree._MetaFluree' exposes non-standard, experimental methods. They may be removed or changed without warning.`,
  publicConfigStore: `MetaFluree: The property 'publicConfigStore' is deprecated and WILL be removed in the future.`,
}

export const messages = {
  errors: errors,
  warnings: warnings,
}
