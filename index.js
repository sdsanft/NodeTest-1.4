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
    meetingInfo = {meetingTitle: "Sales Meeting", meetingLink: "", timezone: -7, days: [false, true, true, true, true, true, false], timeIn: 9, timeOut: 17, meetingLength: 30}
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

app.get('/users/:username/meetingInfo', function(req, res) {
    var settings
    try {
        settings = users.getData("/" + req.params.username)
    } catch (err) {
        console.log("user does not exist")
        res.redirect('http://localhost:' + port + '/')
    }
    res.render('meetingInfo.ejs', {port, settings})
})

app.post('/users/:username/meetingInfo', function(req, res) {
    var settings
    try {
        settings = users.getData("/" + req.params.username)
    } catch (err) {
        console.log("user does not exist")
        res.redirect('http://localhost:' + port + '/')
    }

    settings.meetingInfo.meetingTitle = req.body.meetingTitle
    settings.meetingInfo.meetingLink = req.body.meetingLink
    settings.meetingInfo.timezone = Number(req.body.timezone)
    settings.meetingInfo.timeIn = Number(req.body.timeIn)
    settings.meetingInfo.timeOut = Number(req.body.timeOut)
    settings.meetingInfo.meetingLength = Number(req.body.meetingLength)

    settings.meetingInfo.days[0] = Boolean(req.body.sun)
    settings.meetingInfo.days[1] = Boolean(req.body.mon)
    settings.meetingInfo.days[2] = Boolean(req.body.tues)
    settings.meetingInfo.days[3] = Boolean(req.body.wed)
    settings.meetingInfo.days[4] = Boolean(req.body.thur)
    settings.meetingInfo.days[5] = Boolean(req.body.fri)
    settings.meetingInfo.days[6] = Boolean(req.body.sat)

    users.push('/' + settings.username, settings)

    console.log("edited meeting info for " + settings.username)

    res.redirect('http://localhost:' + port + '/users/' + settings.username)
})