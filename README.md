# MCJS - *Milagro Crypto JavaScript*

[![Master Branch](https://img.shields.io/badge/-master:-gray.svg)](https://github.com/apache/incubator-milagro-crypto-js/tree/master)
[![Master Build Status](https://secure.travis-ci.org/apache/incubator-milagro-crypto-js.png?branch=master)](https://travis-ci.org/apache/incubator-milagro-crypto-js?branch=master)
[![Master Coverage Status](https://coveralls.io/repos/github/apache/incubator-milagro-crypto-js/badge.svg?branch=master)](https://coveralls.io/github/apache/incubator-milagro-crypto-js?branch=master)

[![Develop Branch](https://img.shields.io/badge/-develop:-gray.svg)](https://github.com/apache/incubator-milagro-crypto-js/tree/develop)
[![Develop Build Status](https://secure.travis-ci.org/apache/incubator-milagro-crypto-js.png?branch=develop)](https://travis-ci.org/apache/incubator-milagro-crypto-js?branch=develop)
[![Develop Coverage Status](https://coveralls.io/repos/github/apache/incubator-milagro-crypto-js/badge.svg?branch=develop)](https://coveralls.io/github/apache/incubator-milagro-crypto-js?branch=develop)


* **category**:    Library
* **copyright**:   2019 The Apache Software Foundation
* **license**:     ASL 2.0 - http://www.apache.org/licenses/LICENSE-2.0
* **link**:        https://github.com/apache/incubator-milagro-crypto-js

## Description

*MCJS - Milagro Crypto JavaScript*

* MCJS is a standards compliant JavaScript cryptographic library with no
external dependencies except for the random seed source.

* MCJS supports the standards for RSA, ECDH, ECIES, ECDSA and M-PIN, AES-GCM
encryption/decryption, SHA256, SHA384, SHA512 and SHA3 hash functions and a
cryptographically secure random number generator. Furthermore we recently
added New Hope, a post-quantum key exchange.

* MCJS is [Node.js](https://nodejs.org/en/) compatible and browser compatible
(see some examples below).

## Install and run  tests

[Node.js](https://nodejs.org/en/) (minimum v6.9.5) and
[npm](https://www.npmjs.com/) are required in order to build the library and
run the tests. Install also the node.js modules required with the command

```
npm install
```

Run all the tests with the following command

```
npm test
```

## Quick Start
#### Elliptic Curves
Suppose you want to implement ECDH with NIST256 elliptic curve. First you need
to initialize the context:

```
var CTX = require("milagro-crypto-js");

var ctx = new CTX("NIST256");
```
then you can call the functions as follows:
```
ctx.ECDH.KEY_PAIR_GENERATE(...);
ctx.ECDH.ECPSVDP_DH(...);
```
If you need to use more than one elliptic curve in the same script you only
need to initialize two different contexts, for example
```
var ctx1 = new CTX("NIST256");
var ctx2 = new CTX("C25519");
```
The following is the list of all elliptic curves supported by MCJS
```
['ED25519', 'C25519', 'SECP256K1', 'NIST256', 'NIST384', 'BRAINPOOL', 'ANSSI', 'HIFIVE', 'GOLDILOCKS', 'C41417', 'NIST521', 'NUMS256W', 'NUMS256E', 'NUMS384W', 'NUMS384E', 'NUMS512W', 'NUMS512E', 'FP256BN', 'FP512BN', 'BN254', 'BN254CX', 'BLS383', 'BLS24', 'BLS48', 'BLS381', 'BLS461'];
```
#### RSA
This library supports also RSA encryption/decryption and RSA signature. The following is a quick example on how to use RSA. First initialize the context
```
var CTX = require("milagro-crypto-js");

var ctx = new CTX("RSA2048");
```
then you can call the RSA functions as follows:
```
ctx.RSA.ENCRYPT(...);
ctx.RSA.DECRYPT(...);
```
The following is the list of all the RSA security level supported by *MCJS*
```
['RSA2048','RSA3072','RSA4096'];
```
#### Other functions
MCJS supports SHA256, SHA384, SHA512, AES-GCM encryption and Marsaglia & Zaman random number generator. Those functions are contained in every context initialized with RSA or with an elliptic curve. If you want to create a context supporting only those general functions then initialize it with no parameter as follows:
```
var CTX = require("milagro-crypto-js");

var ctx = new CTX();
```

## Run examples

[Node.js](https://nodejs.org/en/) examples are provided - please see
`./examples/node`. Use the following command to run an example

```
node ./examples/node/example_ECC_NIST256.js
```

#### Browsers

The library source code is browser compatible. The browser examples are locates
in `./examples/browser`.

## Contributors 

The following people have contributed to milagro-crypto-js

- Mike Scott
- Kealan McCusker
- Alessandro Budroni
- Samuele Andreoli

Please add yourself here if you make or have made a contribution.

## Making a Contribution

1.  [Check for open issues](https://github.com/apache/incubator-milagro-crypto-js/issues) or start a discussion around a feature idea or a bug by sending a
mail to dev@milagro.incubator.apache.org
2.  Fork the repository to start making your changes. Please use the
"development" branch as a basis.
3.  Write a test which shows that the bug was fixed or that the feature works
as expected.
4.  Make a pull request with a reference to the issue

