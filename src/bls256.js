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

/* BLS API Functions */
var BLS256 = function(ctx) {
    "use strict";

    /**
     * Creates an instance of BLS256
     *
     * @constructor
     * @this {BLS256}
     */
    var BLS256 = {
        BLS_OK: 0,
        BLS_FAIL: -1,

        BFS: ctx.BIG.MODBYTES,
        BGS: ctx.BIG.MODBYTES,

        /**
         * Convert byte array to string
         *
         * @this {BLS192}
         * @parameter b byte array
         * @return string
         */
        bytestostring: function(b) {
            var s = "",
                len = b.length,
                ch, i;

            for (i = 0; i < len; i++) {
                ch = b[i];
                s += ((ch >>> 4) & 15).toString(16);
                s += (ch & 15).toString(16);

            }

            return s;
        },

        /**
         * Convert string to byte array 
         *
         * @this {BLS192}
         * @parameter s string
         * @return byte array
         */
        stringtobytes: function(s) {
            var b = [],
                i;

            for (i = 0; i < s.length; i++) {
                b.push(s.charCodeAt(i));
            }

            return b;
        },

        /**
         *  hash a message to an ECP point, using SHA3 
         *
         * @this {BLS192}
         * @parameter m message to be hashedstring
         * @return ECP point
         */
        bls_hashit: function(m) {
            var sh = new ctx.SHA3(ctx.SHA3.SHAKE256);
            var hm = [];
            var t = this.stringtobytes(m);
            for (var i = 0; i < t.length; i++)
                sh.process(t[i]);
            sh.shake(hm, this.BFS);
            var P = ctx.ECP.mapit(hm);
            return P;
        },

        /**
         * Generate key pair
         *
         * @this {BLS192}
         * @parameter rng Cryptographically Secure Random Number Generator
         * @parameter S Private key
         * @parameter W Public key
         * @return Error code
         */
        KeyPairGenerate(rng, S, W) {
            var G = ctx.ECP8.generator();
	    var s;
	    
            var q = new ctx.BIG(0);
            q.rcopy(ctx.ROM_CURVE.CURVE_Order);

            if (rng != null) {
                s = ctx.BIG.randomnum(q, rng);
                s.toBytes(S);
            } else {
                s = ctx.BIG.fromBytes(S);
            }

            G = ctx.PAIR256.G2mul(G, s);
            G.toBytes(W); 

            return this.BLS_OK;
        },

        /**
         * Sign message
         *
         * @this {BLS192}
         * @parameter SIG Singature
         * @parameter m Message to sign
         * @parameter S Private key
         * @return Error code
         */
        sign(SIG, m, S) {
            var D = this.bls_hashit(m);
            var s = ctx.BIG.fromBytes(S);
            D = ctx.PAIR256.G1mul(D, s);
            D.toBytes(SIG, true);
            return this.BLS_OK;
        },

        /**
         * Verify message
         *
         * @this {BLS192}
         * @parameter SIG Signature
         * @parameter m Message to sign
         * @parameter W Public key
         * @return Error code
         */
        verify(SIG, m, W) {
            var HM = this.bls_hashit(m);
            var D = ctx.ECP.fromBytes(SIG);
            var G = ctx.ECP8.generator();
            var PK = ctx.ECP8.fromBytes(W);
            D.neg();

            // Use new multi-pairing mechanism 
            var r = ctx.PAIR256.initmp();
            ctx.PAIR256.another(r, G, D);
            ctx.PAIR256.another(r, PK, HM);
            var v = ctx.PAIR256.miller(r);

            //.. or alternatively
            //			var v=ctx.PAIR256.ate2(G,D,PK,HM);

            v = ctx.PAIR256.fexp(v);
            if (v.isunity())
                return this.BLS_OK;
            return this.BLS_FAIL;
        },


        /**
         * R=R1+R2 in group G1 
         *
         * @this {BLS192}
         * @parameter R1 G1 Point
         * @parameter R2 G1 Point
         * @parameter R G1 Point
         * @return Error code
         */
        add_G1(R1, R2, R) {
            var P = ctx.ECP.fromBytes(R1),
                Q = ctx.ECP.fromBytes(R2);

            if (P.is_infinity() || Q.is_infinity()) {
                return this.INVALID_POINT;
            }

            P.add(Q);

            P.toBytes(R, true);

            return 0;
        },

        /**
         *  W=W1+W2 in group G2 
         *
         * @this {BLS192}
         * @parameter W1 G2 Point
         * @parameter W2 G2 Point
         * @parameter R G2 Point
         * @return Error code
         */
        add_G2(W1, W2, W) {
            var P = ctx.ECP8.fromBytes(W1),
                Q = ctx.ECP8.fromBytes(W2);

            if (P.is_infinity() || Q.is_infinity()) {
                return this.INVALID_POINT;
            }

            P.add(Q);

            P.toBytes(W);

            return 0;
        }

    };

    return BLS256;
};

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = {
        BLS256: BLS256
    };
}
