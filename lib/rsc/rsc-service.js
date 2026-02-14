/* Running Speed and Cadence Service
 * Assigned Number: 0x1814
 *
 * Supported Characteristics:
 *  0x2A53 - RSC Measurement
 *  0x2A54 - RSC Feature
 *  0x2A5D - Sensor Location
 *  0x2A55 - SC Control Point
 *
 * Spec: https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.running_speed_and_cadence.xml
 */
import bleno from '@abandonware/bleno';
import RSCMeasurementCharacteristic from './rsc-measurement-characteristic.js';
import StaticReadCharacteristic from '../read-characteristic.js';

export default class RSCService extends bleno.PrimaryService {

  constructor() {
    const rscMeasurement = new RSCMeasurementCharacteristic();
    super({
      uuid: '1814',
      characteristics: [
        rscMeasurement,

        // 16 Bit Mandatory Field
        // 0x01 - Instantaneous Stride Length Measurement Supported
        // 0x02 - Total Distance Measurement Supported
        // 0x04 - Walking or Running Status Supported
        // 0x08 - Calibration Procedure Supported
        // 0x10 - Multiple Sensor Locations Supported
        new StaticReadCharacteristic('2A54', 'RSC Feature', [0x00, 0, 0, 0]),

        // Sensor location (0 = Other)
        new StaticReadCharacteristic('2A5D', 'Sensor Location', [0])
      ]
    });

    this.rscMeasurement = rscMeasurement;
  }

  notify(event) {
    this.rscMeasurement.notify(event);
    return this.RESULT_SUCCESS;
  }
}
