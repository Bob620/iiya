const constants = require('../util/constants'),
      { set, get, s } = require('../util/datastore'),
      Directory = require('./directory'),
      Propagator = require('../util/propagator');

class Library {
	constructor(type, id) {
		this.data = {
			id,
			type,
			prefix: `${constants.database.BASE}:${constants.database.libraries.BASE}:${id}`
		}
	}

	async setName(name) {
		await set(`${this.data.prefix}:${constants.database.libraries.NAME}`, name);
	}

	async getName() {
		return await get(`${this.data.prefix}:${constants.database.libraries.NAME}`);
 	}

	async getId() {
		return this.data.id;
	}

	async getType() {
		return this.data.type;
	}

	async getDirectories() {
		let directories = new Map();
		for (const directoryId of await s.members(`${this.data.prefix}:${constants.database.libraries.DIRECTORIES}`))
			directories.set(directoryId, new Directory(directoryId))
		return directories;
	}

	async addDirectory(directory) {
		await s.add(`${this.data.prefix}:${constants.database.libraries.DIRECTORIES}`, await directory.getId());
		Propagator.emitLibraryUpdate(await this.getId(), constants.events.ADDEDDIRECTORY, await directory.getId());
		await directory.scan();
	}

	async removeDirectory(directoryId) {
		await s.rem(`${this.data.prefix}:${constants.database.libraries.DIRECTORIES}`, await directoryId);
		Propagator.emitLibraryUpdate(await this.getId(), constants.events.REMOVEDDIRECTORY, directoryId);
	}

	async getItems() {
		let items = new Map();
		for (const directory of await this.getDirectories())
			for (const item of await directory.getItems())
				items.set(await item.getId(), item)
		return items;
	}

	async scan() {
		// Have each directory scan itself
		for (const directory of await this.getDirectories())
			await directory.scan();
	}

	async fix() {
		// Have each directory fix itself
		for (const directory of await this.getDirectories())
			await directory.fix();
	}
}

module.exports = Library;