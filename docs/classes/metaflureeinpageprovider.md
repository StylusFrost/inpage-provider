[@flureejs/inpage-provider](../README.md) > [MetaFlureeInpageProvider](../classes/metaflureeinpageprovider.md)

# Class: MetaFlureeInpageProvider

## Hierarchy

`any`

**↳ MetaFlureeInpageProvider**

## Index

### Constructors

- [constructor](metaflureeinpageprovider.md#constructor)

### Accessors

- [publicConfigStore](metaflureeinpageprovider.md#publicconfigstore)

### Methods

- [addListener](metaflureeinpageprovider.md#addlistener)
- [getExperimentalApi](metaflureeinpageprovider.md#getexperimentalapi)
- [handleAccountsChanged](metaflureeinpageprovider.md#handleaccountschanged)
- [handleDisconnect](metaflureeinpageprovider.md#handledisconnect)
- [isConnected](metaflureeinpageprovider.md#isconnected)
- [on](metaflureeinpageprovider.md#on)
- [once](metaflureeinpageprovider.md#once)
- [prependListener](metaflureeinpageprovider.md#prependlistener)
- [prependOnceListener](metaflureeinpageprovider.md#prependoncelistener)
- [request](metaflureeinpageprovider.md#request)
- [rpcRequest](metaflureeinpageprovider.md#rpcrequest)
- [sendAsync](metaflureeinpageprovider.md#sendasync)

---

## Constructors

<a id="constructor"></a>

### constructor

⊕ **new MetaFlureeInpageProvider**(connectionStream: _`any`_, opts: _`any`_): [MetaFlureeInpageProvider](metaflureeinpageprovider.md)

_Defined in MetaFlureeInpageProvider.ts:33_

**Parameters:**

| Name             | Type  | Description             |
| ---------------- | ----- | ----------------------- |
| connectionStream | `any` | A Node.js duplex stream |
| `Optional` opts  | `any` |

**Returns:** [MetaFlureeInpageProvider](metaflureeinpageprovider.md)

---

## Accessors

<a id="publicconfigstore"></a>

### publicConfigStore

**publicConfigStore**:

_Defined in MetaFlureeInpageProvider.ts:198_

---

## Methods

<a id="addlistener"></a>

### addListener

▸ **addListener**(eventName: _`string`_, listener: _`any`_): `any`

_Defined in MetaFlureeInpageProvider.ts:279_

**Parameters:**

| Name      | Type     |
| --------- | -------- |
| eventName | `string` |
| listener  | `any`    |

**Returns:** `any`

---

<a id="getexperimentalapi"></a>

### `<Private>` getExperimentalApi

▸ **getExperimentalApi**(): `any`

_Defined in MetaFlureeInpageProvider.ts:417_

**Returns:** `any`

---

<a id="handleaccountschanged"></a>

### `<Private>` handleAccountsChanged

▸ **handleAccountsChanged**(accounts: _`Array`<`Buffer`>_, isFlureeAccounts?: _`Boolean`_, isInternal?: _`Boolean`_): `void`

_Defined in MetaFlureeInpageProvider.ts:374_

**Parameters:**

| Name                             | Type              | Default value | Description                                                                 |
| -------------------------------- | ----------------- | ------------- | --------------------------------------------------------------------------- |
| accounts                         | `Array`<`Buffer`> | -             | The new accounts value.                                                     |
| `Default value` isFlureeAccounts | `Boolean`         | false         | Whether the accounts value was returned by a call to fluree_accounts.       |
| `Default value` isInternal       | `Boolean`         | false         | Whether the accounts value was returned by an internally initiated request. |

**Returns:** `void`

---

<a id="handledisconnect"></a>

### `<Private>` handleDisconnect

▸ **handleDisconnect**(streamName: _`string`_, err: _`Error`_): `void`

_Defined in MetaFlureeInpageProvider.ts:349_

**Parameters:**

| Name       | Type     |
| ---------- | -------- |
| streamName | `string` |
| err        | `Error`  |

**Returns:** `void`

---

<a id="isconnected"></a>

### isConnected

▸ **isConnected**(): `any`

_Defined in MetaFlureeInpageProvider.ts:213_

**Returns:** `any`

---

<a id="on"></a>

### on

▸ **on**(eventName: _`string`_, listener: _`any`_): `any`

_Defined in MetaFlureeInpageProvider.ts:286_

**Parameters:**

| Name      | Type     |
| --------- | -------- |
| eventName | `string` |
| listener  | `any`    |

**Returns:** `any`

---

<a id="once"></a>

### once

▸ **once**(eventName: _`string`_, listener: _`any`_): `any`

_Defined in MetaFlureeInpageProvider.ts:293_

**Parameters:**

| Name      | Type     |
| --------- | -------- |
| eventName | `string` |
| listener  | `any`    |

**Returns:** `any`

---

<a id="prependlistener"></a>

### prependListener

▸ **prependListener**(eventName: _`string`_, listener: _`any`_): `any`

_Defined in MetaFlureeInpageProvider.ts:300_

**Parameters:**

| Name      | Type     |
| --------- | -------- |
| eventName | `string` |
| listener  | `any`    |

**Returns:** `any`

---

<a id="prependoncelistener"></a>

### prependOnceListener

▸ **prependOnceListener**(eventName: _`string`_, listener: _`any`_): `any`

_Defined in MetaFlureeInpageProvider.ts:307_

**Parameters:**

| Name      | Type     |
| --------- | -------- |
| eventName | `string` |
| listener  | `any`    |

**Returns:** `any`

---

<a id="request"></a>

### request

▸ **request**(args: _`any`_): `Promise`<`Object`>

_Defined in MetaFlureeInpageProvider.ts:227_

**Parameters:**

| Name | Type  | Description                |
| ---- | ----- | -------------------------- |
| args | `any` | The RPC request arguments. |

**Returns:** `Promise`<`Object`>
A Promise that resolves with the result of the RPC method, or rejects if an error is encountered.

---

<a id="rpcrequest"></a>

### `<Private>` rpcRequest

▸ **rpcRequest**(payload: _`any`_, callback: _`Function`_, isInternal?: _`Boolean`_): `void`

_Defined in MetaFlureeInpageProvider.ts:323_

**Parameters:**

| Name                       | Type       | Default value | Description              |
| -------------------------- | ---------- | ------------- | ------------------------ |
| payload                    | `any`      | -             | The RPC request object.  |
| callback                   | `Function` | -             | The consumer's callback. |
| `Default value` isInternal | `Boolean`  | false         |

**Returns:** `void`

---

<a id="sendasync"></a>

### sendAsync

▸ **sendAsync**(payload: _`any`_, cb: _`Function`_): `void`

_Defined in MetaFlureeInpageProvider.ts:266_

**Parameters:**

| Name    | Type       | Description             |
| ------- | ---------- | ----------------------- |
| payload | `any`      | The RPC request object. |
| cb      | `Function` | The callback function.  |

**Returns:** `void`

---
