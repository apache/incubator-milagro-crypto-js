# Headless M-Pin Client Library

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
   If successfull - Authentication completed
   If exits with timeout, then no successfull authentication from mobile device was completed
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
