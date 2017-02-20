const path = require('path');
module.exports = {
    tables: {
        category: {
            _id: GenType.Key(GenType.Uuid),
            name: GenType.String,            
            created_at: GenType.Date('auto-insert'),
            updated_at: GenType.Date('auto-insert|auto-update')
        },
        transaction: {
            _id: GenType.Key(GenType.Uuid),
            images: GenType.File({
                saveTo: '`assets/images`', // Upload file to physical path
                maxCount: 1, // Upload multiple file. If maxCount > 1 ? Array : Path image file
                isFull: false, // isFull ? details object image : only path
                returnPath: "`/images/${filename}`", // Path get after upload which is inserted into database (It's web path not physical path)
                limits: 10000, // limit file size
                resize: Native("global.appconfig.app.imageResize.product") // Auto resize image base on config in src/appconfig.js
            })
        },
        product: {
            _id: GenType.Key(GenType.Uuid),
            name: GenType.String,            
            des: GenType.String(null),
            category_id: GenType.Uuid,
            money: GenType.Number,
            money0: GenType.Number,
            special: GenType.Boolean,
            status: GenType.Number,
            position: GenType.Number,
            quantity: GenType.Number,
            quantity0: GenType.Number,
            size: GenType.String,
            sizes: GenType.Array({
                name: GenType.String,
                quantity: GenType.Number,
                quantity0: GenType.Number
            }),
            images: GenType.Array,            
            created_at: GenType.Date('auto-insert'),
            updated_at: GenType.Date('auto-insert|auto-update')
        }
    },
    outdir: 'src'
};