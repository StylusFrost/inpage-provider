import MetaFlureeInpageProvider from '../src/MetaFlureeInpageProvider'
import { messages } from '../src/messages'
const expect = require('expect')
import MockDuplexStream from './DuplexStream'

describe('MetaFlureeInpageProvider: Miscellanea', () => {
  describe('constructor', () => {
    it('succeeds if stream is provided', () => {
      expect(() => new MetaFlureeInpageProvider(new MockDuplexStream())).not.toThrow()
    })

    it('succeeds if stream and valid options are provided', () => {
      const stream = new MockDuplexStream()

      expect(
        () =>
          new MetaFlureeInpageProvider(stream, {
            maxEventListeners: 10,
          }),
      ).not.toThrow()

      expect(
        () =>
          new MetaFlureeInpageProvider(stream, {
            shouldSendMetadata: false,
          }),
      ).not.toThrow()

      expect(
        () =>
          new MetaFlureeInpageProvider(stream, {
            maxEventListeners: 10,
            shouldSendMetadata: false,
          }),
      ).not.toThrow()
    })

    it('throws if no or invalid stream is provided', () => {
      expect(() => new MetaFlureeInpageProvider('foo')).toThrow(
        messages.errors.invalidDuplexStream(),
      )

      expect(() => new MetaFlureeInpageProvider({})).toThrow(messages.errors.invalidDuplexStream())
    })

    it('throws if bad options are provided', () => {
      const stream = new MockDuplexStream()

      expect(
        () =>
          new MetaFlureeInpageProvider(stream, {
            maxEventListeners: 10,
            shouldSendMetadata: 'foo',
          }),
      ).toThrow(messages.errors.invalidOptions(10, 'foo'))

      expect(
        () =>
          new MetaFlureeInpageProvider(stream, {
            maxEventListeners: 'foo',
            shouldSendMetadata: true,
          }),
      ).toThrow(messages.errors.invalidOptions('foo', true))
    })

    it('accepts valid custom logger', () => {
      const stream = new MockDuplexStream()

      const customLogger = {
        debug: console.debug,
        error: console.error,
        info: console.info,
        log: console.log,
        trace: console.trace,
        warn: console.warn,
      }

      expect(
        () =>
          new MetaFlureeInpageProvider(stream, {
            logger: customLogger,
          }),
      ).not.toThrow()
    })

    it('throws if non-object logger provided', () => {
      const stream = new MockDuplexStream()

      expect(
        () =>
          new MetaFlureeInpageProvider(stream, {
            logger: 'foo',
          }),
      ).toThrow(messages.errors.invalidLoggerObject())
    })

    it('throws if provided logger is missing method key', () => {
      const stream = new MockDuplexStream()
      const customLogger = {
        debug: console.debug,
        error: console.error,
        info: console.info,
        log: console.log,
        trace: console.trace,
        // warn: console.warn, // missing
      }

      expect(
        () =>
          new MetaFlureeInpageProvider(stream, {
            logger: customLogger,
          }),
      ).toThrow(messages.errors.invalidLoggerMethod('warn'))
    })

    it('throws if provided logger has invalid method', () => {
      const stream = new MockDuplexStream()
      const customLogger = {
        debug: console.debug,
        error: console.error,
        info: console.info,
        log: console.log,
        trace: console.trace,
        warn: 'foo', // not a function
      }

      expect(
        () =>
          new MetaFlureeInpageProvider(stream, {
            logger: customLogger,
          }),
      ).toThrow(messages.errors.invalidLoggerMethod('warn'))
    })
  })

  describe('isConnected', () => {
    it('returns isConnected state', () => {
      const provider = new MetaFlureeInpageProvider(new MockDuplexStream())
      expect(provider.isConnected()).toBeUndefined()

      provider.state.isConnected = true

      expect(provider.isConnected()).toBe(true)

      provider.state.isConnected = false

      expect(provider.isConnected()).toBe(false)
    })
  })
})
