import Debug from 'debug';
import bleno from '@abandonware/bleno';
import Flags from '../flags.js';

const debugRSC = Debug('rsc');

// Spec
// https://developer.bluetooth.org/gatt/characteristics/Pages/CharacteristicViewer.aspx?u=org.bluetooth.characteristic.cycling_power_measurement.xml

export default class RSCMeasurementCharacteristic extends bleno.Characteristic {

  constructor() {
    super({
      uuid: '2A53',
      value: null,
      properties: ['notify'],
      descriptors: [
        new bleno.Descriptor({
          uuid: '2901',
          value: 'Running Speed And Cadence'
        }),
        new bleno.Descriptor({
          uuid: '2902',
          value: Buffer.alloc(2)
        })
      ]
    });

    this.rscFlags = new Flags([
      'stride_length',
      'total_distance',
      'walk_run'
    ]);

    this._updateValueCallback = null;
  }

  onSubscribe(maxValueSize, updateValueCallback) {
    debugRSC('[RSCMeasurementCharacteristic] client subscribed to PM');
    this._updateValueCallback = updateValueCallback;
    return this.RESULT_SUCCESS;
  }

  onUnsubscribe() {
    debugRSC('[RSCMeasurementCharacteristic] client unsubscribed from PM');
    this._updateValueCallback = null;
    return this.RESULT_UNLIKELY_ERROR;
  }

  notify(event) {
    if (!(('speed' in event) && ('cadence' in event))) {
      // Speed and Cadence are mandatory
      return this.RESULT_SUCCESS;
    }

    const buffer = Buffer.alloc(10);
    let offset = 0;

    // flags
    buffer.writeUInt8(this.rscFlags.from(event), offset);
    offset += 1;

    // Unit is in m/s with a resolution of 1/256 s
    debugRSC("Running Speed: " + event.speed);
    buffer.writeUInt16LE(Math.floor(event.speed * 256), offset);
    offset += 2;

    debugRSC("Running Cadence: " + event.cadence);
    buffer.writeUInt8(Math.floor(event.cadence), offset);
    offset += 1;

    if (this.rscFlags.isSet('stride_length')) {
      buffer.writeUInt16LE(Math.floor(event.stride_length * 100), offset);
      offset += 2;
    }

    if (this.rscFlags.isSet('total_distance')) {
      buffer.writeUInt32LE(Math.floor(event.total_distance * 10), offset);
      offset += 4;
    }

    if (this._updateValueCallback) {
      this._updateValueCallback(buffer.subarray(0, offset));
    }

    return this.RESULT_SUCCESS;
  }
}
