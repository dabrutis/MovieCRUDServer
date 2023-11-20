const express = require("express");
const app = express();

app.use(express.static(__dirname + '/client'))

// Start MongoDB Atlas ********
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const mongoose = require("mongoose");

const mongooseUri = "mongodb+srv://dabrutis:nkpJDWcDXPJKOhSa@moviecrudcluster.n5fyzqa.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(mongooseUri, {useNewUrlParser: true}, {useUnifiedTopology: true})
const movieSchema = {
	title: String,
	comments: String
}
const Movie = mongoose.model("movie", movieSchema);

// Create route called from create.html
app.post("/create", function(req, res){
	let newNote = new Movie({
		title: req.body.title,
		comments: req.body.comments
	})
	
	newNote.save();
	res.redirect("/");
})

const renderNotes = (notesArray) => {
	let text = "Movies Collection:\n\n";
	notesArray.forEach((note)=>{
		text += "Title: " + note.title  + "\n";
		text += "Comments: " + note.comments  + "\n";
		text += "ID:" + note._id + "\n\n";
	})
	text += "Total Count: " + notesArray.length;
	return text
}

app.get("/read", function(request, response) {
	Movie.find({}).then(notes => { 
		response.type('text/plain');
		response.send(renderNotes(notes));
	})
})

app.post("/delete", async function(req, res){
    try {
        const movieId = req.body.id;
        const deletedMovie = await Movie.findOneAndDelete({_id: movieId});
        if(deletedMovie) {
            console.log("Movie deleted successfully");
        } else {
            console.log("Movie not found");
        }
        res.redirect("/");
    } catch (err) {
        console.log("Error deleting movie:", err);
        res.redirect("/");
    }
});

app.post("/update", async function(req, res){
    try {
        const movieId = req.body.id;
        const updatedMovie = await Movie.findOneAndUpdate(
            { _id: movieId }, 
            { 
                $set: { 
                    title: req.body.newTitle,
                    comments: req.body.newComments
                } 
            },
            { new: true }
        );

        if(updatedMovie) {
            console.log("Movie updated successfully:", updatedMovie);
        } else {
            console.log("Movie not found");
        }
        res.redirect("/");
    } catch (err) {
        console.log("Error updating movie:", err);
        res.redirect("/");
    }
});

const port = process.env.PORT || 3000
app.get('/test', function(request, response) {
	response.type('text/plain')
	response.send('Node.js and Express running on port='+port)
})

app.listen(port, function() {
	console.log("Server is running at http://localhost:3000/")
})