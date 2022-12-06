const fs = require('fs');
const request = require('request');
const EXPIRYTHRESHOLD = 3300;
class OAuth {
  constructor(config) {
    this.client_id = config.client_id;
    this.client_secret = config.client_secret;
    this.scope = config.scope;
    this.authUrl = config.authUrl;
    this.tokenUrl = config.tokenUrl;
    this.redirectUri = config.redirect_uri;
    this.tokenFile = config.tokenFile;
    if (!isNullOrUndefined(this.tokenFile)) this.initTokenFromFile();
  }

  getAuthorizeUrl() {
    this.state = getUuId();
    const authorizationUrl = this.authUrl + `?response_type=code&client_id=${this.client_id}&&redirect_uri=${this.redirectUri}&scope=${this.scope}&state=${this.state}`;
    return authorizationUrl;

  }

  getToken(authCode, callback) {
    var self = this;
    const options = {
      url: this.tokenUrl,
      method: 'POST',
      headers: {
        'User-Agent': 'MMM-MercedesMe'
      },
      auth: {
        user: this.client_id,
        pass: this.client_secret
      },
      form: {
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: this.redirectUri,
        scope: this.scope
      }
    };
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        self.saveAndInitToken(body);
        callback();
      } else if (error) {
        console.log(error);
      }
    });
  }

  refreshToken(cb) {
    console.log('refreshing the token');
    var self = this;
    const options = {
      url: this.tokenUrl,
      method: 'POST',
      headers: {
        'User-Agent': 'MMM-MercedesMe'
      },
      auth: {
        user: this.client_id,
        pass: this.client_secret
      },
      form: {
        grant_type: 'refresh_token',
        refresh_token: this.refresh_token
      }
    };
    //console.log(options);
    request(options, function (error, response, body) {
      //TODO: Handle refresh token expiry
      if (!error) {
        if (response.statusCode == 200) {
          console.log('refresh token success !');
          self.saveAndInitToken(body);
          cb();
        }
        else {
          console.log(response.statusCode + ' - ' + response.statusMessage);
        }
      } else if (error) {
        console.log(error);
      }
    });
  }

  initTokenFromFile() {
    try {
      console.log('Init token from file' + this.tokenFile);
      if (fs.existsSync(this.tokenFile)) {
        var data = fs.readFileSync(this.tokenFile, 'utf8');
        this.initToken(JSON.parse(data));
      }
      else {
        console.log('No token file found');
      }
    } catch (err) {
      console.error(err)
    }
  }

  initToken(tokenObj) {
    this.access_token = tokenObj.access_token;
    this.refresh_token = tokenObj.refresh_token;
    this.expires_at = tokenObj.expires_at;
    this.expiry_time = tokenObj.expiry_time;
  }

  isExpired() {
    console.log(`isExpired date:  ${(new Date().getTime() > (this.expiry_time - EXPIRYTHRESHOLD))}`)
    console.log(`Expiry_time: ${this.expiry_time}, datenow: ${new Date().getTime()}, threshold: ${EXPIRYTHRESHOLD}`)
    if (isNullOrUndefined(this.access_token) || this.access_token.length === 0) return true;
    return (new Date().getTime() > (this.expiry_time - EXPIRYTHRESHOLD));
  }

  saveAndInitToken(tokenBody) {
    try {
      var token = JSON.parse(tokenBody);
      token.expiry_time = new Date().getTime() + (token.expires_in * 1000);
      this.initToken(token);
      fs.writeFileSync(this.tokenFile, JSON.stringify(token));
    } catch (error) {
      console.log(error);
    }
  }

}

function getUuId() {
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

function isNullOrUndefined(obj) {
  return (typeof obj === 'undefined') || (typeof obj === 'unknown') || (obj === null);
}

module.exports = OAuth;