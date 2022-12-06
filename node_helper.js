/* Magic Mirror
 * Node Helper: MMM-MercedesMe
 *
 * By Ashish Tank https://github.com/ashishtank
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
const request = require('request');
var OAuth = require('./OAuth');

module.exports = NodeHelper.create({

  /**
   * Default config
   */
  defaults: {
    scope: 'openid offline_access mb:vehicle:mbdata:evstatus',
    vehicleType: 'Electric',
    authUrl: `https://ssoalpha.dvb.corpinter.net/v1/auth`,
    tokenUrl: `https://ssoalpha.dvb.corpinter.net/v1/token`,
    debug: false,
    vehicleDataUrl: "https://api.mercedes-benz.com/vehicledata/v2/vehicles/VEHICLE_ID/containers/VEHICLE_STATUS",
    redirect_uri: 'http://localhost:8080/MMM-MercedesMe/callback'
  },
  config: {},
  authClient: null,

  /**
   * Node helper start event
   */
  start: function () {
    console.log('Starting node_helper for Mercedes Me');
    this.expressApp.get(`/${this.name}/auth`, this.handleAuthReq.bind(this));
    this.expressApp.get(`/${this.name}/callback`, this.handleCallback.bind(this));
    this.defaults.tokenFile = `./modules/${this.name}/tokens.json`;
  },

  /**
   * Handles the auth request endpoint, should be call by clicking on authenticate link
   * @param {HttpRequest} req Http request
   * @param {HttpResponse} res Http response
   */
  handleAuthReq: function (req, res) {
    try {
      this.debug('Handle OAuth request');
      var authUrl = this.authClient.getAuthorizeUrl();
      this.debug(authUrl);
      res.redirect(authUrl);
    } catch (error) {

    }
  },

  /**
   * Handles the OAuth call back for token
   * @param {HttpRequest} req Http request
   * @param {HttpResponse} res Http response 
   */
  handleCallback: function (req, res) {
    this.debug('Handle OAuth callback');
    var authCode = req.query.code;
    this.authClient.getToken(authCode, () => {
      this.debug('OAuth callback Success');
      res.redirect('/');
    });
  },

  /**
   * Socket notification recieved from client module
   * @param {string} notification Notification name
   * @param {object} payload Payload
   */
  socketNotificationReceived: function (notification, payload) {
    var self = this;
    if (notification === 'SET_CONFIG') {
      this.debug('SET Config received');
      if (this.authClient != null) {
        this.authClient.isExpired() ? self.sendSocketNotification('SHOW_LOGIN') : self.sendSocketNotification('MMM_MERCEDESME_READY');
      }
      this.config = Object.assign(this.defaults, payload);
      if (!this.config.client_id) {
        console.log('Client ID is not Set !, Aborting for this instance');
        return;
      }
      if (this.authClient === null) {
        self.debug('creating auth client');
        this.authClient = new OAuth(this.config);
        self.debug('Client id ' + this.authClient.client_id);
      }
      if (this.authClient.isExpired()) {
        self.debug('Current token is expired or does not exists');
        if (this.authClient.refresh_token && this.authClient.refresh_token.length > 0) {
          this.authClient.refreshToken(() => {
            self.sendSocketNotification('MMM_MERCEDESME_READY');
          });
        }
        else
          self.sendSocketNotification('SHOW_LOGIN');
      }
      else {
        self.sendSocketNotification('MMM_MERCEDESME_READY');
      }
    }
    else if (notification === 'GET_CAR_DATA') {
      var apiUrl = this.getVehicleDataUrl(payload);
      var carRequest = payload;
      self.debug('Vehicle data url ' + apiUrl);
      if (this.authClient === null) return;
      if (this.authClient.isExpired()){
        this.authClient.refreshToken(() => {
          self.sendSocketNotification('GET_CAR_DATA', carRequest);
        });
        return;

      };
      if (apiUrl.length === 0) {
        self.sendSocketNotification('GET_CONFIG');
        return;
      }
      const options = {
        url: apiUrl,
        method: 'GET',
        headers: {
          'User-Agent': 'MagicMirror',
          'Authorization': 'Bearer ' + this.authClient.access_token
        }
      };

      request(options, function (error, response, body) {
        if (!error) {
          if (response.statusCode == 200) {
            carRequest = Object.assign({}, carRequest, self.convertToDisplayObj(body));
            self.sendSocketNotification("UPDATE_CAR_DATA", carRequest);
            console.log('carRequest response:', carRequest)
          }
          else {
            console.log(response.statusCode + ' - ' + response.statusMessage);
          }
        } else if (error) {
          console.log(error);
        }
      });
    }
  },

  getVehicleDataUrl: function (config) {
    if (this.config && !this.config.vehicleDataUrl) return '';
    if (!config) return '';

    var url = this.config.vehicleDataUrl.replace('VEHICLE_ID', config.vehicleId);
    var vehicleStatus = 'electricvehicle';
    switch (config.vehicleType.toLowerCase()) {
      case 'diesel':
        vehicleStatus = 'fuelstatus';
    }
    url = url.replace('VEHICLE_STATUS', vehicleStatus);
    return url;
  },

  /**
   * Converts the JSON response to display JSON
   * @param {JSON Buffer} body JSON Buffer string
   */
  convertToDisplayObj: function (body) {
    let displayObj = this.objArrayToObject(JSON.parse(body));

    //Electric car
    if (displayObj.soc) displayObj.fuelLevel = displayObj.soc;
    if (displayObj.rangeelectric) displayObj.range = displayObj.rangeelectric;

    //Non electric car
    if (displayObj.tanklevelpercent) displayObj.fuelLevel = displayObj.tanklevelpercent;
    if (displayObj.rangeliquid) displayObj.range = displayObj.rangeliquid;

    return displayObj;
  },

  /**
   * Make array of JSON to one JSON object
   * @param {JSON} payload JSON array response from api
   */
  objArrayToObject: function (payload) {
    var flattendObj = {};
    function getObj(item, index) {
      flattendObj = Object.assign(flattendObj, item);
    }
    payload.forEach(getObj);
    return flattendObj;
  },

  /**
   * Logs the message in console if enabled
   * @param {string} msg Debug message to low
   */
  debug: function (msg) {
    var shouldLog = true;
    if (this.config && typeof this.config.debug !== 'undefined') shouldLog = this.config.debug;
    if (shouldLog) console.log(msg);
  }
});
