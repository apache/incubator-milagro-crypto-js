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

var mpinjs = (function () {
  var Mpin, Users = {}, Errors = {}, States = {};

  Errors.missingUserId = {code: 0, type: "MISSING_USERID"};
  Errors.invalidUserId = {code: 1, type: "INVALID_USERID"};
  Errors.missingParams = {code: 2, type: "MISSING_PARAMETERS"};
  Errors.identityNotVerified = {code: 3, type: "IDENTITY_NOT_VERIFIED"};
  Errors.identityMissing = {code: 4, type: "IDENTITY_MISSING"};
  Errors.wrongPin = {code: 5, type: "WRONG_PIN"};
  Errors.wrongFlow = {code: 6, type: "WRONG_FLOW"};
  Errors.userRevoked = {code: 7, type: "USER_REVOKED"};
  Errors.timeoutFinish = {code: 8, type: "TIMEOUT_FINISH"};
  Errors.requestExpired = {code: 9, type: "REQUEST_EXPIRED"};
  Errors.identityNotAuthorized = {code: 10, type: "IDENTITY_NOT_AUTHORIZED"};
  Errors.incorrectAccessNumber = {code: 11, type: "INCORRECT_ACCESS_NUMBER"};

  States.invalid = "INVALID";
  States.start = "STARTED";
  States.active = "ACTIVATED";
  States.register = "REGISTERED";
  States.block = "BLOCKED";

  Mpin = function (options) {
    if (!options || !options.server) {
      return new Error("Missing server URL");
    }

    this.opts = options;
    this.settings = {};

  };

  Mpin.prototype.storageKey = "mpinjs";

  //supportedProtocols
  // temporary until extend with other portocols
  // then supported should be object of objects
  Mpin.prototype.cfg = {
    protocols: {
      supported: ["2pass"],
      default: "2pass"
    }
  };

  Mpin.prototype.init = function (cb) {
    var self = this, _initUrl;

    this.recover();

    var mpinData = this.getData();
    if (!mpinData) {
      mpinData = {
        version: "4",
        accounts: {}
      };
      this.storeData(mpinData);
    }

    if (this.opts.server.slice(-1) === "/") {
      _initUrl = this.opts.server;
    } else {
      _initUrl = this.opts.server + "/";
    }
    _initUrl += this.opts.rpsPrefix || "rps";
    _initUrl += "/clientSettings";

    this.request({url: _initUrl}, function (err, data) {
      if (err && cb) {
        return cb(err, null);
      }

      self.ready = true;
      self.settings = data;

      self.chooseAuthProtocol();
      cb && cb(null, true);
    });
  };

  Mpin.prototype.makeNewUser = function (userId, deviceId) {
    if (!userId) {
      return Errors.missingUserId;
    }

    this.addToUser(userId, {userId: userId, deviceId: deviceId, state: States.invalid});

    return this;
  };

  Mpin.prototype.startRegistration = function (userId, cb) {
    var _reqData = {}, self = this, _userState;
    if (!userId) {
      return cb ? cb(Errors.missingUserId, null) : {error: 1};
    } else if (!this.checkUser(userId)) {
      return cb(Errors.invalidUserId, null);
    } else if (!this.settings.registerURL) {
      return cb({code: Errors.missingParams.code, type: Errors.missingParams.type, message: "Missing registerURL"}, null);
    }

    //invalid
    _userState = this.getUser(userId, "state");
    if (_userState !== States.invalid) {
      return cb(Errors.wrongFlow, null);
    }

    _reqData.url = this.generateUrl("register");
    _reqData.type = "PUT";
    _reqData.data = {
      userId: userId,
      mobile: 0
    };

    if (Users[userId].deviceId) {
      _reqData.data.deviceName = Users[userId].deviceId;
    }

    this.request(_reqData, function (err, data) {
      if (err) {
        return cb(err, null);
      }

      self.addToUser(userId, {regOTT: data.regOTT, mpinId: data.mpinId, state: States.start});

      //force activate
      if (data.active) {
        self.addToUser(userId, {state: States.active});
      }

      cb && cb(null, true);
    });
  };

  //request cs1 + cs2
  Mpin.prototype.confirmRegistration = function (userId, cb) {
    var _cs1Url = "", self = this, _userState;
    if (!userId) {
      return cb ? cb(Errors.missingUserId, null) : Errors.missingUserId;
    } else if (!this.checkUser(userId)) {
      return cb(Errors.invalidUserId, null);
    } else if (!this.settings.signatureURL) {
      return cb({code: Errors.missingParams.code, type: Errors.missingParams.type, message: "Missing signatureURL option."}, null);
    }

    //started || activated
    _userState = this.getUser(userId, "state");
    if (_userState !== States.start && _userState !== States.active) {
      return cb(Errors.wrongFlow, null);
    }

    //already set.
    if (Users[userId].csHex) {
      return cb(null, true);
    }

    _cs1Url = this.generateUrl('signature', {userId: userId});
    //req cs1
    this.request({url: _cs1Url}, function (err, cs1Data) {
      var _cs2Url = "";
      if (err) {
        if (err.status == 401) {
          return cb(Errors.identityNotVerified, null);
        } else if (err.status == 400) {
          return cb(Errors.wrongFlow, null);
        }
      }

      _cs2Url = self.settings.certivoxURL + "clientSecret?" + cs1Data.params;

      //req cs2
      self.request({url: _cs2Url}, function (err, cs2Data) {
        var csHex;

        csHex = MPINAuth.addShares(cs2Data.clientSecret, cs1Data.clientSecretShare);

        self.addToUser(userId, {csHex: csHex, state: States.active});

        cb(null, true);
      });
    });
  };

  Mpin.prototype.finishRegistration = function (userId, pin) {
    var _user, token;

    if (!userId) {
      return Errors.missingUserId;
    }

    _user = this.getUser(userId);

    if (_user.state !== States.active || !Users[userId].csHex) {
      return Errors.wrongFlow;
    }

    if (isNaN(pin)) {
      pin = this.toHash(pin);
    }

    token = MPINAuth.calculateMPinToken(Users[userId].mpinId, pin, Users[userId].csHex);
    delete Users[userId].csHex;

    this.addToUser(userId, {token: token, state: States.register});

    return true;
  };

  //Put user / mpinId
  Mpin.prototype.restartRegistration = function (userId, cb) {
    var _reqData = {}, self = this, _userState;

    if (!userId) {
      return cb ? cb(Errors.missingUserId, null) : {error: 1};
    } else if (!this.checkUser(userId)) {
      return cb(Errors.invalidUserId, null);
    } else if (!this.settings.registerURL) {
      return cb({code: Errors.missingParams.code, type: Errors.missingParams.type, message: "Missing registerURL"}, null);
    }

    _userState = this.getUser(userId, "state");
    if (_userState !== States.start) {
      return cb(Errors.wrongFlow, null);
    }

    _reqData.url = this.generateUrl("restart", {userId: userId});
    _reqData.type = "PUT";
    _reqData.data = {
      userId: userId,
      mobile: 0,
      regOTT: Users[userId].regOTT
    };

    this.request(_reqData, function (err, data) {
      if (err) {
        return cb(err, null);
      }

      self.addToUser(userId, {regOTT: data.regOTT, mpinId: data.mpinId});

      //force activate
      if (data.active) {
        self.addToUser(userId, {state: States.active});
      }

      cb && cb(null, true);
    });
  };

  Mpin.prototype.startAuthentication = function (userId, cb) {
    var _tp1Url, self = this, _userState;

    if (!userId) {
      return cb ? cb(Errors.missingUserId, null) : Errors.missingUserId;
    } else if (!this.checkUser(userId)) {
      return cb(Errors.invalidUserId, null);
    } else if (!this.settings.timePermitsURL || !this.settings.certivoxURL) {
      return cb({code: Errors.missingParams.code, type: Errors.missingParams.type, message: "Missing timePermitsURL or/and certivoxURL option."}, null);
    }

    //registered
    _userState = this.getUser(userId, "state");
    if (_userState !== States.register) {
      return cb(Errors.wrongFlow, null);
    }

    //checkUser
    _tp1Url = this.generateUrl('permit1', {userId: userId});
    this.request({url: _tp1Url}, function (err, data) {
      if (err) {
        if (err.status === 401 || err.status === 403 || err.status === 410) {
          return cb(Errors.userRevoked, null);
        }

        return cb(err, null);
      }
      var _signature, _tp2Url, _timePermit1, _storageUrl;
      _signature = data["signature"];
      _timePermit1 = data["timePermit"];

      self.addToUser(userId, {currentDate: data['date']});

      //check cache if exist
      if (Users[userId].timePermitCache && Users[userId].timePermitCache.date === data.date) {
        var _timePermit2 = Users[userId].timePermitCache.timePermit;
        var timePermitHex = MPINAuth.addShares(_timePermit1, _timePermit2);

        self.addToUser(userId, {timePermitHex: timePermitHex});
        cb && cb(null, true); //exit with cache permit2
        return;
      } else {
        _storageUrl = self.generateUrl("storage", {date: data.date, storageId: data.storageId});

        self.request({url: _storageUrl}, function (storErr, storData) {
          if (storErr) {
            _tp2Url = self.generateUrl('permit2', {userId: userId});
            _tp2Url += "&signature=" + _signature;

            self._getTimePermit2({userId: userId, permit1: _timePermit1, permit2Url: _tp2Url, date: data.date}, cb); //continue

            return;
          }

          var _timePermit2 = storData;
          var timePermitHex = MPINAuth.addShares(_timePermit1, _timePermit2);

          self.addToUser(userId, {timePermitHex: timePermitHex, timePermitCache: {date: data.date, timePermit: _timePermit2}});

          cb && cb(null, true); //exit with storage permit2
        }, false);
      }
    });
  };

  Mpin.prototype._getTimePermit2 = function (options, cb) {
    var self = this, _timePermit1 = options.permit1;

    this.request({url: options.permit2Url}, function (err2, data2) {
      if (err2) {
        if (err2.status === 401 || err2.status === 403 || err2.status === 410) {
          return cb(Errors.userRevoked, null);
        }

        return cb(err2, null);
      }

      var _timePermit2, timePermitHex, _permitCache = {};
      _timePermit2 = data2["timePermit"];
      timePermitHex = MPINAuth.addShares(_timePermit1, _timePermit2);

      _permitCache.date = options.date;
      _permitCache.timePermit = data2["timePermit"];

      self.addToUser(options.userId, {timePermitHex: timePermitHex, timePermitCache: _permitCache});

      cb && cb(null, true);
    });
  };

  Mpin.prototype.chooseAuthProtocol = function () {
    var self = this;
    this.authProtocol = this.cfg.protocols.default;

    // We have 3 arrays:
    // 1. Ordered list of protocols sent from the server - this.settings.supportedProtocols
    // 2. List of protocols supported by the library - self.cfg.protocols.supported
    // 3. List of protocols that the library user would like to support - this.opts.authProtocols
    // The goal is to select the first protocol from the server's list (1) that is supported by the library (2) and selected by the lib user (3).
    // If the lib user didn't provide any preferences, then we select the first one from the server's list that is supported by the lib.
    if (this.settings.supportedProtocols && this.settings.supportedProtocols instanceof Array) {
      if (this.opts.authProtocols && this.opts.authProtocols instanceof Array) {

        this.settings.supportedProtocols.some(function (value) {
          if (self.opts.authProtocols.indexOf(value) !== -1 && self.cfg.protocols.supported.indexOf(value) !== -1) {
            self.authProtocol = value;
            return true;
          }
        });
      } else {
        this.settings.supportedProtocols.some(function (value) {
          if (self.cfg.protocols.supported.indexOf(value) !== -1) {
            self.authProtocol = value;
            return true;
          }
        });
      }
    }
  };


  Mpin.prototype.finishAuthentication = function (userId, pin, cb) {
    var _userState;

    //registered
    _userState = this.getUser(userId, "state");
    if (_userState !== States.register) {
      return cb(Errors.wrongFlow, null);
    } else if (!Users[userId].timePermitHex) {
      return cb({code: Errors.wrongFlow.code, type: Errors.wrongFlow.type, message: "Need to call startAuthentication method before this."}, null);
    }

    // The following checks that the authentication protocol is 2pass.
    // This is temporary until the lib supports other protocols
    if (this.authProtocol === this.cfg.protocols.default) {
      this._pass2Requests({userId: userId, pin: pin}, cb);
    }
  };

  Mpin.prototype.finishAuthenticationOtp = function (userId, pin, cb) {
    var _userState;

    //registered
    _userState = this.getUser(userId, "state");
    if (_userState !== States.register) {
      return cb(Errors.wrongFlow, null);
    } else if (!Users[userId].timePermitHex) {
      return cb({code: Errors.wrongFlow.code, type: Errors.wrongFlow.type, message: "Need to call startAuthentication method before this."}, null);
    }

    // The following checks that the authentication protocol is 2pass.
    // This is temporary until the lib supports other protocols
    if (this.authProtocol === this.cfg.protocols.default) {
      this._pass2Requests({userId: userId, pin: pin, otp: true}, function (err, data) {
        if (err) {
          return cb(err, null);
        }

        if (!data.expireTime || !data.ttlSeconds || !data.nowTime) {
          return cb(null, null);
        }

        data.expireTime = data.expireTime / 1000;
        data.nowTime = data.nowTime / 1000;

        cb(null, data);
      });
    }
  };

  Mpin.prototype.finishAuthenticationAN = function (userId, pin, accessNumber, cb) {
    var _userState;

    //registered
    _userState = this.getUser(userId, "state");
    if (_userState !== States.register) {
      return cb(Errors.wrongFlow, null);
    } else if (!Users[userId].timePermitHex) {
      return cb({code: Errors.wrongFlow.code, type: Errors.wrongFlow.type, message: "Need to call startAuthentication method before this."}, null);
    }

    // The following checks that the authentication protocol is 2pass.
    // This is temporary until the lib supports other protocols
    if (this.authProtocol === this.cfg.protocols.default) {
      this._pass2Requests({userId: userId, pin: pin, accessNumber: accessNumber.toString()}, function (err, data) {
        if (err) {
          return cb(err, null);
        }

        if (!data.expireTime || !data.ttlSeconds || !data.nowTime) {
          return cb(null, null);
        }

        data.expireTime = data.expireTime / 1000;
        data.nowTime = data.nowTime / 1000;

        cb(null, data);
      });
    }
  };

  Mpin.prototype._pass2Requests = function (opts, cb) {
    var userId, pin, otp, accessNumber, self = this, _reqData = {};
    userId = opts.userId;
    pin = isNaN(opts.pin) ? this.toHash(opts.pin) : opts.pin;

    otp = opts.otp || false;
    accessNumber = opts.accessNumber || false;

    _reqData.url = this.generateUrl("pass1");
    _reqData.type = "POST";
    _reqData.data = this.getAuthData(userId, pin);

    //  pass1
    this.request(_reqData, function (pass1Err, pass1Data) {
      var _req2Data = {}, wid = "0";
      _req2Data.url = self.generateUrl("pass2");
      _req2Data.type = "POST";

      accessNumber && (wid = accessNumber);
      _req2Data.data = MPINAuth.pass2Request(pass1Data.y, otp, wid);

      _req2Data.data.mpin_id = Users[userId].mpinId;

      // pass 2
      self.request(_req2Data, function (pass2Err, pass2Data) {
        var otpCode;
        if (pass2Err) {
          return cb(pass2Err, null);
        }

        otpCode = pass2Data["OTP"] || false;

        if (pass2Data && pass2Data["OTP"]) {
          delete pass2Data["OTP"];
        }

        self._authenticate({userId: userId, mpinResponse: pass2Data, otpCode: otpCode, accessNumber: accessNumber}, cb);
      });
    });

  };

  Mpin.prototype._authenticate = function (opts, cb) {
    var _authData = {}, self = this;

    if (opts.accessNumber) {
      _authData.url = this.generateUrl("mobileauth");
    } else {
      _authData.url = this.generateUrl("auth");
    }

    _authData.type = "POST";
    _authData.data = {mpinResponse: opts.mpinResponse};

    this.request(_authData, function (authErr, authData) {
      if (authErr) {
        if (authErr.status === 401) {
          return cb(Errors.wrongPin, null);
        } else if (authErr.status === 403) {
          return cb(Errors.identityNotAuthorized, null);
        } else if (authErr.status === 408) {
          return cb(Errors.requestExpired, null);
        } else if (authErr.status === 410) {
          opts.userId && self.addToUser(opts.userId, {state: States.block});
          return cb(Errors.wrongPin, null);
        } else if (authErr.status === 412) {
          return cb(Errors.incorrectAccessNumber, null);
        } else {
          return cb(Errors.wrongPin, null);
        }
      }

      if (opts.otpCode && authData) {
        authData.otp = opts.otpCode;
      }

      cb && cb(null, authData || null);
    });
  };

  Mpin.prototype.checkAccessNumber = function (accessNumber) {
    accessNumber = accessNumber.toString();
    if (!this.settings.accessNumberUseCheckSum || accessNumber.length != this.settings.accessNumberDigits) {
      return true;
    } else {
      if (this.settings.cSum === 1) {
        return this.checkAccessNumberSum2(accessNumber, 6);
      } else {
        return this.checkAccessNumberSum(accessNumber);
      }
    }
  };

  Mpin.prototype.checkAccessNumberSum = function (accNumber, accLen) {
    accLen || (accLen = 1);

    var n = parseInt(accNumber.slice(0, accNumber.length - accLen), 10);
    var cSum = parseInt(accNumber.slice(accNumber.length - accLen, accNumber.length), 10);

    var p = 99991;
    var g = 11;
    var checkSum = ((n * g) % p) % Math.pow(10, accLen);

    return (checkSum === cSum);
  };

  Mpin.prototype.checkAccessNumberSum2 = function (accNumber, accLen) {
    var cSum, checksum, x, w, wid, wid_len, g = 11, sum_d = 0;
    wid = accNumber.toString();
    wid = wid.substring(0, accNumber.toString().length - 1);
    w = accLen + 1;
    sum_d = 0;
    wid_len = wid.length;

    for (var i = 0; i < wid_len; i++) {
      x = parseInt(wid[i]);
      sum_d += (x * w);
      w -= 1;
    }
    checksum = (g - (sum_d % g)) % g;
    checksum = (checksum === 10) ? 0 : checksum;

    //get last one digit and compare with checksum result
    cSum = accNumber.substr(-1);
    cSum = parseInt(cSum);
    return (cSum === checksum);
  };

  Mpin.prototype.getAuthData = function (userId, pin) {
    var _auth = {};

    _auth.mpin = Users[userId].mpinId;
    _auth.token = Users[userId].token;
    _auth.timePermit = Users[userId].timePermitHex;
    _auth.date = Users[userId].currentDate;

    return MPINAuth.pass1Request(_auth.mpin, _auth.token, _auth.timePermit, pin, _auth.date, null);
  };

  Mpin.prototype.fromHex = function (strData) {
    if (!strData || strData.length % 2 != 0)
      return '';
    strData = strData.toLowerCase();
    var digits = '0123456789abcdef';
    var result = '';
    for (var i = 0; i < strData.length; ) {
      var a = digits.indexOf(strData.charAt(i++));
      var b = digits.indexOf(strData.charAt(i++));
      if (a < 0 || b < 0)
        return '';
      result += String.fromCharCode(a * 16 + b);
    }
    return result;
  };

  Mpin.prototype.toHash = function (strData) {
    var hash = 0;
    for (var i = 0; i < strData.length; i++) {
      hash = ((hash << 5) - hash) + strData.charCodeAt(i);
    }
    return hash;
  };

  Mpin.prototype.getAccessNumber = function (cb) {
    var self = this, _reqData = {};

    _reqData.url = this.generateUrl("getnumber");
    _reqData.type = "POST";

    this.request(_reqData, function (err, data) {
      if (err) {
        return cb(err, null);
      }
      self.webOTT = data.webOTT;

      var returnData = {
        accessNumber: data.accessNumber,
        ttlSeconds: data.ttlSeconds,
        localTimeStart: data.localTimeStart / 1000,
        localTimeEnd: data.localTimeEnd / 1000
      };

      cb && cb(null, returnData);
    });
  };

  Mpin.prototype.getQrUrl = function (userId, cb) {
    var self = this, _reqData = {};

    _reqData.url = this.generateUrl("getqrurl");
    _reqData.type = "POST";
    _reqData.data = {
      prerollid: userId || ""
    };

    this.request(_reqData, function (err, data) {
      if (err) {
        return cb(err, null);
      }
      self.webOTT = data.webOTT;

      var returnData = {
        qrUrl: data.qrUrl,
        ttlSeconds: data.ttlSeconds,
        localTimeStart: data.localTimeStart / 1000,
        localTimeEnd: data.localTimeEnd / 1000
      };

      cb && cb(null, returnData);
    });
  };

  Mpin.prototype.waitForMobileAuth = function (timeoutSeconds, requestSeconds, cb, cbStatus) {
    var self = this, _reqData = {};
    if (!this.webOTT) {
      return cb({code: Errors.wrongFlow.code, type: Errors.wrongFlow.type, message: "Need to call getAccessNumber method before this."}, null);
    } else if (!timeoutSeconds) {
      return cb({code: Errors.missingParams.code, type: Errors.missingParams.type, message: "Missing timeout/expiration period(in seconds)."}, null);
    }

    self.mobileStatus = self.mobileStatus || '';

    if (typeof this.timeoutPeriod === "undefined") {
      this.timeoutPeriod = timeoutSeconds * 1000;
    }

    _reqData.url = this.generateUrl("getaccess");
    _reqData.type = "POST";
    _reqData.data = {webOTT: this.webOTT};

    this.request(_reqData, function (err, data) {
      var _requestPeriod;

      if (err) {
        cb && cb(err, null);
      } else {
        authOTT = data.authOTT
        delete data.authOTT

        if (data.status === 'authenticate') {
          cbStatus && cbStatus(data);
          self._authenticate({mpinResponse: {authOTT: authOTT}}, cb);
        } else {
          if (self.timeoutPeriod > 0) {
            _requestPeriod = requestSeconds ? requestSeconds * 1000 : 3000;
            self.timeoutPeriod -= _requestPeriod;
            if (data.status !== self.mobileStatus) {
              self.mobileStatus = data.status;
              cbStatus && cbStatus(data);
            }
            self.intervalID2 = setTimeout(function () {
              self.waitForMobileAuth.call(self, timeoutSeconds, requestSeconds, cb, cbStatus);
            }, _requestPeriod);
            return;
          } else if (self.timeoutPeriod <= 0) {
            delete self.timeoutPeriod;
            cb && cb(Errors.timeoutFinish, null);
            return;
          }
        }
      }
    });
  };

  Mpin.prototype.cancelMobileAuth = function () {
    if (this.intervalID2) {
      clearInterval(this.intervalID2);
    }

    if (this.timeoutPeriod) {
      delete this.timeoutPeriod;
    }
  };


  Mpin.prototype.generateUrl = function (type, options) {
    var url, mpData, mpin_id_bytes, hash_mpin_id_bytes = [], hash_mpin_id_hex;

    switch (type) {
      case "register":
        url = this.settings.registerURL;
        break;
      case "restart":
        url = this.settings.registerURL + "/";
        url += Users[options.userId].mpinId;
        break;
      case "signature":
        url = this.settings.signatureURL + "/";
        url += Users[options.userId].mpinId;
        url += "?regOTT=" + Users[options.userId].regOTT;
        break;
      case "permit1":
        url = this.settings.timePermitsURL + "/";
        url += Users[options.userId].mpinId;
        break;
      case "permit2":
        mpData = this.fromHex(Users[options.userId].mpinId);
        mpin_id_bytes = MPIN.stringtobytes(mpData);
        hash_mpin_id_bytes = MPIN.HASH_ID(mpin_id_bytes);
        hash_mpin_id_hex = MPIN.bytestostring(hash_mpin_id_bytes);
        url = this.settings.certivoxURL + "timePermit";
        url += "?app_id=" + this.settings.appID;
        url += "&mobile=0";
        url += "&hash_mpin_id=" + hash_mpin_id_hex;
        break;
      case "pass1":
        url = this.settings.mpinAuthServerURL + "/pass1";
        break;
      case "pass2":
        url = this.settings.mpinAuthServerURL + "/pass2";
        break;
      case "auth":
        url = this.settings.authenticateURL;
        break;
      case "mobileauth":
        url = this.settings.mobileAuthenticateURL;
        break;
      case "getnumber":
        url = this.settings.getAccessNumberURL;
        break;
      case "getqrurl":
        url = this.settings.getQrUrl;
        break;
      case "getaccess":
        url = this.settings.accessNumberURL;
        break;
      case "storage":
        url = this.settings.timePermitsStorageURL + "/" + this.settings.appID + "/";
        url += options.date + "/" + options.storageId;
        break;
    }

    return url;
  };

  Mpin.prototype.listUsers = function () {
    var listUsers = [];
    for (var uKey in Users) {
      listUsers.push({
        userId: Users[uKey].userId,
        deviceId: Users[uKey].deviceId || "",
        state: Users[uKey].state || ""
      });
    }
    return listUsers;
  };

  Mpin.prototype.checkUser = function (userId) {
    return (Users[userId]) ? true : false;
  };

  Mpin.prototype.getUser = function (userId, property) {
    var _user = {};
    if (!userId) {
      return Errors.missingUserId;
    } else if (!this.checkUser(userId)) {
      return Errors.invalidUserId;
    }

    _user = {
      userId: Users[userId].userId,
      deviceId: Users[userId].deviceId || "",
      state: Users[userId].state
    };

    if (!property) {
      return _user;
    } else if (property && _user[property]) {
      return _user[property];
    }
  };


  Mpin.prototype.deleteUser = function (userId) {
    var mpinData = this.getData(), delMpinId;

    if (!userId) {
      return Errors.missingUserId;
    } else if (!this.checkUser(userId)) {
      return Errors.invalidUserId;
    }

    delMpinId = Users[userId].mpinId;

    //memory
    delete Users[userId];

    //store
    delete mpinData.accounts[delMpinId];

    this.storeData(mpinData);
  };

  Mpin.prototype.addToUser = function (userId, userProps, skipSave) {
    if (!this.checkUser(userId)) {
      //create
      Users[userId] = {};
    }

    //If mpinId has changed, we need to delete the object withthe previous one
    if (Users[userId].mpinId && userProps.mpinId && Users[userId].mpinId != userProps.mpinId) {
      this.deleteData(userId);
    }

    for (var uKey in userProps) {
      if (userProps[uKey]) {
        Users[userId][uKey] = userProps[uKey];
      }
    }

    var _save = !skipSave;
    _save && this.setData(userId, userProps);
  };

  Mpin.prototype.restore = function () {
    Users = {};
  };

  Mpin.prototype.deleteData = function (userId) {
    var mpinData = this.getData();

    var mpinId = Users[userId].mpinId;
    if (!mpinData || !mpinData.accounts[mpinId]) {
      return;
    }

    delete mpinData.accounts[mpinId];

    this.storeData(mpinData);
  };

  Mpin.prototype.setData = function (userId, upData) {
    var mpinData = this.getData();

    var mpinId = upData.mpinId || Users[userId].mpinId;
    if (!mpinId) {
      return false;
    }

    //update Default Identity
    if (!mpinData.accounts[mpinId]) {
      mpinData.accounts[mpinId] = {};
    }

    if (upData.regOTT) {
      mpinData.accounts[mpinId].regOTT = upData.regOTT;
    }

    if (upData.timePermitHex) {
      mpinData.accounts[mpinId].MPinPermit = upData.timePermitHex;
    }

    if (upData.token) {
      mpinData.accounts[mpinId].token = upData.token;
    }

    if (upData.state && Users[userId].mpinId) {
      mpinData.accounts[mpinId].state = upData.state;
    }

    //cache cache
    if (upData.timePermitCache) {
      mpinData.accounts[mpinId].timePermitCache = upData.timePermitCache;
    }

    this.storeData(mpinData);
  };

  Mpin.prototype.storeData = function (mpinData, key) {
    var storageKey = key || this.storageKey;
    localStorage.setItem(storageKey, JSON.stringify(mpinData));
  };

  Mpin.prototype.recover = function () {
    var userId, userData = {}, mpinData = this.getData(), isOldData = false;

    if (!mpinData) {
      mpinData = this.getData("mpin");
      isOldData = true;
    }

    if (mpinData && "accounts" in mpinData) {
      for (var mpinId in mpinData.accounts) {
        userId = (JSON.parse(this.fromHex(mpinId))).userID;

        userData = {};
        userData.userId = userId;
        userData.mpinId = mpinId;

        mpinData.accounts[mpinId].regOTT && (userData.regOTT = mpinData.accounts[mpinId].regOTT);
        mpinData.accounts[mpinId].token && (userData.token = mpinData.accounts[mpinId].token);
        mpinData.accounts[mpinId].MPinPermit && (userData.MPinPermit = mpinData.accounts[mpinId].MPinPermit);
        mpinData.accounts[mpinId].timePermitCache && (userData.timePermitCache = mpinData.accounts[mpinId].timePermitCache);

        if (isOldData || !mpinData.accounts[mpinId].state) {
          if (mpinData.accounts[mpinId].token) {
            userData.state = States.register;
          } else if (mpinData.accounts[mpinId].regOTT) {
            userData.state = States.start;
          } else {
            userData.state = States.invalid;
          }
        } else {
          userData.state = mpinData.accounts[mpinId].state;
        }

        //call add To user & skip Save
        this.addToUser(userId, userData, !isOldData);
      }
    }

    if (isOldData && mpinData && "accounts" in mpinData) {
      delete mpinData.accounts;
      this.storeData(mpinData, "mpin");
    }
  };

  Mpin.prototype.getData = function (getKey) {
    var localKey, mpinData;
    localKey = getKey || this.storageKey;
    mpinData = localStorage.getItem(localKey);
    mpinData = JSON.parse(mpinData);
    return mpinData;
  };

//{url: url, type: "get post put", data: data}
  Mpin.prototype.request = function (options, cb, jsonResponse) {
    var _request = new XMLHttpRequest(), _url, _type, _parseJson;
    _url = options.url || "";
    _type = options.type || "GET";

    _parseJson = (typeof jsonResponse !== "undefined") ? jsonResponse : true;

    _request.onreadystatechange = function () {
      if (_request.readyState === 4 && _request.status === 200) {
        if (_parseJson && _request.responseText) {
          cb(null, JSON.parse(_request.responseText));
        } else {
          cb(null, _request.responseText);
        }
      } else if (_request.readyState === 4) {
        cb({status: _request.status}, null);
      }
    };

    _request.open(_type, _url, true);
    if (options.data) {
      _request.setRequestHeader("Content-Type", "application/json");
      _request.send(JSON.stringify(options.data));
    } else {
      _request.send();
    }
  };

  return Mpin;
})();


//module.exports = mpinjs;
//http://www.matteoagosti.com/blog/2013/02/24/writing-javascript-modules-for-both-browser-and-node/
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
  module.exports = mpinjs;
else
  window.mpinjs = mpinjs;
