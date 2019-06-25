/* Test BLS - test driver and function exerciser for BLS API Functions */

var CTX = require("../../index");
var ctx = new CTX('BLS383');

var i,res;

var BGS=ctx.BLS.BGS;
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
var pk1=[];
var sig1=[];

ctx.BLS.KeyPairGenerate(rng,sk1,pk1);
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

// Combined
var pk=[];
var sig=[];

// Add signatures
ctx.BLS.add_G1(sig1,sig2,sig);
console.log("Signature combined: 0x"+ctx.BLS.bytestostring(sig));

// Add public keys
ctx.BLS.add_G2(pk1,pk2,pk);
console.log("Public key combined: 0x"+ctx.BLS.bytestostring(pk));

var res=ctx.BLS.verify(sig,message,pk);
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

