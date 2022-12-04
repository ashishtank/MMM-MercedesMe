/* Magic Mirror
 * Module: MMM-MercedesMe
 *
 * By Ashish Tank https://github.com/ashishtank
 * MIT Licensed.
 */
Module.register("MMM-MercedesMe", {
  
  requiresVersion: '2.14.0',
  // Default module config.
  defaults: {
    text: 'Hello Mercedes !',
    updateInterval: 300000,
    displayStyle: 'singleDial',
    maxRange: 100
  },

  carData: {},
  idSuffix: '',
  intervalId: 0,
  ticksInitilized: false,

  /**
   * Initializes the module
   */
  init: function () {
    Log.log("MercedesMe is in init!");
  },

  /**
   * Starts the module
   */
  start: function () {
    Log.info(this.name + ' is starting');
    this.sendSocketNotification('SET_CONFIG', this.config);
    this.idSuffix = 'fuelLevel' + this.identifier;
  },

  /**
   * Module loaded event
   */
  loaded: function (callback) {
    this.finishLoading();
    Log.info(this.name + ' is loaded!');
    callback();
  },

  /**
   * Returns css style, below css classes can be overridden in custom.css
   */
  getStyles: function () {
    return [
      'MMM-MercedesMe.css',
    ]
  },

  /**
   * Returns header to be shown on module
   */
  getHeader: function () {
    return this.data.header || "My Mercedes";
  },

  /**
   * Returns template based on style
   */
  getTemplate: function () {
    switch (this.config.displayStyle.toLowerCase()) {
      case "twodial":
        return `twodial.njk`;
      default:
        return `singledial.njk`;
    }
  },

  /**
   * Returns the template data to be displayed on UI
   */
  getTemplateData: function () {
    return {
      config: this.config,
      currentClass: this.currentClass,
      carData: this.carData,
      idSuffix: this.idSuffix,
      ticksInitilized: this.ticksInitilized
    };
  },

  /**
   * Notification received event
   * @param {string} notification Notification name
   * @param {Object} payload Payload object
   * @param {Module} sender MM Module which sent notification
   */
  notificationReceived: function (notification, payload, sender) {
    if (notification === 'UPDATE_CAR_DATA') {
      this.sendSocketNotification('GET_CAR_DATA');
    }
    else if (notification === 'MODULE_DOM_CREATED') {
      this.initTicks();
    }
  },

  /**
   * Socket notification received event
   * @param {string} notification Notification name
   * @param {Object} payload Payload object
   */
  socketNotificationReceived: function (notification, payload) {
    let self = this;
    if (payload && payload.identifier !== this.identifier && notification !== 'SHOW_LOGIN') return;

    if (notification === 'SHOW_LOGIN') {
      Log.debug('Show login received... Show auth link');
      let login = document.getElementById('mmm-mercedes-me-login');
      if (login) login.style.display = 'block';
      let display = document.getElementById('mmm-mercedes-me-display');
      if (display) display.style.display = 'none';
      display = document.getElementById('mercedesMain');
      if (display) display.style.display = 'none';
    }
    else if (notification === 'GET_CONFIG') {
      Log.debug('Get config received');
      this.sendSocketNotification('SET_CONFIG', this.config);
    }
    else if (notification === 'MMM_MERCEDESME_READY') {
      Log.debug('Mercedes Me is Ready');
      document.querySelectorAll('.two-dial-wrapper').forEach(function (e) {
        e.style.display = 'block';
      });
      self.updateData();
      self.startLoop();
    }
    else if (notification === 'UPDATE_CAR_DATA') {
      Log.debug('Update card data');
      self.carData = payload;
      if (payload.displayStyle.toLowerCase() === 'singledial') {
        if (!self.ticksInitilized) {
          self.initTicks();
        }
        else
          // self.updateDom();
          document.getElementById('range' + self.idSuffix).innerHTML = payload.range.value;
          document.getElementById('fuelLevel' + self.idSuffix).innerHTML = payload.fuelLevel.value;
      }
      else {
        document.getElementById('fuelpath' + self.idSuffix).setAttribute("stroke-dasharray", payload.fuelLevel.value + ", 100");
        document.getElementById('percent' + self.idSuffix).innerHTML = '&nbsp;' + payload.fuelLevel.value + '%';
        document.getElementById('range' + self.idSuffix).innerHTML = payload.range.value;
        var rangePercent = (payload.range.value * 100 / self.config.maxRange);
        document.getElementById('rangepath' + self.idSuffix).setAttribute("stroke-dasharray", Math.trunc(rangePercent) + ", 100");
        document.getElementById('fuelLevel' + self.idSuffix).innerHTML = payload.fuelLevel.value;
      }
    }
  },

  /**
   * Starts the update loop
   */
  startLoop: function () {
    let self = this;
    if (self.intervalId != 0) return;
    self.intervalId = window.setInterval(() => {
      self.updateData();
    }, this.config.updateInterval);
  },

  /**
   * Updates vehicle data
   */
  updateData() {
    Log.debug('Update data');
    this.sendSocketNotification('GET_CAR_DATA', { vehicleId: this.config.vehicleId, vehicleType: this.config.vehicleType, displayStyle: this.config.displayStyle, identifier: this.identifier });
  },

  /**
   * Shows startup sequence in singleDial display style
   */
  initTicks() {
    var time = 0;
    for (var i = 0; i <= document.getElementsByClassName('tick').length; i++) {
      window.setTimeout(function displayTicks(tick, i, ctx) {
        if (tick) tick.style.display = 'block';
        if (i === 50) {
          ctx.ticksInitilized = true;
          ctx.updateData();
        }
      }, time, document.getElementsByClassName('tick')[50 - i], i, this);
      time += 50;
    }
  }

});
