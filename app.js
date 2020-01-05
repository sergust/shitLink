const express = require('express')
const config = require('config')
const mongoose = require('mongoose')

const app = express()

app.use('/api/auth', require('./routes/auth.routes'))

const PORT = config.get('port') || 5000

async function start() {
    try {
        await mongoose.connect(config.get('mongoURI'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        console.log('✅ DB connected')
        app.listen(PORT, () => console.log(`✅ Server is running on port ${PORT}...`))
    }  catch (e) {
        console.log('Server error', e.message)
    }
}
start()



