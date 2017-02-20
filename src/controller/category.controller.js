const _ = require('lodash');

const utils = require('../utils');
const db = require('../db');
const bodyHandler = require('../body.handler');
const categoryService = require('../service/category.service');

/************************************
 ** CONTROLLER:   categoryController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/20/2017, 9:20:04 PM
 *************************************/

app.get('/category', async(req, res, next) => {
	try {
		let where = {};
		where.type = +req.query.type || 1;
		const rs = await categoryService.find({
			$where: where,
			$sort: { position: 1 }
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

app.get('/category/:_id', async(req, res, next) => {
	try {
		const key = db.uuid(req.params._id);
		const rs = await categoryService.get(key);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

app.post('/category', bodyHandler.jsonHandler({
	name: String
}), async(req, res, next) => {
	try {
		const rs = await categoryService.insert(req.body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

app.put('/category/:_id', bodyHandler.jsonHandler({
	name: String
}), async(req, res, next) => {
	try {
		req.body._id = db.uuid(req.params._id);
		const rs = await categoryService.update(req.body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

app.delete('/category/:_id', async(req, res, next) => {
	try {
		const key = db.uuid(req.params._id);
		const rs = await categoryService.delete(key);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});