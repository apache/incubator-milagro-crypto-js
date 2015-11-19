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
var inits = function () {
  var Errors, MPINAuth, MPIN, testData, testLocalStorage, testLocalStorage2;

  Errors = [];
  Errors.missingUserId = "MISSING_USERID";
  Errors.invalidUserId = "INVALID_USERID";
  Errors.missingParams = "MISSING_PARAMETERS";
  Errors.identityNotVerified = "IDENTITY_NOT_VERIFIED";
  Errors.identityMissing = "IDENTITY_MISSING";
  Errors.wrongPin = "WRONG_PIN";
  Errors.wrongFlow = "WRONG_FLOW";
  Errors.userRevoked = "USER_REVOKED";

  //overwrite global crypto function
  MPINAuth = {};
  MPINAuth.addShares = function () {
    return "040a23a7e6d381a6dbd8b806013f07d40be36b42723ad3b1d986e4bbbe9ece83f421c504a4258cf87251af4ea7e847e4da46730034fc880f92d885c419716cb944";
  };
  MPINAuth.calculateMPinToken = function () {
    return "04236eb28be98764e379049a2c4371752e7e3adc99a844800b9de2c34d2c70d95b07354c556276cbf79cee9e601807e6166d9bffedc3c1b1909ab5bf63330e2131";
  };
  MPINAuth.pass1Request = function () {
    return {};
  };
  MPINAuth.pass2Request = function () {
    return {};
  };

  MPIN = {};
  MPIN.stringtobytes = function () {
    return "";
  }
  MPIN.HASH_ID = function () {
    return "";
  }
  MPIN.bytestostring = function () {
    return "";
  }

  testData = {};
  testData.serverUrl = "http://192.168.10.63:8005";
  testData.clientSettings = {
    requestOTP: false,
    mpinAuthServerURL: "http://192.168.10.63:8011/rps",
    registerURL: "http://192.168.10.63:8011/rps/user",
    signatureURL: "http://192.168.10.63:8011/rps/signature",
    certivoxURL: "https://community-api.certivox.net/v3/",
    timePermitsURL: "http://192.168.10.63:8011/rps/timePermit"
  };
  testData.mpin = {
    mpinId: "7b226d6f62696c65223a20302c2022697373756564223a2022323031362d30332d31352031333a34323a33362e393437303338222c2022757365724944223a20226d70696e4444222c202273616c74223a20226437373831313162633762653537323662666162633930353435396631643230227d"
  };
  testData.cs1 = {
    clientSecretShare: "0421e379eb45e56ce699f0a7a83b683e84944b63fcc93a2834a4769ea40a28dc3f2064cd9d64846304999e00008b0838e246d3ea06d0013f1080c1027d54630ca9",
    params: "mobile=0&expires=2015-12-03T12%3A47%3A23Z&app_id=e340a9f240e011e5b23b06df5546c0ed&hash_mpin_id=07a9af5af89d66b969be31d3d4e29c2a0a5ad4d3e30432eed9b3915dbf52230a&signature=33e8e987b07a2d9c9f3d98f68268870ef104cd0e0b9e02ba2c55e8bbf5190913&hash_user_id="
  };
  testData.cs2 = {
    clientSecret: "0409ba1a247561ab16c35df3ad0ca9846db9968fa28757005335dc2ca35188b4f51521ac97d45bbdb3a8d1c0fdfe79ab29031054534df8b7cbac12e67e4e99d685"
  };
  testData.tp1 = {
    "timePermit": "04145085669aa20607c0da730c01c707010e546bb81cf17abc29cacfef8e162b0f097b547c7058f6bd88e55cadc721b5721ee9730bfb10fa239c5bfacdb62fa3f4",
    "signature": "39f9e16201d05dd3e369d43bd73cf0249e5bac01d5ff2975640d988e4a37b7f5",
    "date": 16876
  };
  testData.tp2 = {
    "timePermit": "040ff870574cb3c923410fdf33681beacd6ca6eeeb8858150efbf1241da9202c5604977ae285410df0d86a9976611b255a6fcbeeaf22bb398e4859ff3348bb4d87"
  };
  testData.pass1 = {
    "y": "1dacb1f6830de09c0697485159da2ba4ed2908a8e24a85b886ff284306738b31"
  };
  testData.pass2 = {
    "authOTT": "b0784ab9b6759953a3c6da85bdbdbaf3"
  };
  testData.auth = {
    "authOTT": "b0784ab9b6759953a3c6da85bdbdbaf3"
  };

  testLocalStorage = {
    "accounts": {
      "7b226d6f62696c65223a20302c2022697373756564223a2022323031362d30322d32332031363a34393a31302e313039363734222c2022757365724944223a20227465737440746573742e636f6d222c202273616c74223a20223162396336353564343665323238373661333631373033353138616636363037227d": {
        "regOTT": "4ac1cca55c09f6d4e47a253d8cd503b5",
        "state": "STARTED"
      }
    }
  };

  testLocalStorage2 = {
    "defaultIdentity": "7b226d6f62696c65223a20302c2022697373756564223a2022323031362d30322d30332031363a31333a32362e333030393938222c2022757365724944223a2022616161406262622e636f6d222c202273616c74223a20223237386166373433663465373034363764323334313936323262316333616231227d",
    "version": "0.3",
    "accounts": {
      "7b226d6f62696c65223a20302c2022697373756564223a2022323031362d30322d30332031363a31333a32362e333030393938222c2022757365724944223a2022616161406262622e636f6d222c202273616c74223a20223237386166373433663465373034363764323334313936323262316333616231227d": {
        "MPinPermit": "",
        "token": "",
        "regOTT": "b6216da7e3224e07eb4791815bcfcaa6"
      },
      "7b226d6f62696c65223a20302c2022697373756564223a2022323031362d30322d30382030383a35383a34302e373737373130222c2022757365724944223a2022646464737265406d61696c696e61746f722e636f6d222c202273616c74223a20223831373539623463313032363666646431616337323231326530643839393932227d": {
        "MPinPermit": "042235a80c4c24f25a8a61758d3dac87d72b693c989ef95704c2ba51c7f4d98a631c912c9dc48435d9dd1af3dc17fa7d9e2af9beb16cc77bd38150c4697efdf232",
        "token": "0412e48b124199f683e0ea6b8a1f1b073013dce21610de4b54cac74696e02003b1147d3ad7b4cef542c6ef61726dc4ffba039c90f7edd17cbeafb7c0737b41fc82",
        "regOTT": "11adb574045ffe27e718d8b4dc665887",
        "timePermitCache": {
          "date": 16867,
          "timePermit": "041c990c4087b5eeb7f4c2dbe5869794c208a22f63f6485a8905b35f542b2136a91cccf0696a6c60b2208ff1d3178da8fa661f7a52dda7db2738bfb1fe8b6cfa4b"
        }
      }
    },
    "deviceName": "winChrome"
  };

  return {
    Errors: Errors,
    MPINAuth: MPINAuth,
    MPIN: MPIN,
    testData: testData,
    testLocalStorage: testLocalStorage,
    testLocalStorage2: testLocalStorage2
  };
}();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
  module.exports = inits;
else
  window.inits = inits;
