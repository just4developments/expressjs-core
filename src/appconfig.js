global.appconfig = {
  name: 'expressjs',
  listen: 9000,
  db: {
      url: 'mongodb://localhost:27017/nanacloset01'
  },
  app: {
      imageResize: {
        product: [
          {w: -1000 }, // Auto resize origin when width > 1000. If width < 1000 do nothing
          {w: 32, h: 32, ext: 'thumb'},
          {w: 225, h: 200, ext: 'list.pc'},
          {w: 360, h: 200, ext: 'list.tab'},
          {w: 380, h: 200, ext: 'list.mob'}
        ]
      }
    }
}