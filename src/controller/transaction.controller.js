const _ = require('lodash');

const utils = require('../utils');
const db = require('../db');
const bodyHandler = require('../body.handler');
const transactionService = require('../service/transaction.service');

/************************************
 ** CONTROLLER:   transactionController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/20/2017, 9:20:04 PM
 *************************************/

app.get('/transaction', async(req, res, next) => {
	try {
		let where = {};
		const rs = await transactionService.find({
			$where: where
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

app.get('/transaction/:_id', async(req, res, next) => {
	try {
		const key = db.uuid(req.params._id);
		const rs = await transactionService.get(key);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});



app.put('/transaction/:_id', bodyHandler.fileHandler({
	images: {
		saveTo: "`assets/images`",
		maxCount: 1,
		isFull: false,
		returnPath: "`/images/${filename}`",
		limits: 10000,
		resize: global.appconfig.app.imageResize.product
	}
}), async(req, res, next) => {
	try {
		req.body._id = db.uuid(req.params._id);
		const rs = await transactionService.update(req.body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

app.delete('/transaction/:_id', async(req, res, next) => {
	try {
		const key = db.uuid(req.params._id);
		const rs = await transactionService.delete(key);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});