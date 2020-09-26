# @flureejs/inpage-provider

## Index

### Classes

- [MetaFlureeInpageProvider](classes/metaflureeinpageprovider.md)

### Variables

- [EMITTED_NOTIFICATIONS](#emitted_notifications)

### Functions

- [NOOP](#noop)
- [createErrorMiddleware](#createerrormiddleware)
- [getRpcPromiseCallback](#getrpcpromisecallback)
- [initProvider](#initprovider)
- [logStreamDisconnectWarning](#logstreamdisconnectwarning)
- [sendSiteMetadata](#sendsitemetadata)
- [setGlobalProvider](#setglobalprovider)

### Object literals

- [errors](#errors)
- [messages](#messages)
- [warnings](#warnings)

---

## Variables

<a id="emitted_notifications"></a>

### `<Const>` EMITTED_NOTIFICATIONS

**● EMITTED_NOTIFICATIONS**: _`string`[]_ = ['fluree_subscription']

_Defined in utils.ts:73_

---

## Functions

<a id="noop"></a>

### `<Const>` NOOP

▸ **NOOP**(): `void`

_Defined in utils.ts:69_

**Returns:** `void`

---

<a id="createerrormiddleware"></a>

### createErrorMiddleware

▸ **createErrorMiddleware**(log: _`any`_): `(Anonymous function)`

_Defined in utils.ts:13_

**Parameters:**

| Name | Type  | Description             |
| ---- | ----- | ----------------------- |
| log  | `any` | The logging API to use. |

**Returns:** `(Anonymous function)`
json-rpc-engine middleware function

---

<a id="getrpcpromisecallback"></a>

### `<Const>` getRpcPromiseCallback

▸ **getRpcPromiseCallback**(resolve: _`Function`_, reject: _`Function`_, unwrapResult?: _`Boolean`_): `(Anonymous function)`

_Defined in utils.ts:35_

**Parameters:**

| Name                         | Type       | Default value |
| ---------------------------- | ---------- | ------------- |
| resolve                      | `Function` | -             |
| reject                       | `Function` | -             |
| `Default value` unwrapResult | `Boolean`  | true          |

**Returns:** `(Anonymous function)`

---

<a id="initprovider"></a>

### initProvider

▸ **initProvider**(opts: _`any`_): [MetaFlureeInpageProvider](classes/metaflureeinpageprovider.md)

_Defined in initProvider.ts:13_

**Parameters:**

| Name            | Type  |
| --------------- | ----- |
| `Optional` opts | `any` |

**Returns:** [MetaFlureeInpageProvider](classes/metaflureeinpageprovider.md)
The initialized provider (whether set or not).

---

<a id="logstreamdisconnectwarning"></a>

### logStreamDisconnectWarning

▸ **logStreamDisconnectWarning**(this: _`any`_, log: _`any`_, remoteLabel: _`string`_, err: _`Error`_): `void`

_Defined in utils.ts:55_

**Parameters:**

| Name        | Type     | Description                           |
| ----------- | -------- | ------------------------------------- |
| this        | `any`    |
| log         | `any`    | The logging API to use.               |
| remoteLabel | `string` | The label of the disconnected stream. |
| err         | `Error`  | The associated error to log.          |

**Returns:** `void`

---

<a id="sendsitemetadata"></a>

### sendSiteMetadata

▸ **sendSiteMetadata**(engine: _`any`_, log: _`any`_): `Promise`<`void`>

_Defined in siteMetadata.ts:10_

**Parameters:**

| Name   | Type  | Description                                |
| ------ | ----- | ------------------------------------------ |
| engine | `any` | The JSON RPC Engine to send metadata over. |
| log    | `any` | The logging API to use.                    |

**Returns:** `Promise`<`void`>

---

<a id="setglobalprovider"></a>

### setGlobalProvider

▸ **setGlobalProvider**(providerInstance: _[MetaFlureeInpageProvider](classes/metaflureeinpageprovider.md)_): `void`

_Defined in initProvider.ts:42_

**Parameters:**

| Name             | Type                                                            | Description            |
| ---------------- | --------------------------------------------------------------- | ---------------------- |
| providerInstance | [MetaFlureeInpageProvider](classes/metaflureeinpageprovider.md) | The provider instance. |

**Returns:** `void`

---

## Object literals

<a id="errors"></a>

### `<Const>` errors

**errors**: _`object`_

_Defined in messages.ts:1_

<a id="errors.disconnected"></a>

#### disconnected

▸ **disconnected**(): `string`

_Defined in messages.ts:2_

**Returns:** `string`

---

<a id="errors.invalidduplexstream"></a>

#### invalidDuplexStream

▸ **invalidDuplexStream**(): `string`

_Defined in messages.ts:7_

**Returns:** `string`

---

<a id="errors.invalidloggermethod"></a>

#### invalidLoggerMethod

▸ **invalidLoggerMethod**(method: _`string`_): `string`

_Defined in messages.ts:14_

**Parameters:**

| Name   | Type     |
| ------ | -------- |
| method | `string` |

**Returns:** `string`

---

<a id="errors.invalidloggerobject"></a>

#### invalidLoggerObject

▸ **invalidLoggerObject**(): `string`

_Defined in messages.ts:13_

**Returns:** `string`

---

<a id="errors.invalidoptions"></a>

#### invalidOptions

▸ **invalidOptions**(maxEventListeners: _`any`_, shouldSendMetadata: _`any`_): `string`

_Defined in messages.ts:8_

**Parameters:**

| Name               | Type  |
| ------------------ | ----- |
| maxEventListeners  | `any` |
| shouldSendMetadata | `any` |

**Returns:** `string`

---

<a id="errors.invalidrequestargs"></a>

#### invalidRequestArgs

▸ **invalidRequestArgs**(): `string`

_Defined in messages.ts:10_

**Returns:** `string`

---

<a id="errors.invalidrequestmethod"></a>

#### invalidRequestMethod

▸ **invalidRequestMethod**(): `string`

_Defined in messages.ts:11_

**Returns:** `string`

---

<a id="errors.invalidrequestparams"></a>

#### invalidRequestParams

▸ **invalidRequestParams**(): `string`

_Defined in messages.ts:12_

**Returns:** `string`

---

<a id="errors.sendsitemetadata"></a>

#### sendSiteMetadata

▸ **sendSiteMetadata**(): `string`

_Defined in messages.ts:3_

**Returns:** `string`

---

<a id="errors.unsupportedsync"></a>

#### unsupportedSync

▸ **unsupportedSync**(method: _`string`_): `string`

_Defined in messages.ts:5_

**Parameters:**

| Name   | Type     |
| ------ | -------- |
| method | `string` |

**Returns:** `string`

---

---

<a id="messages"></a>

### `<Const>` messages

**messages**: _`object`_

_Defined in messages.ts:24_

<a id="messages.errors"></a>

#### errors

**● errors**: _`object`_ = errors

_Defined in messages.ts:25_

#### Type declaration

---

<a id="messages.warnings"></a>

#### warnings

**● warnings**: _`object`_ = warnings

_Defined in messages.ts:26_

#### Type declaration

---

---

<a id="warnings"></a>

### `<Const>` warnings

**warnings**: _`object`_

_Defined in messages.ts:18_

<a id="warnings.experimentalmethods"></a>

#### experimentalMethods

**● experimentalMethods**: _`string`_ = `MetaFluree: 'fluree._MetaFluree' exposes non-standard, experimental methods. They may be removed or changed without warning.`

_Defined in messages.ts:20_

---

<a id="warnings.publicconfigstore"></a>

#### publicConfigStore

**● publicConfigStore**: _`string`_ = `MetaFluree: The property 'publicConfigStore' is deprecated and WILL be removed in the future.`

_Defined in messages.ts:21_

---

---
