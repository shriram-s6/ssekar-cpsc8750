// use the express library
const express = require('express');
const cookieParser = require('cookie-parser');
// create a new server application
const app = express();

// Define the port we will listen on
// (it will attempt to read an environment global
// first, that is for when this is used on the real
// world wide web).
const port = process.env.PORT || 3000;
app.use(express.static('public'));

// Start listening for network connections
app.listen(port);

// Printout for readability
console.log("Server Started!");
app.use(cookieParser());


let nextVisitorId = 1;
let message = "You have never visited before."
// The main page of our website
app.get('/', (req, res) => {
    let lastVisited = req.cookies.visited;
    let visitorId = req.cookies.visitorId;

    if (lastVisited !== undefined) {
        lastVisited = Math.floor((Date.now() - req.cookies.visited) / 1000);
        message = `It has been ${lastVisited} seconds since your last visit`;
    }

    if (visitorId === undefined) {
        visitorId = ++nextVisitorId;
        res.cookie('visitorId', visitorId);
    } else {
        visitorId = req.cookies.visitorId;
    }

    res.cookie('visitorId', visitorId);
    res.cookie('visited', Date.now());
    res.render('welcome', {
        name: req.query.name || "World",
        visitedDate: new Date().toLocaleString(),
        lastVisited: lastVisited,
        visitorId: nextVisitorId,
        message: message
    });
});

// set the view engine to ejs
app.set('view engine', 'ejs');
