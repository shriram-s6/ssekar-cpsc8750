// use the express library
const express = require('express');
const {encode} = require('html-entities');
const cookieParser = require('cookie-parser');
// create a new server application
const app = express();
const fetch = require('node-fetch');
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

app.get('/trivia', async (req, res) => {
    // fetch the data
    const response = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');

    if (!response.ok) {
        res.status(500);
        res.send(`Open Trivia Database failed with HTTP code ${response.status}`);
        return;
    }

    const htmlContent = await response.json();

    const htmlFormat = JSON.stringify(htmlContent, 2);

    const correctAns = htmlContent.results[0].correct_answer;
    const answers = htmlContent.results[0].incorrect_answers;
    answers.push(correctAns);

    answers.sort(() => Math.random() - 0.5);

    const linksToAnswers = answers.map(answer => {
        return `<a href="javascript:alert('${
        answer === correctAns ? 'Correct!' : 'Incorrect, Please Try Again!'
        }')">${answer}</a>`
    });

    res.render(
        'trivia', {
            category: htmlContent.results[0].category,
            difficulty: htmlContent.results[0].difficulty,
            question: htmlContent.results[0].question,
            answers: answers,
            linksToAnswers: linksToAnswers,
        }
    );
})

// set the view engine to ejs
app.set('view engine', 'ejs');
