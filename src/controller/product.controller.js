const _ = require('lodash');

const utils = require('../utils');
const db = require('../db');
const bodyHandler = require('../body.handler');
const productService = require('../service/product.service');

/************************************
 ** CONTROLLER:   productController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/20/2017, 9:20:04 PM
 *************************************/

app.get('/product', async(req, res, next) => {
	try {
		let where = {};
		let fields = {};
    	let recordsPerPage = 100;
		if(!req.headers.isnana) where.status = 1;
		if(!req.headers.isnana) {
			fields.money0 = 0;
			fields.quantity0 = 0;
		}
		if(req.query.recordsPerPage) recordsPerPage = +req.query.recordsPerPage; 
		let type = req.query.type || 'newest';
		if(req.query.categoryId) where.category_id=req.query.categoryId;
		if(type === 'hot'){
			where.special = true;
		}
		const rs = await productService.find({
			$recordsPerPage: recordsPerPage,
			$where: where,
			$sort: { position: 1 },
			$field: fields
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

app.get('/product/:_id', async(req, res, next) => {
	try {
		const key = db.uuid(req.params._id);
		const rs = await productService.get(key);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

app.post('/upload', bodyHandler.fileHandler({
	images: {
		saveTo: "assets/images",
		maxCount: 5,
		isFull: false,
		returnPath: "`/images/${filename}`",
		limits: 10000,
		resize: global.appconfig.app.imageResize.product
	}
}), async(req, res, next) => {
	try {
		res.send(req.files);
	} catch (err) {
		next(err);
	}
});

app.post('/product', bodyHandler.jsonHandler({
	name: String,
	des: String,
	category_id: db.Uuid,
	money: Number,
	money0: Number,
	special: Boolean,
	status: Number,
	position: Number,
	created_date: Date,
	quantity: 0,
	quantity0: 0,
	size: String,
	sizes: Array,
	images: Array
}), async(req, res, next) => {
	try {
		if(req.body.sizes) {
			body.sizes = JSON.parse(req.body.sizes);
			for(var i in body.sizes){
				req.body.quantity += body.sizes[i].quantity;
				req.body.quantity0 += body.sizes[i].quantity0;
			}
		}    
		const rs = await productService.insert(req.body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

app.put('/product/:_id', bodyHandler.jsonHandler({
	name: String,
	des: String,
	category_id: db.Uuid,
	money: Number,
	money0: Number,
	special: Boolean,
	status: Number,
	position: Number,
	created_date: Date,
	quantity: 0,
	quantity0: 0,
	size: String,
	sizes: Array,
	images: Array
}), async(req, res, next) => {
	try {
		req.body._id = db.uuid(req.params._id);
		if(req.body.sizes) {
			body.sizes = JSON.parse(req.body.sizes);
			for(var i in body.sizes){
				req.body.quantity += body.sizes[i].quantity;
				req.body.quantity0 += body.sizes[i].quantity0;
			}
		}    
		const rs = await productService.update(req.body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

app.delete('/product/:_id', async(req, res, next) => {
	try {
		const key = db.uuid(req.params._id);
		const rs = await productService.delete(key);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});