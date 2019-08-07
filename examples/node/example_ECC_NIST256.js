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

console.log("Start testing ECDH with NIST256");

var ctx = new CTX("NIST256");

var i,
    res;
var pp = "M0ng00se";

var EGS = ctx.ECP.AESKEY;
var sha = ctx.ECP.HASH_TYPE;

var S1 = [];
var W0 = [];
var W1 = [];
var Z0 = [];
var Z1 = [];
var RAW = [];
var SALT = [];
var P1 = [];
var P2 = [];
var V = [];
var M = [];
var T = new Array(12); // must specify required length
var CS = [];
var DS = [];

var rng = new ctx.RAND();

rng.clean();
for (i = 0; i < 100; i++) {
    RAW[i] = i;
}

rng.seed(100, RAW);


for (i = 0; i < 8; i++) {
    SALT[i] = (i + 1);
} // set Salt

console.log("Alice's Passphrase= " + pp);

var PW = ctx.ECDH.stringtobytes(pp);
// private key S0 of size EGS bytes derived from Password and Salt 
var S0 = ctx.ECDH.PBKDF2(sha, PW, SALT, 1000, EGS);

console.log("Alice's private key= 0x" + ctx.ECDH.bytestostring(S0));
// Generate Key pair S/W 
ctx.ECDH.KEY_PAIR_GENERATE(null, S0, W0);

console.log("Alice's public key= 0x" + ctx.ECDH.bytestostring(W0));

res = ctx.ECDH.PUBLIC_KEY_VALIDATE(W0);
if (res != 0) {
    console.error("ECP Public Key is invalid!");
    return (-1);
}
// Random private key for other party 
ctx.ECDH.KEY_PAIR_GENERATE(rng, S1, W1);

console.log("Servers private key= 0x" + ctx.ECDH.bytestostring(S1));
console.log("Servers public key= 0x" + ctx.ECDH.bytestostring(W1));

res = ctx.ECDH.PUBLIC_KEY_VALIDATE(W1);
if (res != 0) {
    console.error("ECP Public Key is invalid!");
    return (-1);
}

// Calculate common key using DH - IEEE 1363 method 

ctx.ECDH.ECPSVDP_DH(S0, W1, Z0);
ctx.ECDH.ECPSVDP_DH(S1, W0, Z1);

var same = true;
for (i = 0; i < ctx.ECDH.EFS; i++) {
    if (Z0[i] != Z1[i]) {
        same = false;
    }
}

if (!same) {
    console.error("ECPSVDP-DH Failed");
    return (-1);
}

var KEY = ctx.ECDH.KDF2(sha, Z0, null, ctx.ECDH.EAS);

console.log("Alice's ECDH Key= 0x" + ctx.ECDH.bytestostring(KEY));
console.log("Servers ECDH Key= 0x" + ctx.ECDH.bytestostring(KEY));

if (ctx.ECP.CURVETYPE != ctx.ECP.MONTGOMERY) {
    console.log("Testing ECIES");

    P1[0] = 0x0;
    P1[1] = 0x1;
    P1[2] = 0x2;
    P2[0] = 0x0;
    P2[1] = 0x1;
    P2[2] = 0x2;
    P2[3] = 0x3;

    for (i = 0; i <= 16; i++) {
        M[i] = i;
    }

    var C = ctx.ECDH.ECIES_ENCRYPT(sha, P1, P2, rng, W1, M, V, T);

    console.log("Ciphertext= ");
    console.log("V= 0x" + ctx.ECDH.bytestostring(V));
    console.log("C= 0x" + ctx.ECDH.bytestostring(C));
    console.log("T= 0x" + ctx.ECDH.bytestostring(T));


    M = ctx.ECDH.ECIES_DECRYPT(sha, P1, P2, V, C, T, S1);
    if (M.length == 0) {
        console.error("ECIES Decryption Failed");
        return (-1);
    } else {
        console.log("Decryption succeeded");
    }

    console.log("Message is 0x" + ctx.ECDH.bytestostring(M));

    console.log("Testing ECDSA");

    if (ctx.ECDH.ECPSP_DSA(sha, rng, S0, M, CS, DS) != 0) {
        console.error("ECDSA Signature Failed");
        return (-1);
    }

    console.log("Signature= ");
    console.log("C= 0x" + ctx.ECDH.bytestostring(CS));
    console.log("D= 0x" + ctx.ECDH.bytestostring(DS));

    if (ctx.ECDH.ECPVP_DSA(sha, W0, M, CS, DS) != 0) {
        console.error("ECDSA Verification Failed");
        return (-1);
    } else {
        console.log("ECDSA Signature/Verification succeeded");
    }
}

rng.clean();

console.log("SUCCESS");
