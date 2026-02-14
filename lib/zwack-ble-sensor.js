import bleno from '@abandonware/bleno';
import { EventEmitter } from 'events';
import Debug from 'debug';
import minimist from 'minimist';

import DeviceInformationService from './dis/device-information-service.js';
import CyclingPowerService from './cps/cycling-power-service.js';
import RSCService from './rsc/rsc-service.js';
import FitnessMachineService from './ftms/fitness-machine-service.js';

const debugBLE = Debug('ble');
const debugRSC = Debug('rsc');
const debugCSP = Debug('csp');
const debugFTMS = Debug('ftms');

const args = minimist(process.argv.slice(2));

let containsFTMS = false;
let containsRSC = false;
let containsCSP = false;
const servicesOfferedArray = ['180A']; // Device Information Service is offered by default

if (args.variable !== undefined) {
	containsFTMS = args.variable.includes('ftms');
	containsRSC = args.variable.includes('rsc');
	containsCSP = args.variable.includes('csp');

	if (containsFTMS) { servicesOfferedArray.push('1826'); }
	if (containsCSP) { servicesOfferedArray.push('1818'); }
	if (containsRSC) { servicesOfferedArray.push('1814'); }
}

export default class ZwackBLE extends EventEmitter {

	constructor(options) {
		super();

		this.name = options.name || "Zwack";
		process.env['BLENO_DEVICE_NAME'] = this.name;

		this.csp = new CyclingPowerService();
		this.dis = new DeviceInformationService(options);
		this.rsc = new RSCService();
		this.ftms = new FitnessMachineService();

		this.last_timestamp = 0;
		this.rev_count = 0;

		bleno.on('stateChange', (state) => {
			debugBLE(`[${this.name} stateChange] new state: ${state}`);
			this.emit('stateChange', state);

			if (state === 'poweredOn') {
				bleno.startAdvertising(this.name, servicesOfferedArray);
			} else {
				debugBLE('Stopping...');
				bleno.stopAdvertising();
			}
		});

		bleno.on('advertisingStart', (error) => {
			debugBLE(`[${this.name} advertisingStart] ${(error ? 'error ' + error : 'success')}`);
			this.emit('advertisingStart', error);

			if (!error) {
				bleno.setServices([
					this.dis,
					this.csp,
					this.rsc,
					this.ftms
				],
					(error) => {
						debugBLE(`[${this.name} setServices] ${(error ? 'error ' + error : 'success')}`);
					});
			}
		});

		bleno.on('advertisingStartError', () => {
			debugBLE(`[${this.name} advertisingStartError] advertising stopped`);
			this.emit('advertisingStartError');
		});

		bleno.on('advertisingStop', error => {
			debugBLE(`[${this.name} advertisingStop] ${(error ? 'error ' + error : 'success')}`);
			this.emit('advertisingStop');
		});

		bleno.on('servicesSet', error => {
			debugBLE(`[${this.name} servicesSet] ${(error) ? 'error ' + error : 'success'}`);
		});

		bleno.on('accept', (clientAddress) => {
			debugBLE(`[${this.name} accept] Client: ${clientAddress}`);
			this.emit('accept', clientAddress);
			bleno.updateRssi();
		});

		bleno.on('rssiUpdate', (rssi) => {
			debugBLE(`[${this.name} rssiUpdate]: ${rssi}`);
		});
	}

	notifyCSP(event) {
		debugCSP(`[${this.name} notifyCSP] ${JSON.stringify(event)}`);

		this.csp.notify(event);

		if (!('watts' in event) && !('heart_rate' in event)) {
			debugCSP("[" + this.name + " notify] unrecognized event: %j", event);
		} else {
			if ('rev_count' in event) {
				this.rev_count = event.rev_count;
			}
			this.last_timestamp = Date.now();
		}
	}

	notifyFTMS(event) {
		debugFTMS(`[${this.name} notifyFTMS] ${JSON.stringify(event)}`);

		this.ftms.notify(event);

		if (!('watts' in event) && !('heart_rate' in event)) {
			debugFTMS("[" + this.name + " notify] unrecognized event: %j", event);
		} else {
			if ('rev_count' in event) {
				this.rev_count = event.rev_count;
			}
			this.last_timestamp = Date.now();
		}
	}

	notifyRSC(event) {
		debugRSC(`[${this.name} notifyRSC] ${JSON.stringify(event)}`);

		this.rsc.notify(event);

		if (!(('speed' in event) && ('cadence' in event))) {
			debugRSC("[" + this.name + " notifyRSC] unrecognized event: %j", event);
		}
	}

	ping() {
		const TIMEOUT = 4000;

		setTimeout(() => {
			if (Date.now() - this.last_timestamp > TIMEOUT) {
				this.notifyCSP({
					'heart_rate': 0,
					'watts': 0,
					'rev_count': this.rev_count
				});
			}
			this.ping();
		}, TIMEOUT);
	}
}
