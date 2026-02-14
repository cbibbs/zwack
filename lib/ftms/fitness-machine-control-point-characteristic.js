// Main Code is from FortiusANT project and modified to suit Zwack
// https://github.com/WouterJD/FortiusANT/tree/master/node
import Debug from 'debug';
import bleno from '@abandonware/bleno';
import { inspect } from 'util';

const debugFTMS = Debug('ftms');

const RequestControl = 0x00;
const ResetCode = 0x01;
const SetTargetPower = 0x05;
const StartOrResume = 0x07;
const StopOrPause = 0x08;
const SetIndoorBikeSimulation = 0x11;
const ResponseCode = 0x80;

const Success = 0x01;
const OpCodeNotSupported = 0x02;
const OperationFailed = 0x04;
const ControlNotPermitted = 0x05;

const CharacteristicUserDescription = '2901';
const FitnessMachineControlPoint = '2AD9';

export default class FitnessMachineControlPointCharacteristic extends bleno.Characteristic {
  constructor(messages, fmsc) {
    debugFTMS('[' + FitnessMachineControlPoint + '][FitnessMachineControlPointCharacteristic] constructor');
    super({
      uuid: FitnessMachineControlPoint,
      properties: ['write', 'indicate'],
      descriptors: [
        new bleno.Descriptor({
          uuid: CharacteristicUserDescription,
          value: 'Fitness Machine Control Point'
        })
      ]
    });

    this.messages = messages;
    this.fmsc = fmsc;
    this.indicate = null;

    this.hasControl = false;
    this.isStarted = false;
  }

  result(opcode, result) {
    const buffer = Buffer.alloc(3);
    buffer.writeUInt8(ResponseCode);
    buffer.writeUInt8(opcode, 1);
    buffer.writeUInt8(result, 2);
    debugFTMS('[' + FitnessMachineControlPoint + '][FitnessMachineControlPointCharacteristic] result response' + inspect(buffer));
    return buffer;
  }

  onSubscribe(maxValueSize, updateValueCallback) {
    debugFTMS('[' + FitnessMachineControlPoint + '][FitnessMachineControlPointCharacteristic] onSubscribe');
    this.indicate = updateValueCallback;
    return this.RESULT_SUCCESS;
  }

  onUnsubscribe() {
    debugFTMS('[' + FitnessMachineControlPoint + '][FitnessMachineControlPointCharacteristic] onUnsubscribe');
    this.indicate = null;
    return this.RESULT_UNLIKELY_ERROR;
  }

  onIndicate() {
    debugFTMS('[' + FitnessMachineControlPoint + '][FitnessMachineControlPointCharacteristic] onIndicate');
  }

  onWriteRequest(data, offset, withoutResponse, callback) {
    const code = data.readUInt8(0);

    callback(this.RESULT_SUCCESS);

    let response = null;

    switch (code) {
      case RequestControl:
        debugFTMS('[' + FitnessMachineControlPoint + '] onWriteRequest: RequestControl - Given control');
        this.hasControl = true;
        response = this.result(code, Success);
        break;

      case ResetCode:
        debugFTMS('[' + FitnessMachineControlPoint + '] onWriteRequest: Reset');
        if (this.hasControl) {
          debugFTMS('Control reset');
          this.hasControl = false;
          response = this.result(code, Success);
          this.fmsc.notifyReset();
        } else {
          debugFTMS('Error: no control');
          response = this.result(code, ControlNotPermitted);
        }
        break;

      case SetTargetPower:
        if (this.hasControl) {
          const targetPower = data.readInt16LE(1);
          debugFTMS('[' + FitnessMachineControlPoint + '] Set target power(W): ' + targetPower + 'w [' + inspect(data) + ']');
          response = this.result(code, Success);
          this.fmsc.notifySetTargetPower(targetPower);
        } else {
          debugFTMS('Error: no control');
          response = this.result(code, ControlNotPermitted);
        }
        break;

      case StartOrResume:
        debugFTMS('[' + FitnessMachineControlPoint + '] onWriteRequest: Start or Resume');
        if (this.hasControl) {
          if (this.isStarted) {
            debugFTMS('Error: already started/resumed');
            response = this.result(code, OperationFailed);
          } else {
            debugFTMS('Started/resumed');
            this.isStarted = true;
            response = this.result(code, Success);
            this.fmsc.notifyStartOrResume();
          }
        } else {
          debugFTMS('Error: No Control');
          response = this.result(code, ControlNotPermitted);
        }
        break;

      case StopOrPause:
        debugFTMS('[' + FitnessMachineControlPoint + '] onWriteRequest: Stop or Pause');
        if (this.hasControl) {
          if (this.isStarted) {
            debugFTMS('Stopped');
            this.isStarted = false;
            response = this.result(code, Success);
            this.fmsc.notifyStopOrPause();
          } else {
            debugFTMS('Error: Already Stopped or Paused');
            response = this.result(code, OperationFailed);
          }
        } else {
          debugFTMS('Error: No Control');
          response = this.result(code, ControlNotPermitted);
        }
        break;

      case SetIndoorBikeSimulation: {
        debugFTMS('[' + FitnessMachineControlPoint + '] onWriteRequest: Set indoor bike simulation');
        if (this.hasControl) {
          const windSpeed = data.readInt16LE(1) * 0.001;
          const grade = data.readInt16LE(3) * 0.01;
          const crr = data.readUInt8(5) * 0.0001;
          const cw = data.readUInt8(6) * 0.01;

          debugFTMS('Wind speed(mps): ' + windSpeed);
          debugFTMS('Grade(%): ' + grade);
          debugFTMS('crr: ' + crr);
          debugFTMS('cw(Kg/m): ' + cw);

          response = this.result(code, Success);
          this.fmsc.notifySetIndoorBikeSimulation(windSpeed, grade, crr, cw);
        } else {
          debugFTMS('Error: no control');
          response = this.result(code, ControlNotPermitted);
        }
        break;
      }

      default: {
        debugFTMS('Unsupported OPCODE:' + code);
        const d = Buffer.from(data);
        debugFTMS('Data: ' + d);
        response = this.result(code, OpCodeNotSupported);
        break;
      }
    }

    this.indicate(response);
  }
}
