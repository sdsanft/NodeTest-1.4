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

var users = new jsondb("UsersData", true, true, '/');

//Managing HTTP Requests
app.get('/', function(req, res) {
    res.render('main.ejs', {port})
})

app.get('/signup', function(req, res) {
    res.render('signUp.ejs', {port})
})

app.post('/signup', function(req, res) {
    meetingInfo = {meetingTitle: "Sales Meeting", meetingLink: "", timezone: -7, days: [false, true, true, true, true, true, false], timeIn: 9, timeOut: 17, length: 30}
    nylasInfo = {auth: false, ACCESS_TOKEN: null}
    response = {firstName : req.body.first, lastName : req.body.last, email : req.body.email, username : req.body.username, password : req.body.password, meetingInfo, nylasInfo}    
    
    if(response.email != "" && response.username != "" && response.password != "") {
        try {
            users.getData('/' + response.username)
            console.log("username already exists")
            res.redirect('http://localhost:' + port + '/signup')
        } catch (err) {
            users.push('/' + response.username, response)
            console.log("user created")
            res.redirect('http://localhost:' + port + '/users/' + response.username)
        }
    } else {
        console.log("sign up form is incomplete")
        res.redirect("http://localhost:" + port + "/signup")
    }
})

app.get('/signin', function(req, res) {
	res.render('signIn.ejs', {port})
})

app.post('/signin', function(req, res) {
    response = {username: req.body.username, password: req.body.password}
    var credentials

	try {
        credentials = users.getData('/' + response.username)

        if(response.password == credentials.password) {
            console.log (response.username + " signed in")
            res.redirect('http://localhost:' + port + '/users/' + response.username)
        } else {
            console.log ("incorrect password")
            res.redirect('http://localhost:' + port + '/signin')
        }
    } catch (err) {
        console.log("user does not exist")
        res.redirect('http://localhost:' + port + "/signin")
    }
})

app.get('/users/:username', function(req, res) {
    var settings
    try {
        settings = users.getData("/" + req.params.username)
    } catch (err) {
        console.log("user does not exist")
        res.redirect('http://localhost:' + port + '/')
    }
    res.render('user.ejs', {port, settings})
})