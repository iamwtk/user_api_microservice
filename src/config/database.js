import mongoose from 'mongoose'

mongoose.Promise = global.Promise

mongoose.connect('mongodb://mongo/users', { useNewUrlParser: true })
    .then(() => console.log('Database Connected!'))
    .catch(err => console.error(err))