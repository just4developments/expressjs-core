let fs = require('fs');
let path = require('path');
let _ = require('lodash');

module.exports = (tbl, fieldsKeyType, fieldsType) => {
    let self = this;
    this.validate = (fieldsKeyType, fieldsType) => {
        let ivalidation = new MyArray();
        let uvalidation = new MyArray();
        let gvalidation = new MyArray();
        let dvalidation = new MyArray();
        let fvalidation = new MyArray();
        ivalidation.push(fieldsKeyType.validateInService ? fieldsKeyType.validateInService('item') : null);
        uvalidation.push(fieldsKeyType.validateUpService ? fieldsKeyType.validateUpService('item') : null);
        gvalidation.push(fieldsKeyType.validateGeService ? fieldsKeyType.validateGeService('item') : null);
        dvalidation.push(fieldsKeyType.validateDeService ? fieldsKeyType.validateDeService('item') : null);
        fvalidation.push(fieldsKeyType.validateFiService ? fieldsKeyType.validateFiService('item') : null);
        fieldsType.forEach((fieldType, i) => {
           if(fieldType.name !== 'Key'){
                ivalidation.push(fieldType.validateInService ? fieldType.validateInService('item') : null);
                uvalidation.push(fieldType.validateUpService ? fieldType.validateUpService('item') : null);
                gvalidation.push(fieldType.validateGeService ? fieldType.validateGeService('item') : null);
                dvalidation.push(fieldType.validateDeService ? fieldType.validateDeService('item') : null);
                fvalidation.push(fieldType.validateFiService ? fieldType.validateFiService('item') : null);
            } 
        });
        return `validate(item, action) {
        switch (action) {
            case exports.VALIDATE.INSERT:
                ${ivalidation.join('\n\t\t\t\t')}

                break;
            case exports.VALIDATE.UPDATE:
                ${uvalidation.join('\n\t\t\t\t')}

                break;
            case exports.VALIDATE.GET:
                ${gvalidation.join('\n\t\t\t\t')}

                break;
            case exports.VALIDATE.DELETE:
                ${dvalidation.join('\n\t\t\t\t')}

                break;
            case exports.VALIDATE.FIND:
                ${fvalidation.join('\n\t\t\t\t')}

                break;
        }
        return item;
    },`;
    };
    this.find = () => {
        return `async find(fil={}, dbo) {
                    fil = exports.validate(fil, exports.VALIDATE.FIND);

                    dbo = await db.open(exports.COLLECTION, dbo);
                    const rs = await dbo.find(fil, dbo.isnew ? db.DONE : db.FAIL);
                    return rs;
                },`;
    };
    this.get = (fieldsKeyType) => {
        return `async get(${fieldsKeyType.fieldName}, dbo) {
                    ${fieldsKeyType.fieldName} = exports.validate(${fieldsKeyType.fieldName}, exports.VALIDATE.GET);

                    dbo = await db.open(exports.COLLECTION, dbo);
                    const rs = await dbo.get(${fieldsKeyType.fieldName}, dbo.isnew ? db.DONE : db.FAIL);
                    return rs;
                },`;
    }
    this.post = (fieldsKeyType, fieldsType) => {
        let deleteFiles = [];
        fieldsType.forEach((fieldType, i) => {
            if(fieldType.name === 'File'){
                deleteFiles.push(`utils.deleteFiles(utils.getAbsoluteUpload(item.${fieldType.fieldName}, ${fieldType.config.saveTo}), ${JSON.ostringify(fieldType.config.resize)});`);                
            }
        });
        deleteFiles = deleteFiles.join('\n\t\t\t\t');        
        if(deleteFiles.length > 0) {
            return `async insert(item, dbo) {
                    try {
                        item = exports.validate(item, exports.VALIDATE.INSERT);

                        dbo = await db.open(exports.COLLECTION, dbo);
                        const rs = await dbo.insert(item, dbo.isnew ? db.DONE : db.FAIL);
                        return rs;
                    } catch(err){
                        ${deleteFiles}
                        throw err;
                    }
                },`;
        }
        return `async insert(item, dbo) {
                    item = exports.validate(item, exports.VALIDATE.INSERT);

                    dbo = await db.open(exports.COLLECTION, dbo);
                    const rs = await dbo.insert(item, dbo.isnew ? db.DONE : db.FAIL);
                    return rs;
                },`;
    }
    this.put = (fieldsKeyType, fieldsType) => {
        let deleteFiles = [];
        let deleteOldFiles = [];
        fieldsType.forEach((fieldType, i) => {
            if(fieldType.name === 'File'){
                deleteFiles.push(`utils.deleteFiles(utils.getAbsoluteUpload(item.${fieldType.fieldName}, ${fieldType.config.saveTo}), ${JSON.ostringify(fieldType.config.resize)});`);
                deleteOldFiles.push(`utils.deleteFiles(utils.getAbsoluteUpload(oldItem.${fieldType.fieldName}, ${fieldType.config.saveTo}), ${JSON.ostringify(fieldType.config.resize)});`);           
            }
        });
        deleteFiles = deleteFiles.join('\n\t\t\t\t');
        deleteOldFiles = deleteOldFiles.join('\n\t\t\t\t\t\t\t');
        if(deleteFiles.length > 0)
            return `async update(item, dbo) {
                        try {
                            item = exports.validate(item, exports.VALIDATE.UPDATE);
                            
                            dbo = await db.open(exports.COLLECTION, dbo);
                            try {
                                const oldItem = await dbo.get(item.${fieldsKeyType.fieldName});
                                const rs = await dbo.update(item);
                                ${deleteOldFiles}
                                return rs;
                            } finally {
                                if(dbo.isnew) await dbo.close();
                            }
                        } catch (err) {
                            ${deleteFiles}
                            throw err;
                        }
                    },`;
        return `async update(item, dbo) {
                    item = exports.validate(item, exports.VALIDATE.UPDATE);

                    dbo = await db.open(exports.COLLECTION, dbo);                            
                    const rs = await dbo.update(item, dbo.isnew ? db.DONE : db.FAIL);

                    return rs;
                },`;
    }
    this.delete = (fieldsKeyType, fieldsType) => {
        let deleteFiles = [];
        fieldsType.forEach((fieldType, i) => {
            if(fieldType.name === 'File'){
                deleteFiles.push(`utils.deleteFiles(utils.getAbsoluteUpload(item.${fieldType.fieldName}, ${fieldType.config.saveTo}), ${JSON.ostringify(fieldType.config.resize)});`);           
            }
        });
        deleteFiles = deleteFiles.join('\n\t\t\t\t\t\t\t');
        if(deleteFiles.length > 0)
            return `async delete(${fieldsKeyType.fieldName}, dbo) {
                        ${fieldsKeyType.fieldName} = exports.validate(${fieldsKeyType.fieldName}, exports.VALIDATE.DELETE);

                        dbo = await db.open(exports.COLLECTION, dbo);
                        try {
                            const item = await dbo.get(${fieldsKeyType.fieldName});                                                              
                            const rs = await dbo.delete(${fieldsKeyType.fieldName});   
                            ${deleteFiles}
                            return rs;
                        } finally{
                            if(dbo.isnew) await dbo.close();
                        }
                    }`;
        return `async delete(${fieldsKeyType.fieldName}, dbo) {
                    ${fieldsKeyType.fieldName} = exports.validate(${fieldsKeyType.fieldName}, exports.VALIDATE.DELETE);

                    dbo = await db.open(exports.COLLECTION, dbo);   
                    const rs = await dbo.delete(${fieldsKeyType.fieldName}, dbo.isnew ? db.DONE : db.FAIL);
                    
                    return rs;
                }`;
    }
    this.writeTo = (outdir) => {
        let genContent = new MyArray();
        genContent.push(self.validate(fieldsKeyType, fieldsType));
        genContent.push(self.find(fieldsType, fieldsType));
        genContent.push(self.get(fieldsKeyType, fieldsType));
        genContent.push(self.post(fieldsKeyType, fieldsType));
        genContent.push(self.put(fieldsKeyType, fieldsType));
        genContent.push(self.delete(fieldsKeyType, fieldsType));
        let fservice = path.join(__dirname, '..', '..', outdir, 'service', `${tbl}.service.js`);
        try {
            fs.statSync(fservice);
            console.warn(`#WARN\t${fservice} is existed`);
        } catch (e) {
            let cnt = new String(fs.readFileSync(path.join(__dirname, '[name].service.js')));
            cnt = cnt
                .replace(/\$\{tbl\}/g, tbl)
                .replace(/\$\{GEN_CONTENT\}/g, genContent.join('\n\n\t'))
                .replace(/\$\{tblDeco\}/g, tbl.toUpperCase().split('').join('-'))
                .replace(/\$\{createdDate\}/g, new Date().toLocaleString());
            let beautify = require('js-beautify').js_beautify;
            cnt = beautify(cnt.toString('binary'), { "indent_size": 1, "indent_char": "\t"});
            cnt = cnt.replace('asyncget', 'async get');
            fs.writeFileSync(fservice, cnt);
        }
    }
    return this;
}