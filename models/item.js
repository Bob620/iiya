const fs = require('fs'),
      { promisify } = require('util'),
      fsAccess = promisify(fs.access);

const constants = require('../util/constants'),
      { set, get, h, del } = require('../util/datastore'),
      Propagator = require('../util/propagator');

class Item {
	constructor(id) {
		this.data = {
			id,
			prefix: `${constants.database.BASE}:${constants.database.items.BASE}:${id}`
		}
	}

	async getId() {
		return this.data.id;
	}

	async getLocation() {
		return await get(`${this.data.prefix}:${constants.database.items.LOCATION}`);
	}

	async setName(name) {
		await set(`${this.data.prefix}:${constants.database.items.NAME}`, name);
	}

	async getName() {
		return await get(`${this.data.prefix}:${constants.database.items.NAME}`);
	}

	async getInfo() {
		return await h.getall(`${this.data.prefix}:${constants.database.items.INFO}`);
	}

	async isReadable() {
		await !!get(`${this.data.prefix}:${constants.database.directories.READABLE}`);
	}

	async setReadable() {
		await set(`${this.data.prefix}:${constants.database.items.READABLE}`, true);
	}

	async setUnreadable() {
		await set(`${this.data.prefix}:${constants.database.items.READABLE}`, false);
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

	async fix() {
		try {
			await this.findLocationProblems();
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
			await del(`${this.data.prefix}:${constants.database.items.LOCATION}`);
			await del(`${this.data.prefix}:${constants.database.items.NAME}`);
			await del(`${this.data.prefix}:${constants.database.items.READABLE}`);
			for (const info of Object.keys(await this.getInfo()))
				await h.del(`${this.data.prefix}:${constants.database.items.INFO}`, info);

			await h.del(`${constants.database.BASE}:${constants.database.items.BASE}`, await this.getId());
			Propagator.emitItemUpdate(await this.getId(), constants.events.DELETEDSELF);
		} catch(err) {
			Propagator.emitError(err);
		}
	}
}


module.exports = Item;