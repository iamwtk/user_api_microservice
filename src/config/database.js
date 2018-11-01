import mongoose from 'mongoose'

mongoose.Promise = global.Promise

mongoose.connect('mongodb://mongo/users', { useNewUrlParser: true })
    .then(() => console.log('Database Connected!'))
    .catch(err => process.exit(1)) 