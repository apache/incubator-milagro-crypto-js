# Headless Milagro Client Library

[![Master Build Status](https://travis-ci.org/miracl/incubator-milagro-mfa-js-lib.svg?branch=master)](https://travis-ci.org/miracl/incubator-milagro-mfa-js-lib)
[![Master Coverage Status](https://coveralls.io/repos/github/miracl/incubator-milagro-mfa-js-lib/badge.svg?branch=master)](https://coveralls.io/github/miracl/incubator-milagro-mfa-js-lib?branch=master)

* **category**:    Library
* **copyright**:   2016 MIRACL UK LTD
* **license**:     ASL 2.0 - http://www.apache.org/licenses/LICENSE-2.0
* **link**:        https://github.com/apache/incubator-milagro-mfa-js-lib

## Description

NodeJS client for Milagro

## Requirement for build & testing

1. Nodejs
2. Grunt
3. Mocha
4. Bower

## Installation

```bash
$ git clone
$ cd project_folder
$ npm install
$ grunt build
```

## Simple usage example

- Registration

```js
var mpin = mpinjs({server: <serverIP-and-port>});

mpin.init(<callback>);

mpin.makeNewUser(<userId>);

mpin.startRegistration(<userId>, <callback>);

/* Wait for end-user to confirm identity */

mpin.confirmRegistration(<userId>, <callback>);

/* If successful, read desired user secret (PIN or password) */

mpin.finishRegistration(<userId>, <user-secret>);

```
- Authentication

```js
mpin.startAuthentication(<userId>, <callback>);

/* If successful, read user secret (PIN or password) */

mpin.finishAuthentication(<userId>, <user-secret>, <callback>);
```

- Authentication with a mobile device

```js
mpin.getAccessNumber(<callback>);

/* Display Access number to end user */

mpin.waitForMobileAuth(<timeout-sec>, <retry-period-sec>, <callback>);

/*
   If successful - Authentication completed
   If exits with timeout, then no successful authentication from mobile device was completed
   If one needs to cancel the waiting for authentication from the mobile device, call cancelMobileAuth()
*/
```

## Running Tests

Install development dependencies:

```bash
$ npm install
```

Then:

```bash
$ npm test
```

Actively tested with node:

  - 0.10.4

## mpinjs API Reference

### Errors

Errors are returned as objects in callback functions where such are available, and they have the general structure:
```js
{
   code: <error-code>,
   type: <error-desc>,
   message: <optional-message>
}
```
as:

| Field | Type | Notes | Description |
|:----- |:---- |:----- |:----------- |
| `code` | `Number` | Mandatory | Internal error code |
| `type` | `String` | Mandatory | Predefined error description |
| `message` | `String` | Optional | Additional error message where applicable |

The list of errors is:

| Error code | Error desc | Explanation |
|:---------- |:---------- |:----------- |
| `0` | `"MISSING_USERID"` | User ID was not proceeded to the API, while it was required |
| `1` | `"INVALID_USERID"` | The user ID that was provided to the API is not valid or not existing |
| `2` | `"MISSING_PARAMETERS"` | A required parameter was not provided to the API. Usually an additional explanation _message_ will be provided with this error |
| `3` | `"IDENTITY_NOT_VERIFIED"` | `confirmRegistration()` was called while the identity is still not verified |
| `4` | `"IDENTITY_MISSING"` | No user with the provided user ID has been created |
| `5` | `"WRONG_PIN"` | The provided user secret (PIN or password) is wrong and authentication failed |
| `6` | `"WRONG_FLOW"` | The API method was called not according to the correct flow and the provided user has the wrong state  |
| `7` | `"USER_REVOKED"` | A time permit for the user couldn't be retrieved and the user is considered "revoked" by the system |
| `8` | `"TIMEOUT_FINISH"` | The call `waitForMobileAuth()` has ended with timeout and no successful authentication has been done during that time from a mobile device |

### The User object

For each user an object needs to be created. The key to the user object is its identity, which is supposed to be unique.
The user object has a _State_ which basically indicates what can be done with the user.
For instance, if a user has not been registered, it cannot be authenticated, obviously.
The different user states are:

| State | Description |
| ----- | ----------- |
| `"INVALID"` | A user that has just been created and no registration process has been started for it |
| `"STARTED"` | The registration process for this user has been started, but the identity is still not verified |
| `"ACTIVATED"` | A user which has been made active without a need of extra identity verification step |
| `"REGISTERED"` | The user registration process has been completed and its secret (password or PIN) has been successfully set. Such a user can be authenticated |
| `"BLOCKED"` | A user which authentication failed several time in a row and has been blocked by the server. Such user cannot authenticate anymore and need to re-register |

### mpinjs API

#### Callbacks

Some of the API methods have a `callback` parameter.
The convention for the callback function is:
```js
function(error, data)
```
as:
* `error` is an error object as described above, or `null` if no error has occurred.
* `data` is the returned data for the API method. In some cases it might be just 'true' to indicate that the method succeeded, while in others it could be an object carrying some result.

The standard error handling would be as follows:
```js
<some-api-method>( userId, function(err, data) {
    if (err) {
        // Method failed with some error
    } else {
        // Method succeeded, proceed with handling data
    }
});
```

##### `mpinjs(options)`

An `mpinjs` instance is constructed as follows:
```js
mpin = new mpinjs({
    server: "http://ec2-54-77-232-113.eu-west-1.compute.amazonaws.com",
    rpsPrefix: "rps"
})
```
A key/value list of parameters is passed to the constructor as the currently recognized parameters are:
* `server` - _Mandatory_. The address at which the _Milagro MFA Service_ is accessible. This is usually the address of the Relying Party Application. For instance if the backend is an _M-Pin SSO_ server this would be the address of that server.
* `rpsPrefix` - _Optional_. This parameter could be specified in case `rpsPrefix` parameter in the RPS configuration has been changed and is not the default one. If this option is not specified, then the default `"rps"` is used.

##### `init(callback)`

This method will attempt to initialize the `mpinjs` instance according the provided options and retrieve users from the storage.
It makes a request to retrieve the _Client Settings_ from the server.
If the method succeeds, it will return the retrieved client settings as the `data` in the callback function.
 
#### User management API

##### `makeNewUser(userId, deviceId)`

This method will create a new user object in the internal user storage.
The new user will be initialized with the _state_ `"INVALID"`.
The received parameters are:
* `userId` - _Mandatory_, String - The identity of the new user. It should be a unique for the given server / application. The user object could later on be referred to using this user identity.
* `deviceId` - _Optional_, String - Some description of the local device. This Device ID is passed to the RPA, which might store it and use it later to determine which _M-Pin ID_ is associated with this device.

##### `listUsers()`

This method will return a list of all the user objects that `mpinjs` has in its storage.
The user objects are of the form:
```js
{
    userId: <user-identity>,
    deviceId: <device-id>,
    state: <user-state>
}
```
##### `checkUser(userId)`

This method will return `true` is a user object with the given `userId` exists, or `false` if not.

##### `getUser(userId, property)`

This method will return either the user object that is associated with the given `userId`, or id `property` is specified it will return just the value of that property of the user object.
* `userId` - _Mandatory_, String - The user identity associated with the user object
* `property` - _Optional_, String - One of `"deviceId"`, `"state"` or `"userId"`. If specified, only the value of the specified property will be returned. Otherwise the whole user object will be returned, according to the specification in `listUsers()`.

##### `deleteUser(userId)`

This function will delete the user object associated with the given `userId` from the internal storage

#### Registration API

##### `startRegistration(userId, callback)`

Parameters:
* `userId` - _Mandatory_, String - the user identity associated with the user that has to be registered.
* `callback` - _Mandatory_, function(error,data) - The callback that will be called after the registration has been started. This parameter complies to the convention explained above.

This method will start the registration process for the user with the identity `userId`.
Such a user should be previously created with the `makeNewUser()` method and should be in _state_ `"INVALID"`.

After successful completion of this call the user should be in one of two states - `"STARTED"` or `"ACTIVATED"`.
If the user is in state `"STARTED"`, then its identity needs to be verified according to the process chosen by the RPA.
When this process is complete the method `confirmRegistration()` should be called to proceed with the registration process.
If the user is in state `"ACTIVATED"`, then it was instantly made active by the RPA and `confirmRegistration()` could be called right away to continue with the registration process.

##### `restartRegistration(userId, callback)`

Parameters:
* `userId` - _Mandatory_, String - the user identity associated with the user that has to be registered.
* `callback` - _Mandatory_, function(error,data) - The callback that will be called after the registration has been started. This parameter complies to the convention explained above.

This method will restart the registration process for the user with the identity `userId`.
The registration process for the user should have been previously started with `startRegistration()` and the user object should be in _state_ `"STARTED"`.
This method will cause the user identity verification to be restarted, i.e. if the verification is done by sending an e-mail, then a new e-mail will be sent.

After successful completion of this call the user should stay in state `"STARTED"`, awaiting for the identity to be verified.
After it is done, `confirmRegistration()` should be called to proceed with the registration process.

##### `confirmRegistration(userId, callback)`

Parameters:
* `userId` - _Mandatory_, String - the user identity associated with the user which identity needs to be confirmed.
* `callback` - _Mandatory_, function(error,data) - The callback that will be called after the method has been completed. This parameter complies to the convention explained above.

This method attempts to retrieve the _Client Key_ for the user associated with the identity `userId`.
The user is expected to be in one of two states - `"STARTED"` or `"ACTIVATED"`.
If this is not the case, `"WRONG_FLOW"` error will be returned through the callback.
If the user identity has not been verified and the _Client Key_ cannot be retrieved, `"IDENTITY_NOT_VERIFIED"` error will be returned through the callback.
If the method has been completed successfully, then the user state is set to `"ACTIVATED"`.
Afterwards, the desired secret (PIN or password) should be read from the end user and then `finishRegistration()` should be called to complete the user registration.

##### `finishRegistration(userId, pin)`

Parameters:
* `userId` - _Mandatory_, String - the user identity associated with the user which registration process should be finalized.
* `pin` - _Mandatory_, String - The user secret (PIN or password) that should be used while generating the _M-Pin Token_.

This method will generate the and store the _M-Pin Token_ using the _Client Key_ retrieved during `confirmRegistration()` and the provided `pin`.
The users' state has to be `"ACTIVATED"` and its _Client Key_ has to be previously retrieved.
If those conditions are not met, the function will fail, returning a `"WRONG_FLOW"` error.
If successful the method will return `true` and the user state will be set to `"REGISTERED"`.

#### Authentication API

##### `startAuthentication(userId, callback)`

Parameters:
* `userId` - _Mandatory_, String - the user identity associated with the user that needs to be authenticated.
* `callback` - _Mandatory_, function(error,data) - The callback that will be called after the method has been completed. This parameter complies to the convention explained above.

This method will attempt to retrieve _Time Permits_ for the given user, as a first step in the authentication process.
The user has to be in state `"REGISTERED"`.
If this is not the case, `"WRONG_FLOW"` error will be returned through the callback.
If the time permit cannot be retrieved for some reason, `"USER_REVOKED"` error will be returned.

##### `finishAuthentication(userId, pin, callback)`

Parameters:
* `userId` - _Mandatory_, String - the user identity associated with the user that needs to be authenticated.
* `pin` - _Mandatory_, String - the user secret (PIN or password) that should be used for the user authentication.
* `callback` - _Mandatory_, function(error,data) - The callback that will be called after the method has been completed. This parameter complies to the convention explained above.

This method will attempt to authenticate the user against the _Milagro MFA Server_, using the provided `pin`.
The user needs to have a valid time permit, previously retrieved via the `startAuthentication()` method.
If the user authentication fails, `"WRONG_PIN"` error will be returned through the callback.
If the authentication failed several times sequentially (usually 3), the user might become "blocked".
When this happens the users' state will be set to `"BLOCKED"` and this user will no longer be able to authenticate.
If the authentication was successful, the returned `error` through the callback will be `null` and any data that was passed back by the RPA in the authentication response, will be returned through the callbacks' `data` parameter.
Note that this data is not mandatory and might also be `null` or empty.

##### `finishAuthenticationOtp(userId, pin, callback)`

Parameters:
* `userId` - _Mandatory_, String - the user identity associated with the user that needs to be authenticated.
* `pin` - _Mandatory_, String - the user secret (PIN or password) that should be used for the user authentication.
* `callback` - _Mandatory_, function(error,data) - The callback that will be called after the method has been completed. This parameter complies to the convention explained above.

This method is very similar to `finishAuthentication()`, but it is intended to be used when a _One Time Password_ (OTP) is intended to be generated by the server.
Note that not all of the servers support that functionality and currently this time of authentication could only be used against M-Pin SSO servers.
The authentication process is the same, but as a result the `data` provided in the callback will carry the OTP information as follows:
```js
{
    otp: <otp>,
    ttlSeconds: <time-to-live-sec>,
    nowTime: <current-time-sec>,
    expireTime: <expire-time-sec>
}
```
* `otp` - String - the OTP returned by the server
* `ttlSeconds` - Number - the OTP expiration period in seconds.
* `nowTime` - Number - Current Milagro MFA System time in seconds since the Epoch
* `expireTime` - Number - The Milagro MFA System time in seconds since the Epoch when the OTP will expire.

##### `getAccessNumber(callback)`

Parameters:
* `callback` - _Mandatory_, function(error,data) - The callback that will be called after the method has been completed. This parameter complies to the convention explained above.

This method should be used when the authentication is about to be carried out from a remote/mobile device.
For this reason an _Access Number_ should be displayed to the end user, and this number should be used on the mobile device to authenticate the user and then associate the local browser session with the mobile authentication event.
The Access Number has an expiration period, which also should be displayed to the user, normally in a count-down fashion.
Upon successful completion, this method will return through the callback the following `data`:
```js
{
    accessNumber: <access-number>,
    ttlSeconds: <time-to-live-sec>,
    localTimeStart: <current-time-sec>,
    localTimeEnd: <expire-time-sec>
}
```

##### `getQrUrl(prerollId, callback)`

Parameters:
* `prerollId` - _Optional_, String - an optional end-user ID that will be "embedded" into the QA code and will be pre-sed to the Mobile App reading the QR code.
* `callback` - _Mandatory_, function(error,data) - The callback that will be called after the method has been completed. This parameter complies to the convention explained above.

This method should be used when the authentication is about to be carried out from a remote/mobile device.
This is an alternative to the _Access Number_ explained above and thus is very similar to it.
The retrieved URL should be encoded and displayed to the end-user in the form of a QR code, which could be scanned by a Mobile App.
The QR code carries information regarding that associates the local browser session with the mobile authentication event.
The QR Code URL has an expiration period, which also should be displayed to the user, normally in a count-down fashion.
Upon successful completion, this method will return through the callback the following `data`:
 
```js
{
    qrUrl: <qrcode-url>,
    ttlSeconds: <time-to-live-sec>,
    localTimeStart: <current-time-sec>,
    localTimeEnd: <expire-time-sec>
}
```

##### `waitForMobileAuth(timeoutSeconds, requestSeconds, callback, callbackStatus)`

Parameters:
* `timeoutSeconds` - _Mandatory_, Number - The whole period after which the waiting will time-out
* `requestSeconds` - _Optional_, Number - The period for re-attempting to poll for valid authentication from a mobile device. If not specified, the default value will be 3 seconds.
* `callback` - _Mandatory_, function(error,data) - The callback that will be called after the method has been completed. This parameter complies to the convention explained above.
* `callbackStatus` - _Optional_, function(data) - A status callback that is called by this method in order to update the caller about any change of waiting status.

This method should be used when the authentication is about to be carried out from a remote/mobile device.
After an _Access Number_ or a _QR Code URL_ has been retrieved and displayed to the end user, the client should wait for an authentication from a remote/mobile device.
Calling this method will initiate such an awaiting.
The method will poll for a successful authentication each `requestSeconds` and if no such authentication happened will finally fail after `timeoutSeconds`.
When this happens, the `error` returned through the callback will be `"TIMEOUT_FINISH"`.
If successful, the function will return through the callback the same values expected after successful `finishAuthentication()`.
This method will also call `callbackStatus`, if provided, to update for any change of the waiting status.
`callbackStatus` should exit normally, so the control returns back to `waitForMobileAuth`, which will continue waiting.
The data provided to `callbackStatus` has the form:
```js
{
  status: <status>,
  statusCode: <statis-code>,
  userId: <user-id>
}
```
* `status` - either `"wid"` or `"user"`. Status `"wid"` means that the QR code has been scanned, while `"user"` means that the user ID that attempts to authenticate has been provided.
* `statusCode` - a numeric code for the current status. It would normally be 0 meaning that no errors had occurred.
* `userId` - would be empty when the `status` is `"wid"` and if the `status` is `"user"` it will be the identity of the user that is attempting to authenticate.

##### `cancelMobileAuth()`

This method should be used when the authentication is about to be carried out from a remote/mobile device.
This method will prematurely cause the `waitForMobileAuth()` to stop and exit.
This might be necessary if the end user decides to navigate away from the UI page where the waiting for mobile authentication has been initiated.
this method always succeeds.

### Main Flows

##### User Registration
![*](./M-Pin SDK - Registration flow.png)

##### User Authentication
![*](./M-Pin SDK - Authentication flow.png)
