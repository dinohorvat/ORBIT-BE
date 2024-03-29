var express = require('express');
var request = require('request');
var router = express.Router();
var apikey = "bd815566a8b9a441231760d1b1347bb3";
var ts = "1";
var hash = "9c5f4965a592f3a4a3cca6d6e94405de";
var environment = "https://gateway.marvel.com";

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/marvel');
var Leaderboard = mongoose.model('Leaderboard', { name: String, score: Number });

router.post('/leaderboard', function(req, res) {
    var member = new Leaderboard(req.body);
    member.save().then((response) => res.send(response));
});
router.get('/leaderboard', function(req, res, next) {
    Leaderboard.find({}).sort( { score: 1 }).limit(10).then((response) => {
        res.send(response);
    });
});
/* GET characters listing. */
router.get('/characters', function(req, res, next) {
    request({
        uri: environment + '/v1/public/characters?offset=1300&limit=15&ts=' + ts + '&apikey=' + apikey + '&hash=' + hash
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var characters = JSON.parse(body).data.results;
            for(var i = 0; i < characters.length; i++){
                // Removing the object if it doesn't have image
                if((characters[i].thumbnail.path).indexOf("image_not_available") > -1){
                    console.log(characters[i]);
                    characters.splice(i, 1);
                }
                characters[i].flipped = false;
                characters[i].guess = false;
                characters[i].primary = true;
            }
            // Creating the other pairs
            var secondaryCharacters = JSON.parse(JSON.stringify(characters));
            for(var i = 0; i < secondaryCharacters.length; i++) {
                secondaryCharacters[i].primary = false;
            }
            characters = characters.concat(secondaryCharacters);
            shuffleArray(characters);
            // Removing the last element in order to preserve 5x5 grid (25 Size)
            characters.pop();
            res.send(characters);
        }
    })
});


/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
module.exports = router;
