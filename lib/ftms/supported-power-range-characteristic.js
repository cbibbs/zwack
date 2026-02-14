// Main Code is from FortiusANT project and modified to suit Zwack
// https://github.com/WouterJD/FortiusANT/tree/master/node
import Debug from 'debug';
import bleno from '@abandonware/bleno';
import { inspect } from 'util';

const debugFTMS = Debug('ftms');

const CharacteristicUserDescription = '2901';
const SupportedPowerRange = '2AD8';

export default class SupportedPowerRangeCharacteristic extends bleno.Characteristic {
  constructor() {
    debugFTMS('[SupportedPowerRangeCharacteristic] constructor');
    super({
      uuid: SupportedPowerRange,
      properties: ['read'],
      descriptors: [
        new bleno.Descriptor({
          uuid: CharacteristicUserDescription,
          value: 'Supported Power Range'
        })
      ],
    });
  }

  onReadRequest(offset, callback) {
    const buffer = Buffer.alloc(6);
    let at = 0;

    const minimumPower = 0;
    buffer.writeInt16LE(minimumPower, at);
    at += 2;

    const maximumPower = 1000;
    buffer.writeInt16LE(maximumPower, at);
    at += 2;

    const minimumIncrement = 1;
    buffer.writeUInt16LE(minimumIncrement, at);
    at += 2;

    debugFTMS('[' + SupportedPowerRange + '] onReadRequest - ' + inspect(buffer));
    debugFTMS('[' + SupportedPowerRange + '] Min: ' + minimumPower + 'W, Max: ' + maximumPower + 'W, Inc: ' + minimumIncrement + 'W');
    callback(this.RESULT_SUCCESS, buffer);
  }
}
