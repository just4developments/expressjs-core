const unirest = require('unirest');

exports = module.exports = {
    _(method, url, {query, data, headers, attach, field, type = 'json'}) {
        let Request;
        if(method === 'head') Request = unirest.head(url);
        else if(method === 'delete') Request = unirest.delete(url);
        else if(method === 'get') Request = unirest.get(url);
        else if(method === 'post') Request = unirest.post(url);
        else if(method === 'put') Request = unirest.put(url);
        else throw 'Http method must be not equals null';
        Request = Request.type(type);
        if(query) Request = Request.query(query);
        if(data) Request = Request.send(data);
        if(headers) Request = Request.headers(headers);
        if(field) {
            for(let k in field){
                Request = Request.field(k, field[k]);
            }
        }
        if(attach) {
            for(let file of attach){
               Request = Request.attach(file);
            }            
        }
        return Request;
    },
    head(url, opts = {}) {
        return new Promise((resolve, reject) => {
           exports._('head', url, opts).end((resp) => {
              resolve(resp);
           });
        });
    },
    delete(url, opts = {}) {
        return new Promise((resolve, reject) => {
           exports._('delete', url, opts).end((resp) => {
              resolve(resp);
           });
        });
    },
    get(url, opts) {
        return new Promise((resolve, reject) => {
           exports._('get', url, opts).end((resp) => {
              resolve(resp);
           });
        });
    },
    post(url, opts){
        return new Promise((resolve, reject) => {
           exports._('post', url, opts).end((resp) => {
              resolve(resp);
           });
        });
    },
    put(url, opts){
        return new Promise((resolve, reject) => {
           exports._('put', url, opts).end((resp) => {
              resolve(resp);
           });
        });
    }
}