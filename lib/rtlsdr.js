// Copyright 2018 Sandeep Mistry All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//check whether run in browser or in nodejs and require right usb module
const jsEnv = require('browser-or-node');
usb = null;
if (jsEnv.isBrowser) {
  usb = require('./web-usb');
} else {
  usb = require('./usb');
}
const RTL2832U = require('./rtl2832u');

const FILTERS = [
  {
    vendorId: 0x0bda,
    productId: 0x2832
  },
  {
    vendorId: 0x0bda,
    productId: 0x2838
  }
];

function RtlSdr(usbDevice) {
  this._usbDevice = usbDevice;
  this._rtl2832u = null;
}

RtlSdr.prototype.open = async function(options) {
  await this._usbDevice.open();
  await this._usbDevice.selectConfiguration(1);

  this._rtl2832u = new RTL2832U(this._usbDevice, options.ppm || 0, options.gain || null);

  await this._rtl2832u.open();
};

RtlSdr.prototype.setSampleRate = async function(sampleRate) {
  return await this._rtl2832u.setSampleRate(sampleRate);
};

RtlSdr.prototype.setCenterFrequency = async function(centerFrequency) {
  return await this._rtl2832u.setCenterFrequency(centerFrequency);
};

RtlSdr.prototype.resetBuffer = async function() {
  await this._rtl2832u.resetBuffer();
};

RtlSdr.prototype.readSamples = async function(length) {
  return await this._rtl2832u.readSamples(length);
};

RtlSdr.prototype.close = async function() {
  await this._rtl2832u.close();
  await this._usbDevice.close();
};

RtlSdr.requestDevice = async function() {
  let usbDevice = await usb.requestDevice(FILTERS);

  return new RtlSdr(usbDevice);
};

RtlSdr.getDevices = async function() {
  let usbDevices = await usb.getDevices(FILTERS);

  const sdrs = [];

  usbDevices.forEach((usbDevice) => {
    sdrs.push(new RtlSdr(usbDevice));
  });

  return sdrs;
};

module.exports = RtlSdr;
