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

/* Test MPIN - test driver and function exerciser for MPIN API Functions */

var CTX = require("../../index");

var ctx = new CTX("BLS381");

/* Test M-Pin */

var RAW = [];
var i;
var rng = new ctx.RAND();
rng.clean();
for (i = 0; i < 100; i++) {
    RAW[i] = i;
}

rng.seed(100, RAW);

var sha = ctx.ECP.HASH_TYPE;

var S = [];
var SST = [];
var TOKEN = [];
var PERMIT = [];
var SEC = [];
var xID = [];
var xCID = [];
var X = [];
var Y = [];
var E = [];
var F = [];
var HCID = [];
var HID = [];
var HTID = [];

var G1 = [];
var G2 = [];
var R = [];
var Z = [];
var W = [];
var T = [];
var CK = [];
var SK = [];

var HSID = [];

/* Set configuration */
var PINERROR = true;
var FULL = true;

/* Trusted Authority set-up */
ctx.MPIN.RANDOM_GENERATE(rng, S);
console.log("M-Pin Master Secret s: 0x" + ctx.MPIN.bytestostring(S));

/* Create Client Identity */
var IDstr = "testUser@milagro.com";
var CLIENT_ID = ctx.MPIN.stringtobytes(IDstr);
HCID = ctx.MPIN.HASH_ID(sha, CLIENT_ID); /* Either Client or TA calculates Hash(ID) - you decide! */

console.log("Client ID= " + ctx.MPIN.bytestostring(CLIENT_ID));

/* Client and Server are issued secrets by DTA */
ctx.MPIN.GET_SERVER_SECRET(S, SST);
console.log("Server Secret SS: 0x" + ctx.MPIN.bytestostring(SST));

ctx.MPIN.GET_CLIENT_SECRET(S, HCID, TOKEN);
console.log("Client Secret CS: 0x" + ctx.MPIN.bytestostring(TOKEN));

/* Client extracts PIN from secret to create Token */
var pin = 1234;
console.log("Client extracts PIN= " + pin);
var rtn = ctx.MPIN.EXTRACT_PIN(sha, CLIENT_ID, pin, TOKEN);
if (rtn != 0) {
    console.log("Failed to extract PIN ");
}

console.log("Client Token TK: 0x" + ctx.MPIN.bytestostring(TOKEN));

if (FULL) {
    ctx.MPIN.PRECOMPUTE(TOKEN, HCID, G1, G2);
}

var date = 0;

pin = 1234;

/* Set date=0 and PERMIT=null if time permits not in use

Client First pass: Inputs CLIENT_ID, optional RNG, pin, TOKEN and PERMIT. Output xID = x.H(CLIENT_ID) and re-combined secret SEC
If PERMITS are is use, then date!=0 and PERMIT is added to secret and xCID = x.(H(CLIENT_ID)+H_T(date|H(CLIENT_ID)))
ctx.RANDom value x is supplied externally if RNG=null, otherwise generated and passed out by RNG

If Time Permits OFF set xCID = null, HTID=null and use xID and HID only
If Time permits are ON, AND pin error detection is required then all of xID, xCID, HID and HTID are required
If Time permits are ON, AND pin error detection is NOT required, set xID=null, HID=null and use xCID and HTID only.


*/
var pxID = xID;
var pxCID = xCID;
var pHID = HID;
var pHTID = HTID;
var pE = E;
var pF = F;
var pPERMIT = PERMIT;
var prHID;

if (date != 0) {
    prHID = pHTID;
    if (!PINERROR) {
        pxID = null;
        //	pHID=null;
    }
} else {
    prHID = pHID;
    pPERMIT = null;
    pxCID = null;
    pHTID = null;
}
if (!PINERROR) {
    pE = null;
    pF = null;
}

console.log("MPIN Single Pass ");
var timeValue = ctx.MPIN.GET_TIME();
console.log("Epoch " + timeValue);

rtn = ctx.MPIN.CLIENT(sha, date, CLIENT_ID, rng, X, pin, TOKEN, SEC, pxID, pxCID, pPERMIT, timeValue, Y);

if (rtn != 0) {
    console.error("FAILURE: CLIENT rtn: " + rtn);
    process.exit(-1);
}
if (FULL) {
    HCID = ctx.MPIN.HASH_ID(sha, CLIENT_ID);
    ctx.MPIN.GET_G1_MULTIPLE(rng, 1, R, HCID, Z); /* Also Send Z=r.ID to Server, remember ctx.RANDom r */
}

rtn = ctx.MPIN.SERVER(sha, date, pHID, pHTID, Y, SST, pxID, pxCID, SEC, pE, pF, CLIENT_ID, timeValue);
if (rtn != 0) {
    console.error("FAILURE: SERVER rtn: " + rtn);
    process.exit(-1);
}

if (FULL) {
    HSID = ctx.MPIN.HASH_ID(sha, CLIENT_ID);
    ctx.MPIN.GET_G1_MULTIPLE(rng, 0, W, prHID, T); /* Also send T=w.ID to client, remember ctx.RANDom w  */
}

if (rtn == ctx.MPIN.BAD_PIN) {
    console.log("Server says - Bad Pin.");
    if (PINERROR) {
        var err = ctx.MPIN.KANGAROO(E, F);
        if (err != 0) {
            console.log("(Client PIN is out by " + err + ")");
            process.exit(-1);
        }
    }
} else {
    console.log("Server says - PIN is good! You really are " + IDstr);
    if (FULL) {
        var H = ctx.MPIN.HASH_ALL(sha, HCID, pxID, pxCID, SEC, Y, Z, T);
        ctx.MPIN.CLIENT_KEY(sha, G1, G2, pin, R, X, H, T, CK);

        console.log("Client Key =  0x" + ctx.MPIN.bytestostring(CK));
        H = ctx.MPIN.HASH_ALL(sha, HSID, pxID, pxCID, SEC, Y, Z, T);
        ctx.MPIN.SERVER_KEY(sha, Z, SST, W, H, pHID, pxID, pxCID, SK);
        console.log("Server Key =  0x" + ctx.MPIN.bytestostring(SK));
    }
}
console.log("SUCCESS");
