const redisClient = require('redis').createClient;

class QueueConnection extends Array {
    constructor(){
        super()
    }
    push(item){
        item.autoclose(true);
        super.push(item);
    }
    shift() {
        if(super.length === 0) return null;
        const item = super.shift();
        item.autoclose(false);
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
    size: () => {
        return queue.length;
    },
    open(isAutoClose) {        
        let rs = queue.shift();
        if(rs) return rs;

        const redis = redisClient(appconfig.cache.redis.port, appconfig.cache.redis.host, appconfig.cache.redis.opts);
        rs = {
            autoclose: (isAutoClose) => {
                if(!isAutoClose) {
                    clearTimeout(rs.tm);
                } else {
                    rs.tm = setTimeout(async () => {
                        await queue.remove(rs);
                    }, QueueConnection.timeout)
                }
            },
            clear() {
                return new Promise((resolve, reject) => {
                    redis.flushdb(async (err, data) => {
                        if(isAutoClose) await rs.close();
                        if(err) return reject(err);
                        resolve();
                    });
                });
            },            
            get(key){
                return new Promise((resolve, reject) => {
                    redis.get(key.toString(), async (err, data) => {
                        if(isAutoClose) await rs.close();
                        if(err) return reject(err);
                        resolve(data ? JSON.parse(data) : null);
                    }) 
                });
            },
            set(key, value, lifetime=0){
                return new Promise((resolve, reject) => {
                    redis.set(key.toString(), JSON.stringify(value), async (err, data) => {
                        if(isAutoClose) await rs.close();
                        if(err) return reject(err);                        
                        rs.touch(key.toString(), lifetime).then(() => {
                            resolve(value);
                        }).catch(reject);                  
                    });            
                });
            },
            del(key){
                return new Promise((resolve, reject) => {
                    redis.del(key.toString(), async (err) => {
                        if(isAutoClose) await rs.close();
                        if(err) return reject(err);
                        resolve()
                    }) 
                });
            },
            touch(key, lifetime=300){
                return new Promise((resolve, reject) => {
                    lifetime = +lifetime;
                    if(lifetime <= 0) return resolve();
                    if(lifetime > 1800) {
                        redis.expireat(key.toString(), Math.round(+new Date()/1000)+lifetime, async (err) => {
                            if(isAutoClose) await rs.close();
                            if(err) return reject(err);
                            resolve(); 
                        });
                    }else {
                        redis.expire(key.toString(), lifetime, async (err) => {
                            if(isAutoClose) await rs.close();
                            if(err) return reject(err);
                            resolve(); 
                        });
                    }
                });
            },
            close(isRemoveInQueue=true){    
                if(isRemoveInQueue) {
                    queue.push(rs);
                }else {
                    redis.quit();
                    return Promise.resolve();
                }
            }
        };
        return rs;
    }    
}