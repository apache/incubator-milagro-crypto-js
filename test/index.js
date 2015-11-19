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
var Errors, testData, testLocalstorage, testLocalStorage2;

Errors = inits.Errors;
MPINAuth = inits.MPINAuth;
MPIN = inits.MPIN;
testData = inits.testData;
testLocalstorage = inits.testLocalStorage;
testLocalStorage2 = inits.testLocalStorage2;


describe("# Constructor initialization without sever Url.", function () {
  it("should throw Error", function () {
    var mpin = new mpinjs();
    expect(mpin).to.be.an.instanceof(Error);
  });
});

//spy cases
describe("# Normal initialization.", function () {
  var mpin, spy;

  before(function () {
    mpin = new mpinjs({server: testData.serverUrl});
    spy = sinon.spy();

    mpin.request = spy;
    sinon.stub(mpin, "getData", function () {
      return testLocalstorage;
    });
  });

  it("should call request method once", function () {
    mpin.init();
    expect(spy.calledOnce).to.be.true;
  });

  it("should call request method with settingsUrl params", function () {
    mpin.init();
    expect(spy.calledWith({url: testData.serverUrl + "/rps/clientSettings"})).to.be.true;
  });
});

describe("# Init method > clientSettings request.", function () {
  var mpin;

  before(function () {
    mpin = new mpinjs({server: testData.serverUrl});

    sinon.stub(mpin, "getData", function () {
      return testLocalstorage;
    });
  });

//restore request
  afterEach(function (done) {
    mpin.request.restore();
    done();
  });

  it("should return error if init response is wrong", function (done) {
    sinon.stub(mpin, 'request').yields({}, null);
    mpin.init(function (err, data) {
      expect(err).to.exist;
      done();
    });
  });

  it("should store init response into internal property", function (done) {
    sinon.stub(mpin, 'request').yields(null, testData.clientSettings);
    mpin.init(function (err, data) {
      expect(data).to.be.true;
      done();
    });
  });

});

describe("# makeNewUser checks.", function () {
  var mpin;

  before(function () {
    mpin = new mpinjs({server: testData.serverUrl});

    sinon.stub(mpin, "getData", function () {
      return testLocalstorage;
    });
//    sinon.stub(mpin, "addToUser");
  });

  after(function () {
    mpin.restore();
  });

  it("should makeNewUser return error type " + Errors.missingUserId + " when call without userId", function () {
    var user = mpin.makeNewUser();
    expect(user).to.deep.equal({code: 0, type: Errors.missingUserId});
  });

  it("should store user into internal list", function () {
    var userId = "test@user.id";
    mpin.makeNewUser(userId);
    expect(mpin.checkUser(userId)).to.be.true;
  });
});

describe("# startRegistration.", function () {
  var mpin;

  before(function () {
    mpin = new mpinjs({server: testData.serverUrl});
    sinon.stub(mpin, "getData", function () {
      return testLocalstorage;
    });
  });

  after(function () {
    mpin.restore();
  });

  it("should return error type " + Errors.missingUserId + ", call without userId", function (done) {
    mpin.startRegistration(null, function (err, data) {
      expect(err).to.deep.equal({code: 0, type: Errors.missingUserId});
      done();
    });
  });

  it("should return error type " + Errors.invalidUserId + " if skip makeNewUser method.", function (done) {
    var userId = "test@user.id";
    mpin.startRegistration(userId, function (err, data) {
      expect(err).to.deep.equal({code: 1, type: Errors.invalidUserId});
      done();
    });
  });

  it("should return error type " + Errors.missingParams + " if skip init method.", function (done) {
    var userId = "test@user.id";
    mpin.makeNewUser(userId);
    mpin.startRegistration(userId, function (err, data) {
      expect(err).to.exist;
      done();
    });
  });

  it("should return OK.", function (done) {
    var userId = "test@user.id";

    //mock for init method
    sinon.stub(mpin, 'request').yields(null, testData.clientSettings);
    mpin.init(function (err, data) {
      mpin.makeNewUser(userId);
      mpin.startRegistration(userId, function (err1, data1) {
        expect(data).to.exist;
        done();
      });
    });
  });
});


describe("# confirmRegistration.", function () {
  var mpin;
  before(function () {
    mpin = new mpinjs({server: testData.serverUrl});
    sinon.stub(mpin, "getData", function () {
      return testLocalstorage;
    });
  });

  afterEach(function () {
    mpin.restore();
    mpin.request.restore && mpin.request.restore();
  });

  it("should return error type " + Errors.missingUserId + " call without userId", function (done) {
    mpin.confirmRegistration(null, function (err, data) {
      expect(err).to.deep.equal({code: 0, type: Errors.missingUserId});
      done();
    });
  });

  it("should return error type " + Errors.invalidUserId + " if skip makeNewUser method.", function (done) {
    var userId = "test@user.id";
    mpin.confirmRegistration(userId, function (err, data) {
      expect(err).to.have.deep.property('type', Errors.invalidUserId);
      done();
    });
  });

  it("should return error type " + Errors.missingParams + " if skip init method.", function (done) {
    var userId = "test@user.id";
    mpin.makeNewUser(userId);
    mpin.confirmRegistration(userId, function (err, data) {
      expect(err).to.have.deep.property('type', Errors.missingParams);
      done();
    });
  });

  it("should return error type " + Errors.identityNotVerified + " identity not verify.", function (done) {
    var userId = "test@user.id", stub;

    stub = sinon.stub(mpin, 'request');
    stub.onCall(0).yields(null, testData.clientSettings);
    stub.onCall(1).yields(null, {});
    stub.onCall(2).yields({status: 401}, null);

    mpin.init(function (err, data) {
      mpin.makeNewUser(userId);
      mpin.startRegistration(userId, function (err1, data1) {
        mpin.confirmRegistration(userId, function (err2, data2) {
          expect(err2).to.have.deep.property('type', Errors.identityNotVerified);
          done();
        });
      });
    });
  });

  //start REGISTRATION >>> OK
  it("should return OK", function (done) {
    var userId = "test@user.id", stub;
    //define global cripto

    stub = sinon.stub(mpin, 'request');
    stub.onCall(0).yields(null, testData.clientSettings);
    stub.onCall(1).yields(null, {});//mpinId
    stub.onCall(2).yields(null, testData.cs1);//cs1
    stub.onCall(3).yields(null, testData.cs2);//cs2

    mpin.init(function (err, data) {
      mpin.makeNewUser(userId);
      mpin.startRegistration(userId, function (err1, data1) {
        mpin.confirmRegistration(userId, function (err2, data2) {
          expect(data2).to.exist;
          done();
        });
      });
    });
  });
});


describe("# finishRegistration", function () {
  var mpin, spy, userId = "test@user.id";

  beforeEach(function () {
    mpin = new mpinjs({server: testData.serverUrl});

    sinon.stub(mpin, "getData", function () {
      return testLocalstorage;
    });

    sinon.stub(mpin, "storeData");
  });

  afterEach(function () {
    mpin.restore();
    mpin.request.restore && mpin.request.restore();
  });

  it("should return error type " + Errors.missingUserId + " call without userId", function () {
    var err = mpin.finishRegistration();
    expect(err).to.deep.equal({code: 0, type: Errors.missingUserId});
  });

  it("should call getUser (with userId arguments) to validate user state", function () {
    spy = sinon.spy(mpin, "getUser");
    mpin.finishRegistration(userId);
    expect(spy.calledOnce).to.be.true;
    expect(spy.calledWith(userId)).to.be.true;
  });

  it("should return error type " + Errors.wrongFlow + " when didn't activate identity", function () {
    mpin.makeNewUser(userId);
    var err2 = mpin.finishRegistration(userId);
    expect(err2).to.have.deep.property('type', Errors.wrongFlow);
  });

  it("should hash pin if PIN is not an number", function (done) {
    var userPin = "userSecret";
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

  it("should save user state register", function (done) {
    var userPin = "userSecret";

    stub = sinon.stub(mpin, 'request');
    stub.onCall(0).yields(null, testData.clientSettings);
    stub.onCall(1).yields(null, testData.mpin);//mpinId
    stub.onCall(2).yields(null, testData.cs1);//cs1
    stub.onCall(3).yields(null, testData.cs2);//cs2

    mpin.init(function (err, data) {
      mpin.makeNewUser(userId);
      mpin.startRegistration(userId, function (err1, data1) {
        mpin.confirmRegistration(userId, function (err2, data2) {
          spy = sinon.spy(mpin, "addToUser");
          mpin.finishRegistration(userId, userPin);
          expect(spy.calledOnce).to.be.true;
//          expect(spy.calledWith(userId, {token: "token", state: "REGISTERED"})).to.be.true;
          done();
        });
      });
    });
  });
});






describe("# backward compatibility", function () {
  var mpin;
  beforeEach(function (done) {
    mpin = new mpinjs({server: testData.serverUrl});
    sinon.stub(mpin, "getData", function () {
      return testLocalStorage2;
    });
    sinon.stub(mpin, 'request').yields(null, testData.clientSettings);

    mpin.init(function (err, data) {
      done();
    });
  });

  it("read all identities and setup proper state", function () {
    var users;
    users = mpin.listUsers();
    expect(users).to.have.length(2);
    expect(users[0]).to.have.deep.property("state", "STARTED");
    expect(users[1]).to.have.deep.property("state", "REGISTERED");
  });
});

describe("# restartRegistration", function () {
  var mpin;
  beforeEach(function (done) {
    mpin = new mpinjs({server: testData.serverUrl});
    sinon.stub(mpin, "getData", function () {
      return testLocalStorage2;
    });
    stub = sinon.stub(mpin, 'request');
    stub.onCall(0).yields(null, testData.clientSettings);//put user
    
    mpin.init(function (err, data) {
      done();
    });
  });

  afterEach(function () {
    mpin.restore();
    mpin.request.restore && mpin.request.restore();
  });

  it("should return error type " + Errors.missingUserId + " when call w/o user", function (done) {
    mpin.restartRegistration(null, function (err, data) {
      expect(err).to.have.deep.property("type", Errors.missingUserId);
      done();
    });
  });

  it("should return error type " + Errors.invalidUserId + " when call with unexisting user", function (done) {
    mpin.restartRegistration("nonExistUser", function (err, data) {
      expect(err).to.have.deep.property("type", Errors.invalidUserId);
      done();
    });
  });

  it("should return error type " + Errors.wrongFlow + " when call userId different state from started", function (done) {
    mpin.restartRegistration("dddsre@mailinator.com", function (err, data) {
      expect(err).to.have.deep.property("type", Errors.wrongFlow);
      done();
    });
  });

  it("should return error if request fail", function (done) {
    sinon.stub(mpin, "storeData");

    stub.onCall(1).yields({status: 401}, null);//put user
    mpin.restartRegistration("aaa@bbb.com", function (err, data) {
      expect(err).to.have.deep.property("status", 401);
      done();
    });
  });

  it("should return ok when request is ok", function (done) {
    sinon.stub(mpin, "storeData");

    stub.onCall(1).yields(null, true);//put user
    mpin.restartRegistration("aaa@bbb.com", function (err, data) {
      expect(data).to.be.ok;
      done();
    });
  });
});

