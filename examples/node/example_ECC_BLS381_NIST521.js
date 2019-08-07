/*
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

/* Test ECC - test driver and function exerciser for ECDH/ECIES/ECDSA API Functions */

var CTX = require("../../index");

var ctx1 = new CTX("BLS381");
var ctx2 = new CTX("NIST521");

console.log("Start testing BLS381");

var pp = "M0ng00se",
    res,
    i;

var S1 = [];
var W0 = [];
var W1 = [];
var Z0 = [];
var Z1 = [];
var RAW = [];
var SALT = [];

var rng = new ctx1.RAND();

rng.clean();
for (i = 0; i < 100; i++) {
    RAW[i] = i;
}

rng.seed(100, RAW);


for (i = 0; i < 8; i++) {
    SALT[i] = (i + 1);
} // set Salt

console.log("Alice's Passphrase= " + pp);

var PW = ctx1.ECDH.stringtobytes(pp);
// private key S0 of size EGS bytes derived from Password and Salt
var S0 = ctx1.ECDH.PBKDF2(ctx1.ECP.HASH_TYPE, PW, SALT, 1000, ctx1.ECP.AESKEY);

console.log("Alice's private key= 0x" + ctx1.ECDH.bytestostring(S0));
// Generate Key pair S/W
ctx1.ECDH.KEY_PAIR_GENERATE(null, S0, W0);

//console.log("Alice's public key= 0x" + ctx1.ECDH.bytestostring(W0));

res = ctx1.ECDH.PUBLIC_KEY_VALIDATE(W0);
if (res != 0) {
    console.error("ECP_ZZZ Public Key is invalid!");
    return (-1);
}
// Random private key for other party
ctx1.ECDH.KEY_PAIR_GENERATE(rng, S1, W1);

console.log("Servers private key= 0x" + ctx1.ECDH.bytestostring(S1));
//console.log("Servers public key= 0x" + ctx1.ECDH.bytestostring(W1));

res = ctx1.ECDH.PUBLIC_KEY_VALIDATE(W1);
if (res != 0) {
    console.error("ECP_ZZZ Public Key is invalid!");
    return (-1);
}

// Calculate common key using DH - IEEE 1363 method

ctx1.ECDH.ECPSVDP_DH(S0, W1, Z0);
ctx1.ECDH.ECPSVDP_DH(S1, W0, Z1);

var same = true;
for (i = 0; i < ctx1.ECDH.EFS; i++) {
    if (Z0[i] != Z1[i]) {
        same = false;
    }
}

if (!same) {
    console.error("ECP_ZZZSVDP-DH Failed");
    return (-1);
}

var KEY = ctx1.ECDH.KDF2(ctx1.ECP.HASH_TYPE, Z0, null, ctx1.ECP.AESKEY);

console.log("Alice's ECDH Key= 0x" + ctx1.ECDH.bytestostring(KEY));
console.log("Servers ECDH Key= 0x" + ctx1.ECDH.bytestostring(KEY));


console.log("\ntart testing NIST251");

var i,
    res;
var pp = "M0ng00se";

var S1 = [];
var W0 = [];
var W1 = [];
var Z0 = [];
var Z1 = [];
var RAW = [];
var SALT = [];

var rng = new ctx2.RAND();

rng.clean();
for (i = 0; i < 100; i++) {
    RAW[i] = i;
}

rng.seed(100, RAW);

for (i = 0; i < 8; i++) {
    SALT[i] = (i + 1);
} // set Salt

console.log("Alice's Passphrase= " + pp);

var PW = ctx2.ECDH.stringtobytes(pp);
// private key S0 of size EGS bytes derived from Password and Salt
var S0 = ctx2.ECDH.PBKDF2(ctx2.ECP.HASH_TYPE, PW, SALT, 1000, ctx1.ECDH.EGS);

console.log("Alice's private key= 0x" + ctx2.ECDH.bytestostring(S0));
// Generate Key pair S/W
ctx2.ECDH.KEY_PAIR_GENERATE(null, S0, W0);

//console.log("Alice's public key= 0x" + ctx2.ECDH.bytestostring(W0));

res = ctx2.ECDH.PUBLIC_KEY_VALIDATE(W0);
if (res != 0) {
    console.error("ECP_ZZZ Public Key is invalid!");
    return (-1);
}
// Random private key for other party
ctx2.ECDH.KEY_PAIR_GENERATE(rng, S1, W1);

console.log("Servers private key= 0x" + ctx2.ECDH.bytestostring(S1));
//console.log("Servers public key= 0x" + ctx2.ECDH.bytestostring(W1));

res = ctx2.ECDH.PUBLIC_KEY_VALIDATE(W1);
if (res != 0) {
    console.error("ECP_ZZZ Public Key is invalid!");
    return (-1);
}

// Calculate common key using DH - IEEE 1363 method

ctx2.ECDH.ECPSVDP_DH(S0, W1, Z0);
ctx2.ECDH.ECPSVDP_DH(S1, W0, Z1);

var same = true;
for (i = 0; i < ctx2.ECDH.EFS; i++) {
    if (Z0[i] != Z1[i]) {
        same = false;
    }
}

if (!same) {
    console.error("ECP_ZZZSVDP-DH Failed");
    return (-1);
}

var KEY = ctx2.ECDH.KDF2(ctx2.ECP.HASH_TYPE, Z0, null, ctx2.ECP.AESKEY);

console.log("Alice's ECDH Key= 0x" + ctx2.ECDH.bytestostring(KEY));
console.log("Servers ECDH Key= 0x" + ctx2.ECDH.bytestostring(KEY));

console.log("SUCCESS");
