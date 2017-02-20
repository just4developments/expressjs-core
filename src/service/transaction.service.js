const path = require('path');
const _ = require('lodash');

const db = require('../db');
const utils = require('../utils');
const checker = require('../checker');

/************************************
 ** SERVICE:      transactionController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/20/2017, 9:20:04 PM
 *************************************/

exports = module.exports = {
	COLLECTION: "transaction",
	VALIDATE: {
		INSERT: 0,
		UPDATE: 1,
		GET: 2,
		DELETE: 3,
		FIND: 4,
	},
	validate(item, action) {
		switch (action) {
			case exports.VALIDATE.INSERT:
				item._id = db.uuid();
				checker.must('images', item.images, String);

				break;
			case exports.VALIDATE.UPDATE:
				checker.must('_id', item._id, db.Uuid);
				checker.option('images', item.images, String);

				break;
			case exports.VALIDATE.GET:
				checker.must('_id', item, db.Uuid);

				break;
			case exports.VALIDATE.DELETE:
				checker.must('_id', item, db.Uuid);

				break;
			case exports.VALIDATE.FIND:


				break;
		}
		return item;
	},

	async find(fil = {}, dbo) {
		fil = exports.validate(fil, exports.VALIDATE.FIND);

		dbo = await db.open(exports.COLLECTION, dbo);
		const rs = await dbo.find(fil, dbo.isnew ? db.DONE : db.FAIL);
		return rs;
	},

	async get(_id, dbo) {
		_id = exports.validate(_id, exports.VALIDATE.GET);

		dbo = await db.open(exports.COLLECTION, dbo);
		const rs = await dbo.get(_id, dbo.isnew ? db.DONE : db.FAIL);
		return rs;
	},

	async insert(item, dbo) {
		try {
			item = exports.validate(item, exports.VALIDATE.INSERT);

			dbo = await db.open(exports.COLLECTION, dbo);
			const rs = await dbo.insert(item, dbo.isnew ? db.DONE : db.FAIL);
			return rs;
		} catch (err) {
			utils.deleteFiles(utils.getAbsoluteUpload(item.images, `assets/images`), global.appconfig.app.imageResize.product);
			throw err;
		}
	},

	async update(item, dbo) {
		try {
			item = exports.validate(item, exports.VALIDATE.UPDATE);

			dbo = await db.open(exports.COLLECTION, dbo);
			try {
				const oldItem = await dbo.get(item._id);
				const rs = await dbo.update(item);
				utils.deleteFiles(utils.getAbsoluteUpload(oldItem.images, `assets/images`), global.appconfig.app.imageResize.product);
				return rs;
			} finally {
				if (dbo.isnew) await dbo.close();
			}
		} catch (err) {
			utils.deleteFiles(utils.getAbsoluteUpload(item.images, `assets/images`), global.appconfig.app.imageResize.product);
			throw err;
		}
	},

	async delete(_id, dbo) {
		_id = exports.validate(_id, exports.VALIDATE.DELETE);

		dbo = await db.open(exports.COLLECTION, dbo);
		try {
			const item = await dbo.get(_id);
			const rs = await dbo.delete(_id);
			utils.deleteFiles(utils.getAbsoluteUpload(item.images, `assets/images`), global.appconfig.app.imageResize.product);
			return rs;
		} finally {
			if (dbo.isnew) await dbo.close();
		}
	}

}