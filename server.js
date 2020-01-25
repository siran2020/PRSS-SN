/*
server.js
Sira Nassoko
January 24, 2020
I have a favicon, which was part of the extra credit.
*/

var express = require('express');
var fs = require('fs');
var favicon = require('serve-favicon');
const bodyparser = require('body-parser');
var logged_in;

var app = express(); //Create an Express route
app.use(express.static('public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/public/images/logo.png'));

//npm package needed to request villain name
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));

//port declaration for local hosting
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Server started at ' + new Date() + ', on port ' + port + '!');
});

//login, logout, stats, about, and game routes for specific client requested pages
app.get('/', function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('login');
});

app.get('/login', function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('login');
});

app.get('/logout', function(request, response) {
  logged_in = false;
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('login');
});

app.get('/stats', function(request, response) {
  //object that will hold seperate arrays of users and villains
  var statsData = {};
  //object property declarations, declaring user and villain object as arrays
  statsData["users"] = [];
  statsData["villains"] = [];

  //using the fs package to read from the users.csv file, which contains all the information needed to create individual user objects
  var userFile = fs.readFileSync('data/users.csv', 'utf8');
  //splitting file by lines to create object for each user
  var userLines = userFile.split("\n");

  /*
  1. Iterating through array with user lines at each index
  2. Creating user object for each user
  2. Splitting each line by commas to retrieve the name, games played, games lost, games won, and games tied values in the csv file (creates array of objects with object properties)
  3. Pushing user objects to array of objects, statsData["users"]
  */
  for (var i = 1; i < userLines.length; i++) {
    var userInfo = userLines[i].split(",");
    var user = {};

    user["name"] = userInfo[0];
    user["total_games"] = userInfo[1];
    user["games_lost"] = userInfo[3];
    user["games_won"] = userInfo[2];
    user["games_tied"] = parseInt(user["total_games"] - parseInt(user["games_lost"]) - parseInt(user["games_won"]));
    user["winPercent"] = Math.round((user["games_won"]/(user["total_games"]))*100);

    if (user["name"]) {
      statsData["users"].push(user);
    }

    //sorting users by win percentage
    statsData["users"].sort(function(a,b) {
      return b.winPercent - a.winPercent
    });
  }

  /* The villain object property which alse has a value of an array of objects, follows the same procedure*/
  var villainFile = fs.readFileSync('data/villains.csv', 'utf8');
  var villainLines = villainFile.split("\n");
  var villainsArray = [];

  for (var i = 1; i < villainLines.length; i++) {
    var villainInfo = villainLines[i].split(",");
    var villain = {};

    villain["name"] = villainInfo[0];
    villain["wins"] = parseInt(villainInfo[7]);
    villain["losses"] = parseInt(villainInfo[8]);
    villain["paper"] = villainInfo[1];
    villain["rock"] = villainInfo[2];
    villain["scissors"] = villainInfo[3];
    villain["ties"] = parseInt((parseInt(villain["paper"]) + parseInt(villain["rock"]) + parseInt(villain["scissors"])) - (parseInt(villain["wins"]) + parseInt(villain["losses"])));
    villain["winPercent"] = Math.round((villain["wins"]/(villain["wins"]+villain["losses"]+villain["ties"]))*100);

    if (villain["name"]) {
      statsData["villains"].push(villain);
    }

    statsData["villains"].sort(function(a,b) {
      return b.winPercent - a.winPercent
    });
  }

  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('stats', {
    data: statsData
  });
});

app.get('/about', function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('about');
});

app.get('/game', function(request, response) {
  var user_data = {
    name: request.query.username,
    password: request.query.password
  };

  //using same method as in stats page to create an array of villain names for dropdown in /game route
  var statsData = {};
  statsData["villains"] = [];

  var villainFile = fs.readFileSync('data/villains.csv', 'utf8');
  var villainLines = villainFile.split("\n");
  var villainNames= [];

  for (var i = 1; i < villainLines.length; i++) {
    var villainNames = villainLines[i].split(",");
    var villain = {};
    villain["name"] = villainNames[0];
    villain["description"] = villainNames[9];

    if (villain["name"]) {
      statsData["villains"].push(villain);
    }
  }

  var logged_in = false;

  var userFile = fs.readFileSync('data/users.csv', 'utf8');
  var userLines = userFile.split("\n");

  for (var i = 1; i < userLines.length; i++) {
    var userInfo = userLines[i].split(",");
    if ((user_data.name) && (user_data.name == userInfo[0]) && (user_data.password == userInfo[userInfo.length -1])) {
      console.log("MATCH " + userInfo[0] + ", " + userInfo[userInfo.length - 1]);
      logged_in = true;

    }

  }

  //if the user logs in with the correct credentials, then the game page is rendered
  if (logged_in) {
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render('game', {
      user: user_data,
      data: statsData
    });
  }

  //return a 403 error, indicating the user entered the wrong credentials
  else {
    response.status(403);
    response.setHeader('Content-Type', 'text/html')
    response.render('error');
  }
});

app.post('/:user/game', function(request, response) {

  //variables for user_data and villain_data object
  var userWin;
  var userTie;
  var userLoss;
  var gameStatus;
  var villainWin;
  var villainTie;
  var villainLoss;

  var villainWeapon = Math.random();
  var villainChoice;


  var user_data = {
    name: request.params.user,
    weapon: request.body.weapon,
    wins: userWin,
    losses: userLoss,
    ties: userTie,
    game: gameStatus
  };

  var villain_data = {
    name: request.body.villain_name,
    weapon: villainChoice,
    wins: villainWin,
    losses: villainLoss,
    ties: villainTie,

  }

  /*using the same method in stats page for both user and villain data,
  except each array will only have one item because it will only display
  data for the user logged in and the villain selected respectively*/
  var statsData = {};
  statsData["villains"] = [];
  statsData["users"] = [];

  var villainFile = fs.readFileSync('data/villains.csv', 'utf8');
  var villainLines = villainFile.split("\n");
  var villainsInfo = [];

  for (var i = 1; i < villainLines.length; i++) {
    var villainsInfo = villainLines[i].split(",");
    var villain = {};
    villain["name"] = villainsInfo[0];
    villain["wins"] = parseInt(villainsInfo[7]);
    villain["losses"] = parseInt(villainsInfo[8]);
    villain["paper"] = parseInt(villainsInfo[1]);
    villain["rock"] = parseInt(villainsInfo[2]);
    villain["scissors"] = parseInt(villainsInfo[3]);
    villain["paper_strategy"] = parseFloat(villainsInfo[4]);
    villain["rock_strategy"] = parseFloat(villainsInfo[5]);
    villain["scissors_strategy"] = parseFloat(villainsInfo[6]);
    villain["ties"] = parseInt((parseInt(villain["paper"]) + parseInt(villain["rock"]) + parseInt(villain["scissors"])) - (parseInt(villain["wins"]) + parseInt(villain["losses"])));
    villain["winPercent"] = (villain["wins"]/(villain["wins"]+villain["losses"]+villain["ties"]))*100;

    //if the villain name is the same name selected from drop down, push this villains data to the array
    if (villain["name"] == villain_data.name) {
      statsData["villains"].push(villain);
    }
  }

  var userFile = fs.readFileSync('data/users.csv', 'utf8');
  var userLines = userFile.split("\n");
  for (var i = 1; i < userLines.length; i++) {
    var userInfo = userLines[i].split(",");
    var user = {};
    user["name"] = userInfo[0];
    user["total_games"] = parseInt(userInfo[1]);
    user["games_lost"] = parseInt(userInfo[3]);
    user["games_won"] = parseInt(userInfo[2]);
    user["games_tied"] = parseInt(user["total_games"] - parseInt(user["games_lost"]) - parseInt(user["games_won"]));

    //match the user logged in with their respective data
    if (user["name"] == user_data.name) {
      statsData["users"].push(user);
    }
  }

  /*Logic for villain weapon selection. I accuminiatively add the strategys for each throw and use if statements to decide the ultimate weapon chosen based on these weighted averages*/
  if (villainWeapon <= statsData["villains"][0].paper_strategy) {
     statsData["villains"][0].paper ++;
     villain_data.weapon = "Paper";
  }

  else if (villainWeapon <= (statsData["villains"][0].paper_strategy + statsData["villains"][0].rock_strategy)) {
    statsData["villains"][0].rock ++;
    villain_data.weapon = "Rock";
  }

  else {
    statsData["villains"][0].scissors ++;
    villain_data.weapon = "Scissors";
  }

/*Game logic for villain and user. Each if statement checks for the value of the villain and user throw, uses the rules of PRS to decide a winner, and updates the stats of each player, while keeping the unaffected stats the same to be displayed in a table on the results page.*/
  if (user_data.weapon == villain_data.weapon){
    statsData["users"][0].games_tied = statsData["users"][0].games_tied + 1;
    statsData["villains"][0].ties = statsData["villains"][0].ties + 1;

    villain_data.ties = statsData["villains"][0].ties;
    user_data.ties = statsData["users"][0].games_tied;

    villain_data.wins = statsData["villains"][0].wins;
    villain_data.losses = statsData["villains"][0].losses;
    user_data.losses = statsData["users"][0].games_lost;
    user_data.wins = statsData["users"][0].games_won;


    user_data.game = "There was a tie.";
  }

  else if (user_data.weapon == "Rock"){
    if (villain_data.weapon == "Scissors") {
      statsData["villains"][0].losses = statsData["villains"][0].losses + 1;
      villain_data.losses = statsData["villains"][0].losses;
      villain_data.wins = statsData["villains"][0].wins;

      statsData["users"][0].games_won = statsData["users"][0].games_won + 1;
      user_data.wins = statsData["users"][0].games_won;
      user_data.losses = statsData["users"][0].games_lost;

      villain_data.ties = statsData["villains"][0].ties;
      user_data.ties = statsData["users"][0].games_tied;

      user_data.game = "You win.";
    }

    else if (villain_data.weapon == "Paper") {
      statsData["villains"][0].wins = statsData["villains"][0].wins + 1;
      villain_data.wins = statsData["villains"][0].wins;
      villain_data.losses = statsData["villains"][0].losses;

      statsData["users"][0].games_lost = statsData["users"][0].games_lost + 1;
      user_data.losses = statsData["users"][0].games_lost;
      user_data.wins= statsData["users"][0].games_won;

      villain_data.ties = statsData["villains"][0].ties;
      user_data.ties = statsData["users"][0].games_tied;

      user_data.game = "You lose.";


    }
  }

  else if (user_data.weapon == "Paper"){
    if (villain_data.weapon == "Rock") {
      statsData["villains"][0].losses = statsData["villains"][0].losses + 1;
      villain_data.losses = statsData["villains"][0].losses;
      villain_data.wins = statsData["villains"][0].wins;

      statsData["users"][0].games_won = statsData["users"][0].games_won + 1;
      user_data.wins = statsData["users"][0].games_won;
      user_data.losses = statsData["users"][0].games_lost;

      villain_data.ties = statsData["villains"][0].ties;
      user_data.ties = statsData["users"][0].games_tied;

      user_data.game = "You win.";




    }
    else if (villain_data.weapon == "Scissors") {
        statsData["villains"][0].wins = statsData["villains"][0].wins + 1;
            villain_data.wins = statsData["villains"][0].wins;
            villain_data.losses = statsData["villains"][0].losses;

            statsData["users"][0].games_lost = statsData["users"][0].games_lost + 1;
            user_data.losses = statsData["users"][0].games_lost;
            user_data.wins= statsData["users"][0].games_won;

            villain_data.ties = statsData["villains"][0].ties;
            user_data.ties = statsData["users"][0].games_tied;

            user_data.game = "You lose.";


    }
  }

  else if (user_data.weapon == "Scissors"){
    if (villain_data.weapon == "Paper") {
      statsData["villains"][0].losses = statsData["villains"][0].losses + 1;
      villain_data.losses = statsData["villains"][0].losses;
      villain_data.wins = statsData["villains"][0].wins;

      statsData["users"][0].games_won = statsData["users"][0].games_won + 1;
      user_data.wins = statsData["users"][0].games_won;
      user_data.losses = statsData["users"][0].games_lost;

      villain_data.ties = statsData["villains"][0].ties;
      user_data.ties = statsData["users"][0].games_tied;

      user_data.game = "You win.";




    }
    else if (villain_data.weapon == "Rock") {
      statsData["villains"][0].wins = statsData["villains"][0].wins + 1;
      villain_data.wins = statsData["villains"][0].wins;
      villain_data.losses = statsData["villains"][0].losses;

      statsData["users"][0].games_lost = statsData["users"][0].games_lost + 1;
      user_data.losses = statsData["users"][0].games_lost;
      user_data.wins= statsData["users"][0].games_won;

      villain_data.ties = statsData["villains"][0].ties;
      user_data.ties = statsData["users"][0].games_tied;

      user_data.game = "You lose.";

    }
  }

  console.log(statsData["villains"][0]);
  console.log(statsData["users"][0]);

  //writing final game results to game_results JSON file
  fs.writeFile('game_results', JSON.stringify({user_data,villain_data}), function (err) {
    if (err) throw err;
    console.log('Updated!');
  });


  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('results', {
    user: user_data,
    villain: villain_data
  });
});
