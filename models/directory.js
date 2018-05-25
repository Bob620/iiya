const fs = require('fs'),
      { promisify } = require('util'),
      fsAccess = promisify(fs.access);

const constants = require('../util/constants'),
      { get, s, del, set, h } = require('../util/datastore'),
      Item = require('./item'),
      Propagator = require('../util/propagator');

class Directory {
	constructor(id) {
		this.data = {
			id,
			prefix: `${constants.database.BASE}:${constants.database.directories.BASE}:${id}`
		}
	}

	async getId() {
		return this.data.id;
	}

	async getLocation() {
		return await get(`${this.data.prefix}:${constants.database.directories.LOCATION}`);
	}

	async getItemIds() {
		return await s.members(`${this.data.prefix}:${constants.database.directories.ITEMS}`);
	}

	async getItems() {
		let items = new Map();
		for (const itemId of await this.getItemIds())
			items.set(itemId, new Item(itemId))
		return items;
	}

	async isReadable() {
		await !!get(`${this.data.prefix}:${constants.database.directories.READABLE}`);
	}

	async setReadable() {
		await set(`${this.data.prefix}:${constants.database.directories.READABLE}`, true);
	}

	async setUnreadable() {
		await set(`${this.data.prefix}:${constants.database.directories.READABLE}`, false);
	}

	async findLocationProblems() {
		return new Promise(async (resolve, reject) => {
			// Determine if this song still exists
			const location = await this.getLocation();

			fsAccess(location, fs.constants.F_OK).then(() => {
				fsAccess(location, fs.constants.R_OK).then(async () => {
					await this.setReadable();
					resolve(constants.general.SUCCESS);
				}).catch(async () => {
					await this.setUnreadable();
					reject(constants.general.NEEDSFIX);
				});
			}).catch(async () => {
				await this.delete();
				reject(constants.general.DELETED);
			});
		});
	}

	async scan() {
		if (await this.isReadable()) {
			// Determine if each song exists
			for (const item of await this.getItems())
				await item.fix();

		} else {
			await this.fix();
		}
	}

	async fix() {
		try {
			// Determine if location exists
			await this.findLocationProblems();

			// Determine if each song exists
			for (const item of await this.getItems())
				await item.fix();
		} catch(err) {
			switch(err) {
				case constants.general.NEEDSFIX:
					Propagator.emitItemUpdate(await this.getId(), constants.events.FIXSELF);
					break;
				case constants.general.DELETED:
					break;
				default:
					Propagator.emitError(err);
					break;
			}
		}
	}

	async delete() {
		try {
			await del(`${this.data.prefix}:${constants.database.directories.LOCATION}`);
			await del(`${this.data.prefix}:${constants.database.directories.READABLE}`);
			for (const itemId of await this.getItemIds())
				await s.del(`${this.data.prefix}:${constants.database.directories.ITEMS}`, itemId);

			await h.del(`${constants.database.BASE}:${constants.database.directories.BASE}`, await this.getId());
			Propagator.emitDirectoryUpdate(await this.getId(), constants.events.DELETEDSELF);
		} catch(err) {
			Propagator.emitError(err);
		}
	}
}

module.exports = Directory;