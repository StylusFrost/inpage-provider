import MetaFlureeInpageProvider from '../src/MetaFlureeInpageProvider'
import { messages } from '../src/messages'
const expect = require('expect')
import MockDuplexStream from './DuplexStream'
import sinon, { stub } from 'sinon'

function initProvider() {
  const mockStream = new MockDuplexStream()
  const provider = new MetaFlureeInpageProvider(mockStream)
  provider.mockStream = mockStream
  return provider
}

describe('MetaFlureeInpageProvider: RPC', () => {
  // mocking the underlying stream, and testing the basic functionality of
  // .reqest and .sendAsync
  describe('integration', () => {
    let provider: MetaFlureeInpageProvider

    let error: Error | null
    let response: any

    const setNextRpcEngineResponse = (err: Error | null, res = {}) => {
      error = err
      response = res
      return [err, res]
    }
    let handleMock: any

    beforeEach(() => {
      provider = initProvider()
      handleMock = stub(provider.rpcEngine, 'handle').callsFake((_payload, cb) =>
        cb(error, response),
      )
    })

    it('.request returns result on success', async () => {
      setNextRpcEngineResponse(null, { result: 42 })
      const result = await provider.request({ method: 'foo', params: ['bar'] })

      sinon.assert.calledOnce(handleMock)
      sinon.assert.calledWithMatch(handleMock, {
        method: 'foo',
        params: ['bar'],
      })
      expect(result).toBe(42)
    })

    it('.request throws on error', async () => {
      setNextRpcEngineResponse(new Error('foo'))
      await expect(provider.request({ method: 'foo', params: ['bar'] })).rejects.toThrow('foo')

      sinon.assert.calledOnce(handleMock)
      sinon.assert.calledWithMatch(handleMock, {
        method: 'foo',
        params: ['bar'],
      })
    })

    it('.sendAsync returns response object on success', function(done) {
      setNextRpcEngineResponse(null, { result: 42 })
      return new Promise(resolve => {
        provider.sendAsync({ method: 'foo', params: ['bar'] }, (err: Error, res: any) => {
          sinon.assert.calledOnce(handleMock)
          sinon.assert.calledWithMatch(handleMock, {
            method: 'foo',
            params: ['bar'],
          })
          expect(err).toBeNull()
          expect(res).toStrictEqual({ result: 42 })
          resolve(done())
        })
      }).then()
    })
    it('.sendAsync batch request response on success', async () => {
      setNextRpcEngineResponse(null, [{ result: 42 }, { result: 41 }, { result: 40 }])
      await new Promise(done => {
        provider.sendAsync(
          [
            { method: 'foo', params: ['bar'] },
            { method: 'bar', params: ['baz'] },
            { method: 'baz', params: ['buzz'] },
          ],
          (err: Error, res: any) => {
            sinon.assert.calledOnce(handleMock)
            sinon.assert.calledWithMatch(handleMock, [
              { method: 'foo', params: ['bar'] },
              { method: 'bar', params: ['baz'] },
              { method: 'baz', params: ['buzz'] },
            ])
            expect(err).toBeNull()
            expect(res).toStrictEqual([{ result: 42 }, { result: 41 }, { result: 40 }])
            done()
          },
        )
      })
    })

    it('.sendAsync returns response object on error', async function(done) {
      setNextRpcEngineResponse(new Error('foo'), { error: 'foo' })
      await new Promise(resolve => {
        provider.sendAsync({ method: 'foo', params: ['bar'] }, (err: Error, res: any) => {
          sinon.assert.calledOnce(handleMock)
          sinon.assert.calledWithMatch(handleMock, {
            method: 'foo',
            params: ['bar'],
          })
          expect(err).toStrictEqual(new Error('foo'))
          expect(res).toStrictEqual({ error: 'foo' })
          resolve(done())
        })
      }).then()
    })
  })

  describe('.request', () => {
    let provider: MetaFlureeInpageProvider

    let error: Error | null
    let response: any

    const setNextRpcRequestResponse = (err: Error | null, res = {}) => {
      error = err
      response = res
      return [err, res]
    }
    let rpcRequest: any

    beforeEach(() => {
      provider = initProvider()
      rpcRequest = stub(provider, 'rpcRequest').callsFake((_payload, cb, _isInternal) =>
        cb(error, response),
      )
    })

    it('returns result on success', async () => {
      setNextRpcRequestResponse(null, { result: 42 })
      const result = await provider.request({ method: 'foo', params: ['bar'] })

      sinon.assert.calledOnce(rpcRequest)
      sinon.assert.calledWithMatch(rpcRequest, {
        method: 'foo',
        params: ['bar'],
      })

      expect(result).toBe(42)
    })

    it('throws on error', async () => {
      setNextRpcRequestResponse(new Error('foo'))

      await expect(provider.request({ method: 'foo', params: ['bar'] })).rejects.toThrow('foo')

      sinon.assert.calledOnce(rpcRequest)
      sinon.assert.calledWithMatch(rpcRequest, {
        method: 'foo',
        params: ['bar'],
      })
    })

    it('throws on non-object args', async () => {
      await expect(() => provider.request(null)).rejects.toThrow(
        messages.errors.invalidRequestArgs(),
      )

      await expect(() => provider.request([])).rejects.toThrow(messages.errors.invalidRequestArgs())

      await expect(() => provider.request('foo')).rejects.toThrow(
        messages.errors.invalidRequestArgs(),
      )
    })

    it('throws on invalid args.method', async () => {
      await expect(() => provider.request({})).rejects.toThrow(
        messages.errors.invalidRequestMethod(),
      )

      await expect(() => provider.request({ method: null })).rejects.toThrow(
        messages.errors.invalidRequestMethod(),
      )

      await expect(() => provider.request({ method: 2 })).rejects.toThrow(
        messages.errors.invalidRequestMethod(),
      )

      await expect(() => provider.request({ method: '' })).rejects.toThrow(
        messages.errors.invalidRequestMethod(),
      )
    })

    it('throws on invalid args.params', async () => {
      await expect(() => provider.request({ method: 'foo', params: null })).rejects.toThrow(
        messages.errors.invalidRequestParams(),
      )

      await expect(() => provider.request({ method: 'foo', params: 2 })).rejects.toThrow(
        messages.errors.invalidRequestParams(),
      )

      await expect(() => provider.request({ method: 'foo', params: true })).rejects.toThrow(
        messages.errors.invalidRequestParams(),
      )

      await expect(() => provider.request({ method: 'foo', params: 'a' })).rejects.toThrow(
        messages.errors.invalidRequestParams(),
      )
    })
  })

  // this also tests sendAsync, it being effectively an alias for this method
  describe('.rpcRequest', () => {
    let provider: MetaFlureeInpageProvider

    let error: Error | null
    let response: any

    const setNextRpcEngineResponse = (err: Error | null, res = {}) => {
      error = err
      response = res
      return [err, res]
    }
    let handleMock: any
    let handleAccountsChangedMock: any

    beforeEach(() => {
      provider = initProvider()
      handleMock = stub(provider.rpcEngine, 'handle').callsFake((_payload, cb) =>
        cb(error, response),
      )
      handleAccountsChangedMock = stub(provider, 'handleAccountsChanged')
    })

    it('returns response object on success', async function(done) {
      setNextRpcEngineResponse(null, { result: 42 })
      await new Promise(resolve => {
        provider['rpcRequest']({ method: 'foo', params: ['bar'] }, (err: Error, res: any) => {
          sinon.assert.calledOnce(handleMock)
          sinon.assert.calledWithMatch(handleMock, {
            method: 'foo',
            params: ['bar'],
          })

          expect(err).toBeNull()
          expect(res).toStrictEqual({ result: 42 })
        })
        resolve(done())
      }).then()
    })

    it('returns response object on error', async done => {
      setNextRpcEngineResponse(new Error('foo'), { error: 'foo' })
      await new Promise(resolve => {
        provider['rpcRequest']({ method: 'foo', params: ['bar'] }, (err: Error, res: any) => {
          sinon.assert.calledOnce(handleMock)
          sinon.assert.calledWithMatch(handleMock, {
            method: 'foo',
            params: ['bar'],
          })

          expect(err).toStrictEqual(new Error('foo'))
          expect(res).toStrictEqual({ error: 'foo' })
        })
        resolve(done())
      }).then()
    })

    it('calls handleAccountsChanged on request for fluree_accounts', async done => {
      setNextRpcEngineResponse(null, { result: ['0x1'] })
      await new Promise(resolve => {
        provider['rpcRequest']({ method: 'fluree_accounts' }, (err: Error, res: any) => {
          sinon.assert.calledOnce(handleMock)
          sinon.assert.calledWithMatch(handleMock, {
            method: 'fluree_accounts',
          })

          sinon.assert.calledWithMatch(handleAccountsChangedMock, ['0x1'])

          expect(err).toBeNull()
          expect(res).toStrictEqual({ result: ['0x1'] })
        })
        resolve(done())
      }).then()
    })

    it('calls handleAccountsChanged with empty array on fluree_accounts request returning error', async () => {
      setNextRpcEngineResponse(new Error('foo'), { error: 'foo' })
      await new Promise(done => {
        provider['rpcRequest']({ method: 'fluree_accounts' }, (err: Error, res: any) => {
          sinon.assert.calledOnce(handleMock)
          sinon.assert.calledWithMatch(handleMock, {
            method: 'fluree_accounts',
          })
          sinon.assert.calledWithMatch(handleAccountsChangedMock, [])

          expect(err).toStrictEqual(new Error('foo'))
          expect(res).toStrictEqual({ error: 'foo' })
          done()
        })
      })
    })
  })
})
