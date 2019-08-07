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

/* Test RSA - test driver and function exerciser for RSA_2048 and ECDSA with NIST256 */

var CTX = require("../../index");

var ctx1 = new CTX("RSA2048");

console.log("Start test RSA2048");

var i, j = 0;

var RAW = [];
var rng = new ctx1.RAND();
rng.clean();
for (i = 0; i < 100; i++) {
    RAW[i] = i;
}

rng.seed(100, RAW);

var sha = ctx1.RSA.HASH_TYPE;
var message = "Hello World\n";
var pub = new ctx1.rsa_public_key(ctx1.FF.FFLEN);
var priv = new ctx1.rsa_private_key(ctx1.FF.HFLEN);

var ML = [];
var C = [];
var S = [];
var SALT = [];
var pp = "M0ng00se";
var CS = [];
var DS = [];
var S0 = [];
var W0 = [];

var start, end, time;
start = new Date().getTime();
console.log("Generate RSA public/private key pair");

ctx1.RSA.KEY_PAIR(rng, 65537, priv, pub);

end = new Date().getTime();
time = end - start;
console.log("Time in ms= " + time);

var M = ctx1.RSA.stringtobytes(message);
console.log("Encrypting test string");

var E = ctx1.RSA.OAEP_ENCODE(sha, M, rng, null); /* OAEP encode message m to e  */
console.log("Encoding= 0x" + ctx1.RSA.bytestohex(E));

console.log("Public key= 0x" + pub.n.toString());

start = new Date().getTime();
ctx1.RSA.ENCRYPT(pub, E, C); /* encrypt encoded message */
end = new Date().getTime();
time = end - start;
console.log("Time in ms= " + time);

console.log("Ciphertext= 0x" + ctx1.RSA.bytestohex(C));

console.log("Decrypting test string");
start = new Date().getTime();
ctx1.RSA.DECRYPT(priv, C, ML);
end = new Date().getTime();
time = end - start;
console.log("Time in ms= " + time);

var cmp = true;
if (E.length != ML.length) {
    cmp = false;
} else {
    for (j = 0; j < E.length; j++) {
        if (E[j] != ML[j]) {
            cmp = false;
        }
    }
}
if (cmp) {
    console.log("Decryption is OK");
} else {
    console.error("Decryption Failed");
    process.exit(-1);
}

var MS = ctx1.RSA.OAEP_DECODE(sha, null, ML); /* OAEP decode message  */
console.log("Decoding= 0x" + ctx1.RSA.bytestohex(MS));

console.log("message= " + ctx1.RSA.bytestostring(MS));

console.log("Start test RSA signature");

ctx1.RSA.PKCS15(sha, M, C);

ctx1.RSA.DECRYPT(priv, C, S); /* create signature in S */

console.log("Signature= 0x" + ctx1.RSA.bytestohex(S));

ctx1.RSA.ENCRYPT(pub, S, ML);

cmp = true;
if (C.length != ML.length) {
    cmp = false;
} else {
    for (j = 0; j < C.length; j++) {
        if (C[j] != ML[j]) {
            cmp = false;
        }
    }
}
if (cmp) {
    console.log("Signature is valid");
} else {
    console.error("Signature is INVALID");
    process.exit(-1);
}
ctx1.RSA.PRIVATE_KEY_KILL(priv);

console.log("SUCCESS");


var ctx2 = new CTX("NIST256");

console.log("\n\nStart test ECDSA NIST256");

for (i = 0; i < 8; i++) {
    SALT[i] = (i + 1);
} // set Salt

console.log("Alice's Passphrase= " + pp);

// Random private key for other party
ctx2.ECDH.KEY_PAIR_GENERATE(rng, S0, W0);

// message
for (i = 0; i <= 16; i++) {
    M[i] = i;
}

if (ctx2.ECDH.ECPSP_DSA(sha, rng, S0, M, CS, DS) != 0) {
    console.error("ECDSA Signature Failed");
    return (-1);
}

console.log("Signature= ");
console.log("C= 0x" + ctx2.ECDH.bytestostring(CS));
console.log("D= 0x" + ctx2.ECDH.bytestostring(DS));

if (ctx2.ECDH.ECPVP_DSA(sha, W0, M, CS, DS) != 0) {
    console.error("ECDSA Verification Failed");
    return (-1);
} else {
    console.log("ECDSA Signature/Verification succeeded");
}

rng.clean();

console.log("SUCCESS");
