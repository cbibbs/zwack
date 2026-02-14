// Doc: https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.fitness_machine.xml
// NOTE: This is an alternative/unused FTMS service. The main one is fitness-machine-service.js
import bleno from '@abandonware/bleno';
import TreadmillDataCharacteristic from './treadmill-data-characteristic.js';

export default class FTMSService extends bleno.PrimaryService {

  constructor() {
    const treadmillData = new TreadmillDataCharacteristic();
    super({
      uuid: '1826',
      characteristics: [
        treadmillData
      ]
    });

    this.treadmillData = treadmillData;
  }

  notify(event) {
    this.treadmillData.notify(event);
    return this.RESULT_SUCCESS;
  }
}