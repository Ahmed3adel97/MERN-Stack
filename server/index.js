// require('dotenv').config();

const express = require('express')

const app = require('./src/app')
// const app = express()

const PORT = 5000


app.listen(PORT, () => {
    console.log(`server is ready on ${PORT}`)
})