const app = require('./app')
const connectDatabase = require('./config/database')

const dotenv = require('dotenv')

process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.stack}`)
    console.log('Shutting down due to uncaught exception')
    process.exit(1)
})
const path = require('path')

dotenv.config({ path: ('./backend/config/config.env') })


//connection to database
connectDatabase()


const server = app.listen(process.env.PORT, ()=>{
    console.log(`Server strated on PORT: ${process.env.PORT} in ${process.env.NODE_ENV}`)
})

process.on('unhandledRejection', err => {
    console.log(`ERROR: ${err.message}`)
    console.log('Shutting downt eh server')
    server.close(() => {
        process.exit(1)
    })
})