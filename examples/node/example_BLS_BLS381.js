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

/* Test BLS - test driver and function exerciser for BLS API Functions */

var CTX = require("../../index");
var ctx = new CTX('BLS381');

var i,res;

var BFS=ctx.BLS.BFS;

/* Group 1 Size */
var G1S=BFS+1;
/* Group 2 Size */
var G2S=4*BFS; 

var raw=[];
var rng=new ctx.RAND();
rng.clean();

for (i=0;i<100;i++) raw[i]=i;
rng.seed(100,raw);

var message="test message";

// User 1
var sk1=[];
var pktmp=[];
var pk1=[];
var sig1=[];

ctx.BLS.KeyPairGenerate(rng,sk1,pktmp);
console.log("Private key user 1: 0x"+ctx.BLS.bytestostring(sk1));
console.log("Public key user 1: 0x"+ctx.BLS.bytestostring(pktmp));

ctx.BLS.KeyPairGenerate(null,sk1,pk1);
console.log("Private key user 1: 0x"+ctx.BLS.bytestostring(sk1));
console.log("Public key user 1: 0x"+ctx.BLS.bytestostring(pk1));

console.log("Message : "+message);
ctx.BLS.sign(sig1,message,sk1);
console.log("Signature user 1: 0x"+ctx.BLS.bytestostring(sig1));

var res=ctx.BLS.verify(sig1,message,pk1);
if (res==0)
    console.log("Success User 1: valid Signature");
else
    console.log("Error User 1: invalid Signature");

// User 2
var sk2=[];
var pk2=[];
var sig2=[];

ctx.BLS.KeyPairGenerate(rng,sk2,pk2);
console.log("Private key user 2: 0x"+ctx.BLS.bytestostring(sk2));
console.log("Public key user 2: 0x"+ctx.BLS.bytestostring(pk2));

console.log("Message : "+message);
ctx.BLS.sign(sig2,message,sk2);
console.log("Signature user 2: 0x"+ctx.BLS.bytestostring(sig2));

var res=ctx.BLS.verify(sig2,message,pk2);
if (res==0)
    console.log("Success User 2 valid Signature");
else
    console.log("Error User 2 invalid Signature");

// User 3
var sk3=[];
var pk3=[];
var sig3=[];

ctx.BLS.KeyPairGenerate(rng,sk3,pk3);
console.log("Private key user 3: 0x"+ctx.BLS.bytestostring(sk3));
console.log("Public key user 3: 0x"+ctx.BLS.bytestostring(pk3));

console.log("Message : "+message);
ctx.BLS.sign(sig3,message,sk3);
console.log("Signature user 3: 0x"+ctx.BLS.bytestostring(sig3));

var res=ctx.BLS.verify(sig3,message,pk3);
if (res==0)
    console.log("Success User 3 valid Signature");
else
    console.log("Error User 3 invalid Signature");

// Combined
var pk12=[];
var sig12=[];
var pk=[];
var sig=[];

// Add signatures
ctx.BLS.add_G1(sig1,sig2,sig12);
console.log("Signature combined: 0x"+ctx.BLS.bytestostring(sig12));
ctx.BLS.add_G1(sig3,sig12,sig);
console.log("Signature combined: 0x"+ctx.BLS.bytestostring(sig));

// Add public keys
ctx.BLS.add_G2(pk1,pk2,pk12);
console.log("Public key combined: 0x"+ctx.BLS.bytestostring(pk12));
ctx.BLS.add_G2(pk3,pk12,pk);
console.log("Public key combined: 0x"+ctx.BLS.bytestostring(pk));

var res=ctx.BLS.verify(sig,message,pk);
if (res==0)
    console.log("Success combined valid Signature");
else
    console.log("Error combined invalid Signature");

var res=ctx.BLS.verify(sig12,message,pk);
if (res==0)
    console.log("Success combined valid Signature");
else
    console.log("Error combined invalid Signature");

var res=ctx.BLS.verify(sig,message,pk12);
if (res==0)
    console.log("Success combined valid Signature");
else
    console.log("Error combined invalid Signature");

// Test corrupted signature
sig1[0] = 1;
var res=ctx.BLS.verify(sig1,message,pk1);
if (res==0)
    console.log("Success User 1: valid Signature");
else
    console.log("Error User 1: invalid Signature");

// Test corrupted message
var message2="bad message";
var res=ctx.BLS.verify(sig2,message2,pk2);
if (res==0)
    console.log("Success User 2 valid Signature");
else
    console.log("Error User 2 invalid Signature");

