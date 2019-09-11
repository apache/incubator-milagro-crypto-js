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

// Test BLS

var CTX = require("../index");

var chai = require('chai');

var expect = chai.expect;

// Curves for test
var pf_curves = ['BLS381','BLS24', 'BLS48'];

pf_curves.forEach(function(curve) {

    describe('TEST BLS' + curve, function() {

        var ctx = new CTX(curve),
            rng = new ctx.RAND(),
            sk1 = [],
            pk1 = [],
            sig1 = [],
            sk2 = [],
            pk2 = [],
            sig2 = [],
            sk3 = [],
            pk3 = [],
            sig3 = [],
	    message="test message";

        if (ctx.ECP.CURVE_PAIRING_TYPE === 1 | ctx.ECP.CURVE_PAIRING_TYPE === 2) {
            BLS = ctx.BLS;
        } else if (ctx.ECP.CURVE_PAIRING_TYPE === 3) {
            BLS = ctx.BLS192;
        } else if (ctx.ECP.CURVE_PAIRING_TYPE === 4) {
            BLS = ctx.BLS256;
        }

        before(function(done) {
            this.timeout(0);

            var RAW = [];
            rng.clean();
            for (var j = 0; j < 100; j++) RAW[j] = j;
            rng.seed(100, RAW);

	    // Key pairs
	    BLS.KeyPairGenerate(rng,sk1,pk1);
	    BLS.KeyPairGenerate(rng,sk2,pk2);
	    BLS.KeyPairGenerate(rng,sk3,pk3);	    

	    // Sign message
	    BLS.sign(sig1,message,sk1);
	    BLS.sign(sig2,message,sk2);
	    BLS.sign(sig3,message,sk3);	    

            done();
        });

      	it('test verification', function(done) {
            this.timeout(0);

	    var rc=BLS.verify(sig1,message,pk1);

            expect(rc).to.be.equal(BLS.BLS_OK);

	    rc=BLS.verify(sig2,message,pk2);

            expect(rc).to.be.equal(BLS.BLS_OK);

    	    rc=BLS.verify(sig3,message,pk3);

            expect(rc).to.be.equal(BLS.BLS_OK);

            done();
        });

      	it('test corrupted message', function(done) {
            this.timeout(0);

	    var message2="bad message";
	    
	    var rc=BLS.verify(sig1,message2,pk1);

            expect(rc).to.be.equal(BLS.BLS_FAIL);
	    
            done();
        });
	
      	it('test corrupted signature', function(done) {
            this.timeout(0);

	    var tmp = sig1[0]
	    sig1[0]=1;
	    
	    var rc=BLS.verify(sig1,message,pk1);
	    sig1[0] = tmp

            expect(rc).to.be.equal(BLS.BLS_FAIL);
	    
            done();
        });

      	it('test combined correct signature / correct public key', function(done) {
            this.timeout(0);

	    var sig12=[];
	    var sigAll=[];	    
	    BLS.add_G1(sig1,sig2,sig12);
	    BLS.add_G1(sig12,sig3,sigAll);	    

	    var pk12=[];
	    var pkAll=[];	    
	    BLS.add_G2(pk1,pk2,pk12);
	    BLS.add_G2(pk12,pk3,pkAll);	
	    
	    var rc=BLS.verify(sigAll,message,pkAll);

            expect(rc).to.be.equal(BLS.BLS_OK);
	    
            done();
        });

      	it('test combined incorrect signature / correct public key', function(done) {
            this.timeout(0);

	    var sig12=[];
	    BLS.add_G1(sig1,sig2,sig12);

	    var pk12=[];
	    var pkAll=[];	    
	    BLS.add_G2(pk1,pk2,pk12);
	    BLS.add_G2(pk12,pk3,pkAll);	
	    
	    var rc=BLS.verify(sig12,message,pkAll);

            expect(rc).to.be.equal(BLS.BLS_FAIL);
	    
            done();
        });

      	it('test combined correct signature / incorrect public key', function(done) {
            this.timeout(0);

	    var sig12=[];
	    var sigAll=[];	    
	    BLS.add_G1(sig1,sig2,sig12);
	    BLS.add_G1(sig12,sig3,sigAll);	    

	    var pk12=[];
	    BLS.add_G2(pk1,pk2,pk12);
	    
	    var rc=BLS.verify(sigAll,message,pk12);

            expect(rc).to.be.equal(BLS.BLS_FAIL);
	    
            done();
        });

      	it('test externally generated key', function(done) {
            this.timeout(0);

	    var sk=[];
	    var pktmp=[];
	    var pk=[];
	    var sig=[];

            var RAW = [];
            rng.clean();
            for (var j = 0; j < 100; j++) RAW[j] = j;
            rng.seed(100, RAW);

	    // Key pairs
	    BLS.KeyPairGenerate(rng,sk,pktmp);
	    BLS.KeyPairGenerate(null,sk,pk);

	    // Sign message
	    BLS.sign(sig,message,sk);

	    // Verify signature
    	    rc=BLS.verify(sig,message,pk);

            expect(rc).to.be.equal(BLS.BLS_OK);

            done();
        });	
	
    });
});
