const _ = require('lodash');

const db = require('../db');
const utils = require('../utils');
const checker = require('../checker');

/************************************
 ** SERVICE:      logController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/16/2017, 3:49:05 PM
 *************************************/

exports = module.exports = {
	COLLECTION: "log",
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
				checker.must('project_id', item.project_id, db.Uuid);
				checker.must('account_id', item.account_id, db.Uuid);
				item.created_at = new Date();
				item.updated_at = new Date();

				break;
			case exports.VALIDATE.UPDATE:
				checker.must('_id', item._id, db.Uuid);
				checker.option('project_id', item.project_id, db.Uuid);
				checker.option('account_id', item.account_id, db.Uuid);
				item.updated_at = new Date();

				break;
			case exports.VALIDATE.GET:
				checker.must('_id', item._id, db.Uuid);
				checker.must('project_id', item.project_id, db.Uuid);

				break;
			case exports.VALIDATE.DELETE:
				checker.must('_id', item._id, db.Uuid);
				checker.must('project_id', item.project_id, db.Uuid);

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
		item = exports.validate(item, exports.VALIDATE.INSERT);

		dbo = await db.open(exports.COLLECTION, dbo);
		const rs = await dbo.insert(item, dbo.isnew ? db.DONE : db.FAIL);
		return rs;
	},

	async update(item, dbo) {
		item = exports.validate(item, exports.VALIDATE.UPDATE);
		
		dbo = await db.open(exports.COLLECTION, dbo);
		const rs = await dbo.update(item, dbo.isnew ? db.DONE : db.FAIL);

		return rs;
	},

	async delete(_id, dbo) {
		_id = exports.validate(_id, exports.VALIDATE.DELETE);

		const dboType = dbo ? db.FAIL : db.DONE;
		dbo = await db.open(exports.COLLECTION, dbo);
		const rs = await dbo.delete(_id, dbo.isnew ? db.DONE : db.FAIL);

		return rs;
	}

}