import Debug from 'debug';
import bleno from '@abandonware/bleno';

const debugFTMS = Debug('ftms');

// Spec
// https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.treadmill_data.xml

export default class TreadmillDataCharacteristic extends bleno.Characteristic {

	constructor() {
		super({
			uuid: '2ACD',
			properties: ['notify'],
			descriptors: [
				new bleno.Descriptor({
					uuid: '2901',
					value: 'Treadmill Data'
				}),
				new bleno.Descriptor({
					uuid: '2902',
					value: Buffer.alloc(2)
				}),
				new bleno.Descriptor({
					uuid: '2903',
					value: Buffer.alloc(2)
				})
			]
		});
		this._updateValueCallback = null;
	}

	onSubscribe(maxValueSize, updateValueCallback) {
		debugFTMS('[TreadmillDataCharacteristic] client subscribed');
		this._updateValueCallback = updateValueCallback;
		return this.RESULT_SUCCESS;
	}

	onUnsubscribe() {
		debugFTMS('[TreadmillDataCharacteristic] client unsubscribed');
		this._updateValueCallback = null;
		return this.RESULT_UNLIKELY_ERROR;
	}

	notify(event) {
		if (!('watts' in event) && !('rev_count' in event)) {
			return this.RESULT_SUCCESS;
		}

		const buffer = Buffer.alloc(8);

		// flags
		const flagEnum = {
			more_data: 0x01,
			avg_speed: 0x02,
			total_distance: 0x04,
			inclination: 0x08,
			elevation: 0x10,
			pace: 0x20,
			avg_pace: 0x40,
			expended_energy: 0x80,
			heart_rate: 0x100,
			elapsed_time: 0x200,
			remaining_time: 0x400,
			force: 0x800
		};

		let flags = 0;
		for (const property in event) {
			if (Object.prototype.hasOwnProperty.call(flagEnum, property)) {
				flags = flags | flagEnum[property];
			}
		}
		buffer.writeUInt16LE(flags, 0);

		if ('watts' in event) {
			const watts = event.watts;
			debugFTMS("power: " + watts);
			buffer.writeInt16LE(watts, 2);
		}

		if ('rev_count' in event) {
			event.rev_count = event.rev_count % 65536;
			buffer.writeUInt16LE(event.rev_count, 4);

			const now = Date.now();
			const now_1024 = Math.floor(now * 1e3 / 1024);
			const event_time = now_1024 % 65536;
			debugFTMS("event time: " + event_time);
			buffer.writeUInt16LE(event_time, 6);
		}

		if (this._updateValueCallback) {
			this._updateValueCallback(buffer);
		}
		return this.RESULT_SUCCESS;
	}
}