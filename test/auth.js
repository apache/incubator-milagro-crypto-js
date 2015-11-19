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

//if browser
if (typeof require !== 'undefined') {
  var expect = require('chai').expect;
  var sinon = require('sinon');
  var sinonChai = require('sinon-chai');
  var mpinjs = require('../index');
  var inits = require("./init");
}
var Errors, testData, testLocalstorage;

Errors = inits.Errors;
MPINAuth = inits.MPINAuth;
MPIN = inits.MPIN;
testData = inits.testData;
testLocalstorage = inits.testLocalStorage;

////////////////////////////////////////////////////////////authentication
describe("# startAuthentication", function () {
  var mpin, spy, serverUrl = "http://192.168.10.63:8005";

  var testLocalstorage = {
    "accounts": {
      "7b226d6f62696c65223a20302c2022697373756564223a2022323031362d30322d32332031363a34393a31302e313039363734222c2022757365724944223a20227465737440746573742e636f6d222c202273616c74223a20223162396336353564343665323238373661333631373033353138616636363037227d": {
        "regOTT": "4ac1cca55c09f6d4e47a253d8cd503b5",
        "state": "STARTED"
      }
    }
  };


  var userId = "test@user.id";

  beforeEach(function (done) {
    var userPin = "userSecret";

    mpin = new mpinjs({server: testData.serverUrl});
    spy = sinon.spy();

    sinon.stub(mpin, "getData", function () {
      return testLocalstorage;
    });
    sinon.stub(mpin, "storeData");

    spy = sinon.spy(mpin, "toHash");

    stub = sinon.stub(mpin, 'request');
    stub.onCall(0).yields(null, testData.clientSettings);
    stub.onCall(1).yields(null, testData.mpin);//mpinId
    stub.onCall(2).yields(null, testData.cs1);//cs1
    stub.onCall(3).yields(null, testData.cs2);//cs2

    mpin.init(function (err, data) {
      mpin.makeNewUser(userId);
      mpin.startRegistration(userId, function (err1, data1) {
        mpin.confirmRegistration(userId, function (err2, data2) {
          mpin.finishRegistration(userId, userPin);
          expect(spy.calledOnce).to.be.true;
          expect(spy.calledWith(userPin)).to.be.true;
          done();
        });
      });
    });
  });

  afterEach(function () {
    mpin.restore();
    mpin.request.restore && mpin.request.restore();
  });


  it("should return error type " + Errors.missingUserId + " call without userId", function () {
    var err = mpin.startAuthentication();
    expect(err).to.deep.equal({code: 0, type: Errors.missingUserId});
  });

  it("should return error type " + Errors.userRevoked + " when timePermit1 request return status:401", function (done) {
    var errData = {status: 500};
    stub.onCall(4).yields({status: 401}, testData.tp1);//tp1
    stub.onCall(5).yields({status: 404}, null);//timePermitStorage
    stub.onCall(6).yields(errData, null); //tp2 - return status 401 user Revoke
    mpin.startAuthentication(userId, function (err, data) {
      expect(err).to.deep.equal({code: 7, type: Errors.userRevoked});
      done();
    });
  });

  it("should return error type " + Errors.userRevoked + " when timePermit2 request return status:401", function (done) {
    var errData = {status: 500};

    stub.onCall(4).yields(null, testData.tp1);//tp1
    stub.onCall(5).yields({status: 404}, null);//timePermitStorage
    stub.onCall(6).yields(errData, null); //tp2 - return status 401 user Revoke
    mpin.startAuthentication(userId, function (err, data) {
      expect(err).to.deep.equal(errData);
      done();
    });
  });

  it("should return error if have any other errors", function (done) {
    stub.onCall(4).yields(null, testData.tp1);//tp1
    stub.onCall(5).yields({status: 404}, null);//timePermitStorage
    stub.onCall(6).yields({status: 401}, null); //tp2 - return status 401 user Revoke
    mpin.startAuthentication(userId, function (err, data) {
      expect(err).to.deep.equal({code: 7, type: Errors.userRevoked});
      done();
    });
  });

  it("should be ok ", function (done) {
    stub.onCall(4).yields(null, testData.tp1);//tp1
    stub.onCall(5).yields({status: 404}, null);//timePermitStorage
    stub.onCall(6).yields(null, testData.tp2); //tp2
    mpin.startAuthentication(userId, function (err, data) {
      expect(data).to.be.true;
      done();
    });
  });
});

describe("# finishAuthentication", function () {
  var mpin, spy, userId = "test@user.id", userPin = "userPIN";

  beforeEach(function (done) {
    mpin = new mpinjs({server: testData.serverUrl});
    sinon.stub(mpin, "getData", function () {
      return testLocalstorage;
    });
    sinon.stub(mpin, "storeData");
    stub = sinon.stub(mpin, 'request');
    stub.onCall(0).yields(null, testData.clientSettings);
    stub.onCall(1).yields(null, testData.mpin);//mpinId
    stub.onCall(2).yields(null, testData.cs1);//cs1
    stub.onCall(3).yields(null, testData.cs2);//cs2
    done();
    this.setupFlow = function (cb) {
      mpin.init(function (err, data) {
        mpin.makeNewUser(userId);
        mpin.startRegistration(userId, function (err1, data1) {
          mpin.confirmRegistration(userId, function (err2, data2) {
            mpin.finishRegistration(userId, userPin);
            cb();
          });
        });
      });
    };
  });

  afterEach(function () {
    mpin.restore();
    mpin.request.restore && mpin.request.restore();
  });

  it("should return error type " + Errors.wrongFlow + " when call finish Authentication w/o setupFlow", function (done) {
    mpin.finishAuthentication(userId, "test", function (err, data) {
      expect(err).to.deep.equal({code: 6, type: Errors.wrongFlow});
      done();
    });
  });

  it("should return error type " + Errors.wrongFlow + " when call finish Authentication w/o startAuthentication", function (done) {
    this.setupFlow(function () {
      mpin.finishAuthentication(userId, "test", function (err, data) {
        expect(err).to.have.deep.property("type", Errors.wrongFlow);
        done();
      });
    });
  });

  it("should return error type " + Errors.wrongPin + " when auth request fail with 401", function (done) {
    stub.onCall(4).yields(null, testData.tp1);//tp1
    stub.onCall(5).yields({status: 404}, null);//timePermitStorage
    stub.onCall(6).yields(null, testData.tp2); //tp2
    stub.onCall(7).yields(null, testData.pass1); //pass1
    stub.onCall(8).yields(null, testData.pass2); //pass2

    stub.onCall(9).yields({status: 401}, null); //auth
    this.setupFlow(function () {
      mpin.startAuthentication(userId, function (err, data) {
        mpin.finishAuthentication(userId, "test", function (err2, data2) {
          expect(err2).to.have.deep.property("type", Errors.wrongPin);
          done();
        });
      });
    });
  });

  it("should return error type " + Errors.wrongPin + " when auth request fail with 410", function (done) {
    var authOut = null;
    stub.onCall(4).yields(null, testData.tp1);//tp1
    stub.onCall(5).yields({status: 404}, null);//timePermitStorage
    stub.onCall(6).yields(null, testData.tp2); //tp2
    stub.onCall(7).yields(null, testData.pass1); //pass1
    stub.onCall(8).yields(null, testData.pass2); //pass2

    stub.onCall(9).yields({status: 410}, null); //auth
    this.setupFlow(function () {
      mpin.startAuthentication(userId, function (err, data) {
        mpin.finishAuthentication(userId, "test", function (err2, data2) {
          expect(err2).to.have.deep.property("type", Errors.wrongPin);
          done();
        });
      });
    });
  });

  it("should hash pin if PIN is not an number", function (done) {
    var authOut = null, spyHash, userPass = "testPass";

    stub.onCall(4).yields(null, testData.tp1);//tp1
    stub.onCall(5).yields({status: 404}, null);//timePermitStorage
    stub.onCall(6).yields(null, testData.tp2); //tp2
    stub.onCall(7).yields(null, testData.pass1); //pass1
    stub.onCall(8).yields(null, testData.pass2); //pass2

    stub.onCall(9).yields(null, authOut); //auth
    this.setupFlow(function () {
      spyHash = sinon.spy(mpin, "toHash");
      mpin.startAuthentication(userId, function (err, data) {
        mpin.finishAuthentication(userId, userPass, function (err2, data2) {
          expect(spyHash.calledOnce).to.be.true;
          expect(spyHash.calledWith(userPass)).to.be.true;
          done();
        });
      });
    });
  });

  it("should return ok without data when response did not return such", function (done) {
    var authOut = null;
    stub.onCall(4).yields(null, testData.tp1);//tp1
    stub.onCall(5).yields({status: 404}, null);//timePermitStorage
    stub.onCall(6).yields(null, testData.tp2); //tp2
    stub.onCall(7).yields(null, testData.pass1); //pass1
    stub.onCall(8).yields(null, testData.pass2); //pass2

    stub.onCall(9).yields(null, authOut); //auth
    this.setupFlow(function () {
      mpin.startAuthentication(userId, function (err, data) {
        mpin.finishAuthentication(userId, "test", function (err2, data2) {
          expect(err2).to.be.a('null');
          expect(data2).to.be.a('null');
          done();
        });
      });
    });
  });
});