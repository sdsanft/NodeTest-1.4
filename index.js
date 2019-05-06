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
    meetings = []
    response = {firstName : req.body.first, lastName : req.body.last, email : req.body.email, username : req.body.username, password : req.body.password, meetingInfo, nylasInfo, meetings}    
    
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

    if (typeof req.body.days == "string") {
        settings.meetingInfo.days[0] = req.body.days == 'sun';
        settings.meetingInfo.days[1] = req.body.days == 'mon';
        settings.meetingInfo.days[2] = req.body.days == 'tues';
        settings.meetingInfo.days[3] = req.body.days == 'wed';
        settings.meetingInfo.days[4] = req.body.days == 'thurs';
        settings.meetingInfo.days[5] = req.body.days == 'fri';
        settings.meetingInfo.days[6] = req.body.days == 'sat';
    } else if (typeof req.body.days == "object") {
        settings.meetingInfo.days[0] = req.body.days.includes('sun');
        settings.meetingInfo.days[1] = req.body.days.includes('mon');
        settings.meetingInfo.days[2] = req.body.days.includes('tues');
        settings.meetingInfo.days[3] = req.body.days.includes('wed');
        settings.meetingInfo.days[4] = req.body.days.includes('thurs');
        settings.meetingInfo.days[5] = req.body.days.includes('fri');
        settings.meetingInfo.days[6] = req.body.days.includes('sat');
    } else {
        settings.meetingInfo.days.forEach(function(day) {
            day = false;
        })
    }

    console.log(settings.meetingInfo)

    users.push('/' + settings.username, settings)

    console.log("edited meeting info for " + settings.username)

    res.redirect('http://localhost:' + port + '/users/' + settings.username)
})

app.get('/users/:username/meeting/new', function(req, res) {
    var settings
    try {
        settings = users.getData("/" + req.params.username)
    } catch (err) {
        console.log("user does not exist")
        res.redirect('http://localhost:' + port + '/')
    }

    meetingId = settings.meetings.length;
    meeting = {meetingId, scheduled: false, date: null, time: null, clientName: null, clientEmail: null}

    settings.meetings.push(meeting)
    users.push('/' + settings.username, settings)

    res.redirect('http://localhost:' + port + '/users/' + req.params.username + '/meeting/' + meetingId)
})

app.get('/users/:username/meeting', function(req, res) {
    var settings
    try {
        settings = users.getData("/" + req.params.username)
    } catch (err) {
        console.log("user does not exist")
        res.redirect('http://localhost:' + port + '/')
    }

    settings.meetings.forEach(function(meeting) {
        if(meeting.scheduled) {
            console.log("===Scheduled===    Meeting ID: " + meeting.meetingId + ", Date: " + meeting.date + ", Time: " + meeting.time)
        } else {
            console.log("===Unscheduled===  Meeting ID: " + meeting.meetingId)
        }
    })

    res.render("meetings.ejs", {port, settings})
})

app.get("/users/:username/meeting/:id", function(req, res) {
    var settings
    try {
        settings = users.getData("/" + req.params.username)
    } catch (err) {
        console.log("user does not exist")
        res.redirect('http://localhost:' + port + '/')
    }

    meeting = settings.meetings[Number(req.params.id)]

    if(meeting.scheduled) {
        res.render("meetingScheduled.ejs", {port, settings, meeting})
    } else {
        res.render("meetingUnscheduled.ejs", {port, settings, meeting})
    }
})