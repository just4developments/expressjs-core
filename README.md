# restify-core
Fast, easy and flexiable to implement and maintaince project base on restify.

## Feature:
1. Create project base on Restify
2. Auto generate APIs layer (Controller, service, database (mongo: available, others: Implement db interface to customize))
3. Optimize FileUpload and resize image via configuration file

Config API Generation at lib/generate/initial.js 

```sh
module.exports = {
    tables: { 
        test: { // Collection which you want to generate
            _id: GenType.Key(GenType.String), // 
            name: GenType.String("Unknown"),
            age: GenType.Number(20),
            date: GenType.Date('now'),
            obj: GenType.Object({class: 'test'}),
            arr: GenType.Array([1,2,3])
            images: GenType.File({uploadDir: 'assets/images/', multiples: true, "httpPath": "/images/${filename}", "resize": Native("global.appconfig.app.imageResize.product")}),
            avatar: GenType.File({uploadDir: 'assets/avatar/', multiples: false, "httpPath": "/avatar/${filename}", "resize": Native("global.appconfig.app.imageResize.avatar")}),
            created_at: GenType.Date('auto-insert'),
            updated_at: GenType.Date('auto-insert|auto-update')
        }
    },
    outdir: 'src'
};
```
In that: 
```sh
    GenType.Key: _id mongo which be auto generated
    GenType.String: required
    GenType.String(defaultValue): String with default value
    GenType.Number: same GenType.String
    GenType.Date: required
    GenType.Date('now'): Default is today (= new Date())
    GenType.Date('auto-insert'): Default is today (= new Date()) when inserting
    GenType.Date('auto-update'): Default is today (= new Date()) when updating
    GenType.Date('auto-insert|auto-update'): Default is today (= new Date()) when inserting & updating
    GenType.Date(year, month, day, hh, mm, ss): (same new Date() in javascript: Oct = 9)
    GenType.Object: same GenType.String
    GenType.Array: same GenType.String
    GenType.File({
        saveTo: '`assets/images`', // Upload file to physical path
        maxCount: 1, // Upload multiple file. If maxCount > 1 ? Array : Path image file
        isFull: false, // isFull ? details object image : only path
        returnPath: "`/images/${filename}`", // Path get after upload which is inserted into database (It's web path not physical path)
        limits: 10000, // limit file size
        resize: Native("global.appconfig.app.imageResize.product") // Auto resize image base on config in src/appconfig.js
    })
```
Global.appconfig for resize image
```sh
  app: {
    imageResize: {
        product: [
            {w: -1000 }, // Auto resize origin when width > 1000. If width < 1000 do nothing
            {w: 32, h: 32, ext: 'thumb'},
            {w: 224, h: 200, ext: 'list.pc'},
            {w: 358, h: 200, ext: 'list.tab'},
            {w: 270, h: 200, ext: 'list.mob'}
        ]
    }
  }
```

Generate APIs from lib/generate/initial.js config file
```sh
npm run gen
```

## Installation
1. Use file uploading 
```sh
npm install fs-path multer --save
```

2. Use image resizing
```sh
npm install jimp --save
```