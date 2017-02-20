const path = require('path');
const _ = require('lodash');

const db = require('../db');
const utils = require('../utils');
const checker = require('../checker');

/************************************
 ** SERVICE:      productController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/20/2017, 9:20:04 PM
 *************************************/

exports = module.exports = {
	COLLECTION: "product",
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
				checker.must('name', item.name, String);
				checker.option('des', item.des, String);
				checker.must('category_id', item.category_id, db.Uuid);
				checker.must('money', item.money, Number);
				checker.must('money0', item.money0, Number);
				checker.must('special', item.special, Boolean);
				checker.must('status', item.status, Number);
				checker.must('position', item.position, Number);
				checker.must('quantity', item.quantity, Number);
				checker.must('quantity0', item.quantity0, Number);
				checker.must('size', item.size, String);
				checker.must('sizes', item.sizes, Array);
				for (sizes of item.sizes) {
					checker.must('name', sizes.name, String);
					checker.must('quantity', sizes.quantity, Number);
					checker.must('quantity0', sizes.quantity0, Number);
				}
				checker.must('images', item.images, Array);
				checker.must('created_at', item.created_at, Date);
				item.updated_at = new Date();

				break;
			case exports.VALIDATE.UPDATE:
				checker.must('_id', item._id, db.Uuid);
				checker.option('name', item.name, String);
				checker.option('des', item.des, String);
				checker.option('category_id', item.category_id, db.Uuid);
				checker.option('money', item.money, Number);
				checker.option('money0', item.money0, Number);
				checker.option('special', item.special, Boolean);
				checker.option('status', item.status, Number);
				checker.option('position', item.position, Number);
				checker.option('quantity', item.quantity, Number);
				checker.option('quantity0', item.quantity0, Number);
				checker.option('size', item.size, String);
				checker.option('sizes', item.sizes, Object, (sizes) => {
					for (sizes of item.sizes) {
						checker.option('name', sizes.name, String);
						checker.option('quantity', sizes.quantity, Number);
						checker.option('quantity0', sizes.quantity0, Number);
					}
				});
				checker.option('images', item.images, Array);
				item.updated_at = new Date();

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
				const oldItem = await dbo.get(item._id, dbo.isnew ? db.DONE : db.FAIL);
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