const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');

/************************************
 ** DATABASE ADAPTER FOR MONGODB
 ** Installation
 ** `npm install mongodb --save`
 *************************************/

class QueueConnection extends Array {
    constructor(){
        super()
    }
    push(item){
        item.autoclose(true);
        super.push(item);
    }
    shift(collection) {
        if(super.length === 0) return null;
        const item = super.shift();
        item.autoclose(false);
        item.collection = collection;
        item.isnew = true;
        return item;
    }
    async remove(item){
        await item.close(false);
        super.splice(super.indexOf(item), 1);
    }
}
QueueConnection.timeout = 5000;

const queue = new QueueConnection();

exports = module.exports = {
    NONE: 0,
    DONE: 2,
    SUCCESS: 1,
    FAIL: -1,
    Uuid: ObjectID,
    size: () => {
        return queue.length;
    },
    uuid(id) {
        if(id instanceof Array){
            for(let i in id){
                id[i] = exports.uuid(id[i]);
            }
            return id;
        }
        if(!id) return new ObjectID();
        return typeof id === 'string' ? ObjectID(id) : id;
    },
    url: global.appconfig.db.url,    
    async open(collection, dbo) {
        if(dbo) {
            dbo.collection = collection;
            if(dbo.isnew) dbo.isnew = false;
            return dbo;
        }        
        
        dbo = queue.shift(collection);
        if(dbo) return dbo;

        const func = {
            isnew: true,
            db: await MongoClient.connect(exports.url),
            collection: collection,
            autoclose: (isAutoClose) => {
                if(!isAutoClose) {
                    clearTimeout(func.tm);
                } else {
                    func.tm = setTimeout(async () => {
                        await queue.remove(func);
                    }, QueueConnection.timeout)
                }
            },
            change(collection){
                func.collection = collection;
                return func;
            },
            async count(where){
                const closeMode = opts.close || opts;
                const collection = func.db.collection(opts.collection || func.collection);
                try {
                    const rs = await collection.count(where);
                    if (closeMode === exports.SUCCESS) await func.close();
                    return rs;
                } catch (e) {
                    if (closeMode === exports.FAIL) await func.close();
                    throw e;
                } finally {
                    if (closeMode === exports.DONE) await func.close();
                }
            },
            async aggregate({
                $where,
                $fields,
                $sort,
                $page = 1,
                $recordsPerPage = 20
            }, opts = exports.NONE) {
                const closeMode = opts.close || opts;
                const collection = func.db.collection(opts.collection || func.collection);
                let aggregate = [];
                if ($where) aggregate.splice(0, 0, {
                    $match: $where
                });
                if ($sort) aggregate.push({
                    $sort: $sort
                });
                if ($page) aggregate.push({
                    $skip: ($page - 1) * $recordsPerPage
                });
                if ($recordsPerPage) aggregate.push({
                    $limit: $recordsPerPage
                });
                const query = collection.aggregate(aggregate);
                try {
                    const rs = await query.toArray();
                    if (closeMode === exports.SUCCESS) await func.close();
                    return rs;
                } catch (e) {
                    if (closeMode === exports.FAIL) await func.close();
                    throw e;
                } finally {
                    if (closeMode === exports.DONE) await func.close();
                }
            },
            async find({
                $where,
                $fields,
                $sort,
                $page = 1,
                $recordsPerPage = 20
            }, opts = exports.NONE) {
                const closeMode = opts.close || opts;
                const collection = func.db.collection(opts.collection || func.collection);
                let query = collection.find($where, $fields);
                if ($sort) query = query.sort($sort);
                if ($page) query = query.skip(($page - 1) * $recordsPerPage);
                if ($recordsPerPage) query = query.limit($recordsPerPage);
                try {
                    const rs = await query.toArray();
                    if (closeMode === exports.SUCCESS) await func.close();
                    return rs;
                } catch (e) {
                    if (closeMode === exports.FAIL) await func.close();
                    throw e;
                } finally {
                    if (closeMode === exports.DONE) await func.close();
                }
            },
            async get(fil, opts = exports.NONE) {
                const closeMode = opts.close || opts;
                const collection = func.db.collection(opts.collection || func.collection);
                try {
                    if(!_.isPlainObject(fil)) fil = { $where: { _id: exports.uuid(fil) } };
                    else if(!fil.$where) fil = { $where: fil };
                    const rs = await collection.findOne(fil.$where, fil.$fields);
                    if (closeMode === exports.SUCCESS) await func.close();
                    return rs;
                } catch (e) {
                    if (closeMode === exports.FAIL) await func.close();
                    throw e;
                } finally {
                    if (closeMode === exports.DONE) await func.close();
                }
            },
            async insert(obj, opts = exports.NONE) {
                const closeMode = opts.close || opts;
                const collection = func.db.collection(opts.collection || func.collection);
                try {
                    const rs = await collection.insertOne(obj);
                    if (closeMode === exports.SUCCESS) await func.close();
                    return obj instanceof Array ? rs.ops : rs.ops.length === 1 ? rs.ops[0] : null;
                } catch (e) {
                    if (closeMode === exports.FAIL) await func.close();
                    throw e;
                } finally {
                    if (closeMode === exports.DONE) await func.close();
                }
            },
            async manual(fcManual, opts = exports.NONE){
                const closeMode = opts.close || opts;
                const collection = func.db.collection(opts.collection || func.collection);
                try {
                    const rs = await fcManual(collection, func);
                    if (closeMode === exports.SUCCESS) await func.close();
                    return rs;
                } catch (e) {
                    if (closeMode === exports.FAIL) await func.close();
                    throw e;
                } finally {
                    if (closeMode === exports.DONE) await func.close();
                }
            },
            async update(obj0, opts = exports.NONE) {
                const obj = _.cloneDeep(obj0);
                delete obj._id;
                const closeMode = opts.close || opts;
                let where;
                if(!_.isPlainObject(obj0._id)) where = {_id: exports.uuid(obj0._id)};
                else where = obj0._id;
                const collection = func.db.collection(opts.collection || func.collection);
                try {
                    const rs = await collection.updateOne(where, {
                        $set: obj
                    });
                    if (closeMode === exports.SUCCESS) await func.close();
                    return rs;
                } catch (e) {
                    if (closeMode === exports.FAIL) await func.close();
                    throw e;
                } finally {
                    if (closeMode === exports.DONE) await func.close();
                }
            },
            async delete(fil, opts = exports.NONE) {
                const closeMode = opts.close || opts;
                const collection = func.db.collection(opts.collection || func.collection);
                try {
                    if(!_.isPlainObject(fil)) fil = { _id: exports.uuid(fil) };
                    const rs = await collection.deleteOne(fil);
                    if (closeMode === exports.SUCCESS) await func.close();
                    return rs;
                } catch (e) {
                    if (closeMode === exports.FAIL) await func.close();
                    throw e;
                } finally {
                    if (closeMode === exports.DONE) await func.close();
                }
            },
            async close(isRemoveInQueue=true) {
                if(isRemoveInQueue) {
                    queue.push(func);
                }else if (func.db) {
                    await func.db.close();
                    delete func.db;
                }
                await Promise.all([]);
            }
        };
        return func;
    }
}

// const rs = await dbo.manual(async(collection, dbo) => {
//     return await collection.findOne({
//         _id: auth.projectId,
//         'accounts._id': auth.accountId
//     }, {
//         'accounts.$': 1,
//     });
// }, dboType);