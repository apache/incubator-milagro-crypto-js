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

/* MPIN API Functions */

var MPIN192 = function(ctx) {
    "use strict";

    /**
      * Creates an instance of MPIN192
      *
      * @constructor
      * @this {MPIN192}
      */        
    var MPIN192 = {
        BAD_PARAMS: -11,
        INVALID_POINT: -14,
        WRONG_ORDER: -18,
        BAD_PIN: -19,
        /* configure PIN here */
        MAXPIN: 10000,
        /* max PIN */
        PBLEN: 14,
        /* MAXPIN length in bits */
        TS: 12,
        /* 10 for 4 digit PIN, 14 for 6-digit PIN - 2^TS/TS approx = sqrt(MAXPIN) */
        TRAP: 2000,
        /* 200 for 4 digit PIN, 2000 for 6-digit PIN  - approx 2*sqrt(MAXPIN) */
        EFS: ctx.BIG.MODBYTES,
        EGS: ctx.BIG.MODBYTES,

        SHA256: 32,
        SHA384: 48,
        SHA512: 64,

	/**
         * Get epoch time
         *
         * @this {MPIN192}
         * @return time in slots since epoch 
         */	
        today: function() {
            var now = new Date();
            return Math.floor(now.getTime() / (60000 * 1440)); // for daily tokens
        },

	/**
         * Convert byte array to string
         *
         * @this {MPIN192}
         * @param b byte array
         * @return s string
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
         * Convert a string to byte array
         *
         * @this {MPIN192}
         * @param s string
         * @return b byte array
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
         * Convert byte arrays
         *
         * @this {MPIN192}
         * @param a byte array
         * @param b byte array
         * @return true if equal
         */				
        comparebytes: function(a, b) {
            if (a.length != b.length) {
                return false;
            }

            for (var i = 0; i < a.length; i++) {
                if (a[i] != b[i]) {
                    return false;
                }
            }

            return true;
        },

	/**
         * Hash values
         *
         * @this {MPIN192}
         * @param c FP8 instance
         * @param U ECP unstancebyte array
         * @return R hash value
         */					
        mpin_hash: function(sha, c, U) {
            var t = [],
                w = [],
                h = [],
                H, R, i;

            c.geta().geta().getA().toBytes(w);
            for (i = 0; i < this.EFS; i++) {
                t[i] = w[i];
            }
            c.geta().geta().getB().toBytes(w);
            for (i = this.EFS; i < 2 * this.EFS; i++) {
                t[i] = w[i - this.EFS];
            }
            c.geta().getb().getA().toBytes(w);
            for (i = 2 * this.EFS; i < 3 * this.EFS; i++) {
                t[i] = w[i - 2 * this.EFS];
            }
            c.geta().getb().getB().toBytes(w);
            for (i = 3 * this.EFS; i < 4 * this.EFS; i++) {
                t[i] = w[i - 3 * this.EFS];
            }

            c.getb().geta().getA().toBytes(w);
            for (i = 4 * this.EFS; i < 5 * this.EFS; i++) {
                t[i] = w[i - 4 * this.EFS];
            }
            c.getb().geta().getB().toBytes(w);
            for (i = 5 * this.EFS; i < 6 * this.EFS; i++) {
                t[i] = w[i - 5 * this.EFS];
            }
            c.getb().getb().getA().toBytes(w);
            for (i = 6 * this.EFS; i < 7 * this.EFS; i++) {
                t[i] = w[i - 6 * this.EFS];
            }
            c.getb().getb().getB().toBytes(w);
            for (i = 7 * this.EFS; i < 8 * this.EFS; i++) {
                t[i] = w[i - 7 * this.EFS];
            }


            U.getX().toBytes(w);
            for (i = 8 * this.EFS; i < 9 * this.EFS; i++) {
                t[i] = w[i - 8 * this.EFS];
            }
            U.getY().toBytes(w);
            for (i = 9 * this.EFS; i < 10 * this.EFS; i++) {
                t[i] = w[i - 9 * this.EFS];
            }

            if (sha == this.SHA256) {
                H = new ctx.HASH256();
            } else if (sha == this.SHA384) {
                H = new ctx.HASH384();
            } else if (sha == this.SHA512) {
                H = new ctx.HASH512();
            }

            H.process_array(t);
            h = H.hash();

            if (h.length == 0) {
                return null;
            }

            R = [];
            for (i = 0; i < ctx.ECP.AESKEY; i++) {
                R[i] = h[i];
            }

            return R;
        },

	/**
         * General purpose hash function
         *
         * @this {MPIN192}
         * @param sha is the hash type
         * @param n Integer
         * @param B byte array
         * @return R hash value
         */					
        hashit: function(sha, n, B) {
            var R = [],
                H, W, i, len;

            if (sha == this.SHA256) {
                H = new ctx.HASH256();
            } else if (sha == this.SHA384) {
                H = new ctx.HASH384();
            } else if (sha == this.SHA512) {
                H = new ctx.HASH512();
            }

            if (n > 0) {
                H.process_num(n);
            }
            H.process_array(B);
            R = H.hash();

            if (R.length == 0) {
                return null;
            }

            W = [];

            len = ctx.BIG.MODBYTES;

            if (sha >= len) {
                for (i = 0; i < len; i++) {
                    W[i] = R[i];
                }
            } else {
                for (i = 0; i < sha; i++) {
                    W[i + len - sha] = R[i];
                }

                for (i = 0; i < len - sha; i++) {
                    W[i] = 0;
                }
            }

            return W;
        },

	/**
         * maps a random u to a point on the curve 
         *
         * @this {MPIN192}
         * @param u BIG numberInteger
         * @param cb an integer representing the "sign" of y, in fact its least significant bit.
         * @return P ECP pointhash value
         */					
        map: function(u, cb) {
            var P = new ctx.ECP(),
                x = new ctx.BIG(u),
                p = new ctx.BIG(0);

            p.rcopy(ctx.ROM_FIELD.Modulus);
            x.mod(p);

            for (;;) {
                P.setxi(x, cb);
                if (!P.is_infinity()) {
                    break;
                }
                x.inc(1);
                x.norm();
            }

            return P;
        },

	/**
         * returns u derived from P. Random value in range 1 to return value should then be added to u 
         *
         * @this {MPIN192}
         * @param u BIG numberInteger
         * @param P ECP pointhash value
         * @return r Value that should be added to u to derive P 
         */						
        unmap: function(u, P) {
            var s = P.getS(),
                R = new ctx.ECP(),
                r = 0,
                x = P.getX();

            u.copy(x);

            for (;;) {
                u.dec(1);
                u.norm();
                r++;
                R.setxi(u, s); 
                if (!R.is_infinity()) {
                    break;
                }
            }

            return r;
        },

        /* these next two functions implement elligator squared - http://eprint.iacr.org/2014/043 */
        /* Elliptic curve point E in format (0x04,x,y} is converted to form {0x0-,u,v} */
        /* Note that u and v are indistinguishable from random strings */
        ENCODING: function(rng, E) {
            var T = [],
                i, rn, m, su, sv,
                u, v, P, p, W;

            for (i = 0; i < this.EFS; i++) {
                T[i] = E[i + 1];
            }
            u = ctx.BIG.fromBytes(T);
            for (i = 0; i < this.EFS; i++) {
                T[i] = E[i + this.EFS + 1];
            }
            v = ctx.BIG.fromBytes(T);

            P = new ctx.ECP(0);
            P.setxy(u, v);
            if (P.is_infinity()) {
                return this.INVALID_POINT;
            }

            p = new ctx.BIG(0);
            p.rcopy(ctx.ROM_FIELD.Modulus);
            u = ctx.BIG.randomnum(p, rng);

            su = rng.getByte();
            if (su < 0) {
                su = -su;
            }
            su %= 2;

            W = this.map(u, su);
            P.sub(W);
            sv = P.getS();
            rn = this.unmap(v, P);
            m = rng.getByte();
            if (m < 0) {
                m = -m;
            }
            m %= rn;
            v.inc(m + 1);
            E[0] = (su + 2 * sv);
            u.toBytes(T);
            for (i = 0; i < this.EFS; i++) {
                E[i + 1] = T[i];
            }
            v.toBytes(T);
            for (i = 0; i < this.EFS; i++) {
                E[i + this.EFS + 1] = T[i];
            }

            return 0;
        },

        DECODING: function(D) {
            var T = [],
                i, su, sv, u, v, W, P;

            if ((D[0] & 0x04) !== 0) {
                return this.INVALID_POINT;
            }

            for (i = 0; i < this.EFS; i++) {
                T[i] = D[i + 1];
            }
            u = ctx.BIG.fromBytes(T);
            for (i = 0; i < this.EFS; i++) {
                T[i] = D[i + this.EFS + 1];
            }
            v = ctx.BIG.fromBytes(T);

            su = D[0] & 1;
            sv = (D[0] >> 1) & 1;
            W = this.map(u, su);
            P = this.map(v, sv);
            P.add(W);
            u = P.getX();
            v = P.getY();
            D[0] = 0x04;
            u.toBytes(T);
            for (i = 0; i < this.EFS; i++) {
                D[i + 1] = T[i];
            }
            v.toBytes(T);
            for (i = 0; i < this.EFS; i++) {
                D[i + this.EFS + 1] = T[i];
            }

            return 0;
        },

	/**
         * Add two members from the group G1
         *
         * @this {MPIN192}
         * @param R1 Input member of G1
         * @param R2 Input member of G1
         * @param R Output member of G1. R=R1+R2
         * @return 0 or an error code
         */						
        RECOMBINE_G1: function(R1, R2, R) {
            var P = ctx.ECP.fromBytes(R1),
                Q = ctx.ECP.fromBytes(R2);

            if (P.is_infinity() || Q.is_infinity()) {
                return this.INVALID_POINT;
            }

            P.add(Q);

            P.toBytes(R,false);

            return 0;
        },

	/**
         * Add two members from the group G2
         *
         * @this {MPIN192}
         * @param W1 Input member of G2
         * @param W2 Input member of G2
         * @param W Output member of G2. W=W1+W2
         * @return 0 or an error code
         */						
        RECOMBINE_G2: function(W1, W2, W) {
            var P = ctx.ECP4.fromBytes(W1),
                Q = ctx.ECP4.fromBytes(W2);

            if (P.is_infinity() || Q.is_infinity()) {
                return this.INVALID_POINT;
            }

            P.add(Q);

            P.toBytes(W);

            return 0;
        },

	/**
         * Hash the identity
         *
         * @this {MPIN192}
         * @param sha is the hash type
         * @param ID Identity as byte array
         * @return hash value
         */					
        HASH_ID: function(sha, ID) {
            return this.hashit(sha, 0, ID);
        },

	/**
         * Create random secret
         *
         * @this {MPIN192}
         * @param rng cryptographically secure random number generator
         * @param S Random secret value
         * @return O for success or else error code
         */					
        RANDOM_GENERATE: function(rng, S) {
            var r = new ctx.BIG(0),
                s;

            r.rcopy(ctx.ROM_CURVE.CURVE_Order);

            s = ctx.BIG.randomnum(r, rng);
            s.toBytes(S);

            return 0;
        },

	/**
         * Extract a PIN number from a client secret
         *
         * @this {MPIN192}
         * @parameter sha hash type
         * @parameter CID Client identity
         * @parameter pin PIN value
         * @parameter TOKEN Client secret
         * @return token
         */					
        EXTRACT_PIN: function(sha, CID, pin, TOKEN) {
            return this.EXTRACT_FACTOR(sha,CID,pin%this.MAXPIN,this.PBLEN,TOKEN);
        },

	/**
         * Extract factor from TOKEN for identity CID 
         *
         * @this {MPIN192}
         * @parameter sha hash type
         * @parameter CID Client identity
         * @parameter factor Value to extract
         * @parameter facbits Number of bits in factor
         * @parameter TOKEN Token value
         * @return token
         */					
        EXTRACT_FACTOR: function(sha, CID, factor, facbits, TOKEN) {
            var P, R, h;

            P = ctx.ECP.fromBytes(TOKEN);

            if (P.is_infinity()) {
                return this.INVALID_POINT;
            }

            h = this.hashit(sha, 0, CID);
            R = ctx.ECP.mapit(h);

            R = R.pinmul(factor, facbits);
            P.sub(R);

            P.toBytes(TOKEN,false);

            return 0;
        },

	/**
         * Restore factor to TOKEN for identity CID 
         *
         * @this {MPIN192}
         * @parameter sha hash type
         * @parameter CID Client identity
         * @parameter factor Value to extract
         * @parameter facbits Number of bits in factor
         * @parameter TOKEN Token value
         * @return token
         */					
        RESTORE_FACTOR: function(sha, CID, factor, facbits, TOKEN) {
            var P, R, h;

            P = ctx.ECP.fromBytes(TOKEN);

            if (P.is_infinity()) {
                return this.INVALID_POINT;
            }

            h = this.hashit(sha, 0, CID),
            R = ctx.ECP.mapit(h);

            R = R.pinmul(factor, facbits);
            P.add(R);

            P.toBytes(TOKEN,false);

            return 0;
        },

	/**
         * Create a server secret in G2 from a master secret
         *
         * @this {MPIN192}
         * @param S Master secret
         * @param SST Server secret = s.Q where Q is a fixed generator of G2
         * @return O for success or else error code
         */					
        GET_SERVER_SECRET: function(S, SST) {
            var s,Q;

            Q = ctx.ECP4.generator();

            s = ctx.BIG.fromBytes(S);
            Q = ctx.PAIR192.G2mul(Q, s);
            Q.toBytes(SST);

            return 0;
        },

	/**
         * Find a random multiple of a point in G1
         *
         * @this {MPIN192}
         * @parameter rng cryptographically secure random number generator
	 * @param type determines type of action to be taken
	 * @param x an output internally randomly generated if R!=NULL, otherwise must be provided as an input
	 * @param G if type=0 a point in G1, else an octet to be mapped to G1
	 * @param W the output =x.G or x.M(G), where M(.) is a mapping
         * @return O for success or else error code
         */					
        GET_G1_MULTIPLE: function(rng, type, X, G, W) {
            var r = new ctx.BIG(0),
                x, P;

            r.rcopy(ctx.ROM_CURVE.CURVE_Order);

            if (rng != null) {
                x = ctx.BIG.randomnum(r, rng);
                x.toBytes(X);
            } else {
                x = ctx.BIG.fromBytes(X);
            }

            if (type == 0) {
                P = ctx.ECP.fromBytes(G);
                if (P.is_infinity()) {
                    return this.INVALID_POINT;
                }
            } else {
                P = ctx.ECP.mapit(G);
            }

            ctx.PAIR192.G1mul(P, x).toBytes(W,false);

            return 0;
        },


	/**
         * Create a client secret in G1 from a master secret and the client ID
         *
         * @this {MPIN192}
	 * @param S is an input master secret
	 * @param CID is the input client identity
	 * @param CST is the full client secret = s.H(ID)
         * @return O for success or else error code
         */					
        GET_CLIENT_SECRET: function(S, CID, CST) {
            return this.GET_G1_MULTIPLE(null, 1, S, CID, CST);
        },

	/**
         * Create a Time Permit in G1 from a master secret and the client ID
         *
         * @this {MPIN192}
  	 * @param sha is the hash type
	 * @param date is input date, in days since the epoch.
	 * @param S is an input master secret
	 * @param CID is the input client identity
	 * @param CTT is a Time Permit for the given date = s.H(d|H(ID))
         * @return O for success or else error code
         */					
        GET_CLIENT_PERMIT: function(sha, date, S, CID, CTT) {
            var h = this.hashit(sha, date, CID),
                P = ctx.ECP.mapit(h),
                s = ctx.BIG.fromBytes(S);

            P = ctx.PAIR192.G1mul(P, s);
            P.toBytes(CTT,false);

            return 0;
        },

	/**
         * Perform first pass of the client side of the 3-pass version of the M-Pin protocol
         *
         * @this {MPIN192}
 	 * @param sha is the hash type
	 * @param date is input date, in days since the epoch. Set to 0 if Time permits disabled
	 * @param CLIENT_ID is the input client identity
	 * @param rng is a pointer to a cryptographically secure random number generator
	 * @param X an output internally randomly generated if R!=NULL, otherwise must be provided as an input
	 * @param pin is the input PIN number
	 * @param TOKEN is the input M-Pin token (the client secret with PIN portion removed)
	 * @param SEC is output = CS+TP, where CS=is the reconstructed client secret, and TP is the time permit
	 * @param xID is output = x.H(ID)
	 * @param xCID is output = x.(H(ID)+H(d|H(ID)))
	 * @param PERMIT is the input time permit
         * @return O for success or else error code
         */					
        CLIENT_1: function(sha, date, CLIENT_ID, rng, X, pin, TOKEN, SEC, xID, xCID, PERMIT) {
            var r = new ctx.BIG(0),
                x, P, T, W, h;

            r.rcopy(ctx.ROM_CURVE.CURVE_Order);
            if (rng !== null) {
                x = ctx.BIG.randomnum(r, rng);
                x.toBytes(X);
            } else {
                x = ctx.BIG.fromBytes(X);
            }

            h = this.hashit(sha, 0, CLIENT_ID);
            P = ctx.ECP.mapit(h);
            T = ctx.ECP.fromBytes(TOKEN);
            if (T.is_infinity()) {
                return this.INVALID_POINT;
            }

            pin %= this.MAXPIN;
            W = P.pinmul(pin, this.PBLEN);
            T.add(W);

            if (date != 0) {
                W = ctx.ECP.fromBytes(PERMIT);

                if (W.is_infinity()) {
                    return this.INVALID_POINT;
                }

                T.add(W);
                h = this.hashit(sha, date, h);
                W = ctx.ECP.mapit(h);

                if (xID != null) {
                    P = ctx.PAIR192.G1mul(P, x);
                    P.toBytes(xID,false);
                    W = ctx.PAIR192.G1mul(W, x);
                    P.add(W);
                } else {
                    P.add(W);
                    P = ctx.PAIR192.G1mul(P, x);
                }

                if (xCID != null) {
                    P.toBytes(xCID,false);
                }
            } else {
                if (xID != null) {
                    P = ctx.PAIR192.G1mul(P, x);
                    P.toBytes(xID,false);
                }
            }

            T.toBytes(SEC,false);

            return 0;
        },

	/**
         * Perform second pass of the client side of the 3-pass version of the M-Pin protocol
         *
         * @this {MPIN192}
	 * @param X an input, a locally generated random number
	 * @param Y an input random challenge from the server
	 * @param SEC on output = -(x+y).V
         * @return O for success or else error code
         */					
        CLIENT_2: function(X, Y, SEC) {
            var r = new ctx.BIG(0),
                P, px, py;

            r.rcopy(ctx.ROM_CURVE.CURVE_Order);

            P = ctx.ECP.fromBytes(SEC);
            if (P.is_infinity()) {
                return this.INVALID_POINT;
            }

            px = ctx.BIG.fromBytes(X);
            py = ctx.BIG.fromBytes(Y);
            px.add(py);
            px.mod(r);

            P = ctx.PAIR192.G1mul(P, px);
            P.neg();
            P.toBytes(SEC,false);

            return 0;
        },

	/**
         * Perform first pass of the server side of the 3-pass version of the M-Pin protocol
         *
         * @this {MPIN192}
 	 * @param sha is the hash type
	 * @param date is input date, in days since the epoch. Set to 0 if Time permits disabled
	 * @param CID is the input claimed client identity
	 * @param HID is output H(ID), a hash of the client ID
	 * @param HTID is output H(ID)+H(d|H(ID))
         * @return O for success or else error code
         */
        SERVER_1: function(sha, date, CID, HID, HTID) {
            var h = this.hashit(sha, 0, CID),
                P = ctx.ECP.mapit(h),
                R;

            P.toBytes(HID,false);
            if (date !== 0) {
                h = this.hashit(sha, date, h);
                R = ctx.ECP.mapit(h);
                P.add(R);
                P.toBytes(HTID,false);
            }
        },

	/**
         * Perform third pass on the server side of the 3-pass version of the M-Pin protocol
         *
         * @this {MPIN192}
	 * @param date is input date, in days since the epoch. Set to 0 if Time permits disabled
	 * @param HID is input H(ID), a hash of the client ID
	 * @param HTID is input H(ID)+H(d|H(ID))
	 * @param Y is the input server's randomly generated challenge
	 * @param SST is the input server secret
	 * @param xID is input from the client = x.H(ID)
	 * @param xCID is input from the client= x.(H(ID)+H(d|H(ID)))
	 * @param mSEC is an input from the client
	 * @param E is an output to help the Kangaroos to find the PIN error, or NULL if not required
	 * @param F is an output to help the Kangaroos to find the PIN error, or NULL if not required
	 * @param Pa is the input public key from the client, z.Q or NULL if the client uses regular mpin
         * @return O for success or else error code
         */
        SERVER_2: function(date, HID, HTID, Y, SST, xID, xCID, mSEC, E, F, Pa) {
            var Q, sQ, R, y, P, g;

            if (typeof Pa === "undefined" || Pa == null) {
                Q = ctx.ECP4.generator();

            } else {
                Q = ctx.ECP4.fromBytes(Pa);
                if (Q.is_infinity()) {
                    return this.INVALID_POINT;
                }
            }

            sQ = ctx.ECP4.fromBytes(SST);
            if (sQ.is_infinity()) {
                return this.INVALID_POINT;
            }

            if (date !== 0) {
                R = ctx.ECP.fromBytes(xCID);
            } else {
                if (xID == null) {
                    return this.BAD_PARAMS;
                }
                R = ctx.ECP.fromBytes(xID);
            }

            if (R.is_infinity()) {
                return this.INVALID_POINT;
            }

            y = ctx.BIG.fromBytes(Y);

            if (date != 0) {
                P = ctx.ECP.fromBytes(HTID);
            } else {
                if (HID == null) {
                    return this.BAD_PARAMS;
                }
                P = ctx.ECP.fromBytes(HID);
            }

            if (P.is_infinity()) {
                return this.INVALID_POINT;
            }

            P = ctx.PAIR192.G1mul(P, y);
            P.add(R);
            //P.affine();
            R = ctx.ECP.fromBytes(mSEC);
            if (R.is_infinity()) {
                return this.INVALID_POINT;
            }

            g = ctx.PAIR192.ate2(Q, R, sQ, P);
            g = ctx.PAIR192.fexp(g);

            if (!g.isunity()) {
                if (HID != null && xID != null && E != null && F != null) {
                    g.toBytes(E);

                    if (date !== 0) {
                        P = ctx.ECP.fromBytes(HID);
                        if (P.is_infinity()) {
                            return this.INVALID_POINT;
                        }

                        R = ctx.ECP.fromBytes(xID);
                        if (R.is_infinity()) {
                            return this.INVALID_POINT;
                        }

                        P = ctx.PAIR192.G1mul(P, y);
                        P.add(R);
                    }
                    g = ctx.PAIR192.ate(Q, P);
                    g = ctx.PAIR192.fexp(g);

                    g.toBytes(F);
                }

                return this.BAD_PIN;
            }

            return 0;
        },

	/**
         * Use Kangaroos to find PIN error
         *
         * @this {MPIN192}
	 * @param E a member of the group GT
	 * @param F a member of the group GT =  E^e
	 * @return 0 if Kangaroos failed, or the PIN error e
         */
        KANGAROO: function(E, F) {
            var ge = ctx.FP24.fromBytes(E),
                gf = ctx.FP24.fromBytes(F),
                distance = [],
                t = new ctx.FP24(gf),
                table = [],
                i, j, m, s, dn, dm, res, steps;

            s = 1;
            for (m = 0; m < this.TS; m++) {
                distance[m] = s;
                table[m] = new ctx.FP24(t);
                s *= 2;
                t.usqr();
            }
            t.one();
            dn = 0;
            for (j = 0; j < this.TRAP; j++) {
                i = t.geta().geta().geta().getA().lastbits(20) % this.TS;
                t.mul(table[i]);
                dn += distance[i];
            }
            gf.copy(t);
            gf.conj();
            steps = 0;
            dm = 0;
            res = 0;
            while (dm - dn < this.MAXPIN) {
                steps++;
                if (steps > 4 * this.TRAP) {
                    break;
                }
                i = ge.geta().geta().geta().getA().lastbits(20) % this.TS;
                ge.mul(table[i]);
                dm += distance[i];
                if (ge.equals(t)) {
                    res = dm - dn;
                    break;
                }
                if (ge.equals(gf)) {
                    res = dn - dm;
                    break;
                }

            }
            if (steps > 4 * this.TRAP || dm - dn >= this.MAXPIN) {
                res = 0;
            } // Trap Failed  - probable invalid token

            return res;
        },

	/**
         * Time since epoch 
         *
         * @this {MPIN192}
	 * @return time since epoch 
         */
        GET_TIME: function() {
            var now = new Date();
            return Math.floor(now.getTime() / (1000));
        },

	/**
         * Generate Y=H(s,O), where s is epoch time, O is a byte array, and H(.) is a hash function
         *
         * @this {MPIN192}
  	 * @param sha is the hash type
	 * @param TimeValue is epoch time in seconds
	 * @param xCID input bytearray is an input octet
	 * @param Y output value
         * @return O for success or else error code
         */
        GET_Y: function(sha, TimeValue, xCID, Y) {
            var q = new ctx.BIG(0),
                h = this.hashit(sha, TimeValue, xCID),
                y = ctx.BIG.fromBytes(h);

            q.rcopy(ctx.ROM_CURVE.CURVE_Order);

            y.mod(q);
            y.toBytes(Y);

            return 0;
        },

	/**
         * Perform client side of the one-pass version of the M-Pin protocol
         *
         * @this {MPIN192}
 	 * @param sha is the hash type
	 * @param date is input date, in days since the epoch. Set to 0 if Time permits disabled
	 * @param CLIENT_ID is the input client identity
	 * @param rng is a pointer to a cryptographically secure random number generator
	 * @param X an output internally randomly generated if R!=NULL, otherwise must be provided as an input
	 * @param pin is the input PIN number
	 * @param TOKEN is the input M-Pin token (the client secret with PIN portion removed)
	 * @param SEC is output = -(x+y)(CS+TP), where CS is the reconstructed client secret, and TP is the time permit
	 * @param xID is output = x.H(ID)
	 * @param xCID is output = x.(H(ID)+H(d|H(ID)))
	 * @param PERMIT is the input time permit
	 * @param TimeValue is input epoch time in seconds - a timestamp
	 * @param Y is output H(t|U) or H(t|UT) if Time Permits enabled
	 * @param Message is the message to be signed
         * @return O for success or else error code
         */
        CLIENT: function(sha, date, CLIENT_ID, rng, X, pin, TOKEN, SEC, xID, xCID, PERMIT, TimeValue, Y, Message) {
            var rtn = 0,
                M = [],
                pID, i;

            if (date == 0) {
                pID = xID;
            } else {
                pID = xCID;
                xID = null;
            }

            rtn = this.CLIENT_1(sha, date, CLIENT_ID, rng, X, pin, TOKEN, SEC, xID, xCID, PERMIT);
            if (rtn != 0) {
                return rtn;
            }

            M = pID.slice();

            if (typeof Message !== "undefined" || Message != null) {
                for (i = 0; i < Message.length; i++) {
                    M.push(Message[i]);
                }
            }

            this.GET_Y(sha, TimeValue, M, Y);

            rtn = this.CLIENT_2(X, Y, SEC);
            if (rtn != 0) {
                return rtn;
            }

            return 0;
        },

	/**
         * Perform server side of the one-pass version of the M-Pin protocol
         *
         * @this {MPIN192}
 	 * @param sha is the hash type
	 * @param date is input date, in days since the epoch. Set to 0 if Time permits disabled
	 * @param HID is output H(ID), a hash of the client ID
	 * @param HTID is output H(ID)+H(d|H(ID))
	 * @param Y is output H(t|U) or H(t|UT) if Time Permits enabled
	 * @param SST is the input server secret
	 * @param xID is input from the client = x.H(ID)
	 * @param xCID is input from the client= x.(H(ID)+H(d|H(ID)))
	 * @param mSEC is an input from the client
	 * @param E is an output to help the Kangaroos to find the PIN error, or NULL if not required
	 * @param F is an output to help the Kangaroos to find the PIN error, or NULL if not required
	 * @param CID is the input claimed client identity
	 * @param TimeValue is input epoch time in seconds - a timestamp
	 * @param MESSAGE is the message to be signed
	 * @param Pa is input from the client z.Q or NULL if the key-escrow less scheme is not used
         * @return O for success or else error code
         */
        SERVER: function(sha, date, HID, HTID, Y, SST, xID, xCID, mSEC, E, F, CID, TimeValue, Message, Pa) {
            var rtn = 0,
                M = [],
                pID, i;

            if (date == 0) {
                pID = xID;
            } else {
                pID = xCID;
            }

            this.SERVER_1(sha, date, CID, HID, HTID);

            M = pID.slice();

            if (typeof Message !== "undefined" || Message != null) {
                for (i = 0; i < Message.length; i++) {
                    M.push(Message[i]);
                }
            }

            this.GET_Y(sha, TimeValue, M, Y);

            rtn = this.SERVER_2(date, HID, HTID, Y, SST, xID, xCID, mSEC, E, F, Pa);
            if (rtn != 0) {
                return rtn;
            }

            return 0;
        },

	/**
         * Precompute values for use by the client side of M-Pin Full
         *
         * @this {MPIN192}
	 * @param TOKEN is the input M-Pin token (the client secret with PIN portion removed)
	 * @param CID is the input client identity
	 * @param G1 precomputed output
	 * @param G2 precomputed output
         * @return O for success or else error code
         */
        PRECOMPUTE: function(TOKEN, CID, G1, G2) {
            var P, T, g, Q;

            T = ctx.ECP.fromBytes(TOKEN);
            if (T.is_infinity()) {
                return this.INVALID_POINT;
            }

            P = ctx.ECP.mapit(CID);
            Q = ctx.ECP4.generator();

            g = ctx.PAIR192.ate(Q, T);
            g = ctx.PAIR192.fexp(g);
            g.toBytes(G1);

            g = ctx.PAIR192.ate(Q, P);
            g = ctx.PAIR192.fexp(g);
            g.toBytes(G2);

            return 0;
        },

	/**
         * Hash the session transcript
         *
         * @this {MPIN192}
 	 * @param sha is the hash type
	 * @param HID is the hashed input client ID = H(ID)
	 * @param xID is the client output = x.H(ID)
	 * @param xCID is the client output = x.(H(ID)+H(T|H(ID)))
	 * @param SEC is the client part response
	 * @param Y is the server challenge
	 * @param R is the client part response
	 * @param W is the server part response
	 * @return H the output is the hash of all of the above that apply
         */
        HASH_ALL: function(sha, HID, xID, xCID, SEC, Y, R, W) {
            var tlen = 0,
                T = [],
                i;

            for (i = 0; i < HID.length; i++) {
                T[i] = HID[i];
            }
            tlen += HID.length;

            if (xCID != null) {
                for (i = 0; i < xCID.length; i++) {
                    T[i + tlen] = xCID[i];
                }
                tlen += xCID.length;
            } else {
                for (i = 0; i < xID.length; i++) {
                    T[i + tlen] = xID[i];
                }
                tlen += xID.length;
            }

            for (i = 0; i < SEC.length; i++) {
                T[i + tlen] = SEC[i];
            }
            tlen += SEC.length;

            for (i = 0; i < Y.length; i++) {
                T[i + tlen] = Y[i];
            }
            tlen += Y.length;

            for (i = 0; i < R.length; i++) {
                T[i + tlen] = R[i];
            }
            tlen += R.length;

            for (i = 0; i < W.length; i++) {
                T[i + tlen] = W[i];
            }
            tlen += W.length;

            return this.hashit(sha, 0, T);
        },

	/**
         * Calculate Key on Client side for M-Pin Full
         *
         * @this {MPIN192}
  	 * @param sha is the hash type
	 * @param G1 precomputed input
	 * @param G2 precomputed input
	 * @param pin is the input PIN number
	 * @param R is an input, a locally generated random number
	 * @param X is an input, a locally generated random number
	 * @param H is an input, hash of the protocol transcript
	 * @param wCID is the input Server-side Diffie-Hellman component
	 * @param CK is the output calculated shared key
	 * @return 0 or an error code
         */
        CLIENT_KEY: function(sha, G1, G2, pin, R, X, H, wCID, CK) {
            var t = [],
                g1 = ctx.FP24.fromBytes(G1),
                g2 = ctx.FP24.fromBytes(G2),
                z = ctx.BIG.fromBytes(R),
                x = ctx.BIG.fromBytes(X),
                h = ctx.BIG.fromBytes(H),
                W = ctx.ECP.fromBytes(wCID),
                r, c, i;

            if (W.is_infinity()) {
                return this.INVALID_POINT;
            }

            W = ctx.PAIR192.G1mul(W, x);

            r = new ctx.BIG(0);
            r.rcopy(ctx.ROM_CURVE.CURVE_Order);

            z.add(h);
            z.mod(r);

            g2.pinpow(pin, this.PBLEN);
            g1.mul(g2);

            c = g1.compow(z, r);

            t = this.mpin_hash(sha, c, W);

            for (i = 0; i < ctx.ECP.AESKEY; i++) {
                CK[i] = t[i];
            }

            return 0;
        },

	/**
         * Calculate Key on Server side for M-Pin Full
         *
         * @this {MPIN192}
 	 * @param h is the hash type
	 * @param Z is the input Client-side Diffie-Hellman component
	 * @param SST is the input server secret
	 * @param W is an input random number generated by the server
	 * @param H is an input, hash of the protocol transcript
	 * @param HID is the hashed input client ID = H(ID)
	 * @param xID is input from the client = x.H(ID)
	 * @param xCID is input from the client= x.(H(ID)+H(d|H(ID)))
	 * @param SK is the output calculated shared key
	 * @return 0 or an error code
         */
        SERVER_KEY: function(sha, Z, SST, W, H, HID, xID, xCID, SK) {
            var t = [],
                sQ, R, A, U, w, h, g, c, i;

            sQ = ctx.ECP4.fromBytes(SST);
            if (sQ.is_infinity()) {
                return this.INVALID_POINT;
            }

            R = ctx.ECP.fromBytes(Z);
            if (R.is_infinity()) {
                return this.INVALID_POINT;
            }

            A = ctx.ECP.fromBytes(HID);
            if (A.is_infinity()) {
                return this.INVALID_POINT;
            }

            if (xCID != null) {
                U = ctx.ECP.fromBytes(xCID);
            } else {
                U = ctx.ECP.fromBytes(xID);
            }

            if (U.is_infinity()) {
                return this.INVALID_POINT;
            }

            w = ctx.BIG.fromBytes(W);
            h = ctx.BIG.fromBytes(H);
            A = ctx.PAIR192.G1mul(A, h);
            R.add(A);

            U = ctx.PAIR192.G1mul(U, w);
            g = ctx.PAIR192.ate(sQ, R);
            g = ctx.PAIR192.fexp(g);

            c = g.trace();

            t = this.mpin_hash(sha, c, U);

            for (i = 0; i < ctx.ECP.AESKEY; i++) {
                SK[i] = t[i];
            }

            return 0;
        },

	/**
         * Generates a random public key for the client z.Q
         *
         * @this {MPIN192}
         * @param rng cryptographically secure random number generator
	 * @param Z an output internally randomly generated if R!=NULL, otherwise it must be provided as an input
	 * @param Pa the output public key for the client
	 * @return 0 or an error code
         */
        GET_DVS_KEYPAIR: function(rng, Z, Pa) {
            var r = new ctx.BIG(0),
                z, Q;

            r.rcopy(ctx.ROM_CURVE.CURVE_Order);

            if (rng != null) {
                z = ctx.BIG.randomnum(r, rng);
                z.toBytes(Z);
            } else {
                z = ctx.BIG.fromBytes(Z);
            }
            z.invmodp(r);

            Q = ctx.ECP4.generator();

            Q = ctx.PAIR192.G2mul(Q, z);
            Q.toBytes(Pa);

            return 0;
        }
    };

    return MPIN192;
};

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = {
        MPIN192: MPIN192
    };
}
