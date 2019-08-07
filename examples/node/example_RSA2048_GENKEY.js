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

/* Test RSA - test driver and function exerciser for RSA_2048 API Functions */

var CTX = require("../../index");

var ctx = new CTX("RSA2048");

console.log("Start test RSA 2048 with key generation");

var i, j = 0;

var RAW = [];
var rng = new ctx.RAND();
rng.clean();
for (i = 0; i < 100; i++) {
    RAW[i] = i;
}

rng.seed(100, RAW);

var sha = ctx.RSA.HASH_TYPE;
var message = "Hello World\n";
var pub = new ctx.rsa_public_key(ctx.FF.FFLEN);
var priv = new ctx.rsa_private_key(ctx.FF.HFLEN);

var ML = [];
var C = [];
var S = [];

var start, end, time;
start = new Date().getTime();
console.log("Generating RSA public/private key pair (slow!)");
ctx.RSA.KEY_PAIR(rng, 65537, priv, pub);
console.log("PR.p: " + priv.p.toString());
console.log("PR.q: " + priv.q.toString());
console.log("PR.dp: " + priv.dp.toString());
console.log("PR.dq: " + priv.dq.toString());
console.log("PR.c: " + priv.c.toString());
console.log("PUB.n: " + pub.n.toString());


end = new Date().getTime();
time = end - start;
console.log("Time in ms= " + time);

var M = ctx.RSA.stringtobytes(message);
console.log("Encrypting test string");

var E = ctx.RSA.OAEP_ENCODE(sha, M, rng, null); /* OAEP encode message m to e  */
console.log("Encoding= 0x" + ctx.RSA.bytestohex(E));

console.log("Public key= 0x" + pub.n.toString());

start = new Date().getTime();
ctx.RSA.ENCRYPT(pub, E, C); /* encrypt encoded message */
end = new Date().getTime();
time = end - start;
console.log("Time in ms= " + time);

console.log("Ciphertext= 0x" + ctx.RSA.bytestohex(C));

console.log("Decrypting test string");
start = new Date().getTime();
ctx.RSA.DECRYPT(priv, C, ML);
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

var MS = ctx.RSA.OAEP_DECODE(sha, null, ML); /* OAEP decode message  */
console.log("Decoding= 0x" + ctx.RSA.bytestohex(MS));

console.log("message= " + ctx.RSA.bytestostring(MS));

console.log("Start test RSA signature");

ctx.RSA.PKCS15(sha, M, C);

ctx.RSA.DECRYPT(priv, C, S); /* create signature in S */

console.log("Signature= 0x" + ctx.RSA.bytestohex(S));

ctx.RSA.ENCRYPT(pub, S, ML);

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
ctx.RSA.PRIVATE_KEY_KILL(priv);

console.log("SUCCESS");
