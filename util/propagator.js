const EventEmitter = require('events');

const constants = require('./constants');

class Propagator extends EventEmitter {
	constructor() {
		super();
	}

	emitError(...error) {
		this.emit(constants.events.ERROR, ...error);
	}

	emitUserInfo(event, ...info) {
		this.emit(constants.events.USERINFO, event, ...info);
	}

	emitItemUpdate(itemId, event, ...info) {
		this.emit(constants.events.ITEMUPDATE, itemId, event, ...info);
	}

	emitDirectoryUpdate(directoryId, event, ...info) {
		this.emit(constants.events.DIRECTORYUPDATE, directoryId, event, ...info);
	}

	emitLibraryUpdate(libraryId, event, ...info) {
		this.emit(constants.events.LIBRARYUPDATE, libraryId, event, ...info);
	}
}

module.exports = new Propagator();