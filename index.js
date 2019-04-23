//Setting up our dependencies
const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const jsondb = require('node-json-db/dist/JsonDB')
const config = require('node-json-db/dist/lib/JsonDBConfig')
const port = 1234

//Initiating express
const app = express()

//Setting ejs as our default
app.set('view engine', 'ejs')

//Setting up our bodyParser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

//Setting up our server
app.listen(port, function(req, res) {
	console.log("Listening at port: " + port)
})

var db = new jsondb("myDataBase", true, false, '/');

//Managing HTTP Requests
app.get('/', function(req, res) {
    res.render('main.ejs', {port})
    d = new Date()
    db.push("/test/time/" + d, d)
})

app.get('/db', function(req, res) {
    console.log(db.getData("/test/time"))
    res.redirect("http://localhost:" + port + "/")
})