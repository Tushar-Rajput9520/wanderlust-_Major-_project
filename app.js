// Import required modules
const express = require("express"); // Express framework for building web applications
const app = express(); // Create an Express application
const mongoose = require("mongoose"); // Mongoose library for MongoDB interactions
const Listing = require("./modals/listing.js"); // Import the Listing model from the 'modals' directory
const path = require("path"); // Node.js module for handling file paths
const methodOverride = require("method-override"); // Allows HTML forms to send PUT & DELETE requests
const ejsMate=require("ejs-mate");
const wrapAsync=require("./util/wrapAsync.js");
const ExpressError=require("./util/ExpressError.js");

// Configure Express to use EJS as the templating engine
app.set("view engine", "ejs"); // Set the view engine to EJS, allowing us to render dynamic HTML pages
app.set("views", path.join(__dirname, "views")); // Set the directory where EJS template files are stored

// Middleware to parse incoming request data
app.use(express.json()); // Parses incoming JSON data from API requests
app.use(express.urlencoded({ extended: true })); // Parses form data from HTML forms
app.use(methodOverride("_method")); // Allows forms to use PUT & DELETE requests by appending ?_method=PUT or DELETE
app.engine("ejs",ejsMate);
app.set("layout", "layouts/boilerplate");
app.use(express.static(path.join(__dirname,"/public")));

// MongoDB Connection
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"; // Database connection URL
main()
  .then(() => {
    console.log("Connected to DB"); // Log success message when connected to the database
  })
  .catch((err) => {
    console.log(err); // Log error message if connection fails
  });

async function main() {
  await mongoose.connect(MONGO_URL); // Connect to the MongoDB database using Mongoose
}

// Home route
app.get("/", (req, res) => {
  res.send("Your connection is successfully done"); // Sends a simple success message to the browser
});

// Show all listings
app.get("/listings", async (req, res) => {
  let allListings = await Listing.find({}); // Fetch all listings from the database
  res.render("index.ejs", { allListings }); // Render the "index.ejs" template and pass the listings data
});

// Render "New Listing" form
app.get("/listings/new", async (req, res) => {
  res.render("new.ejs"); // Render the "new.ejs" template, which contains a form to create a new listing
});

// Show a single listing
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params; // Extract the listing ID from the URL
  let listing = await Listing.findById(id); // Fetch the listing from the database using its ID
  res.render("show.ejs", { listing }); // Render the "show.ejs" template with the listing details
});

// Add a new listing (POST request)
app.post("/listings", async (req, res) => {
  let newListing = new Listing(req.body.listing); // Create a new listing object with form data
  await newListing.save(); // Save the new listing to the database
  res.redirect("/listings"); // Redirect to the listings page after saving
});

// Render "Edit Listing" form
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params; // Extract the listing ID from the URL
  let listing = await Listing.findById(id); // Fetch the listing from the database
  res.render("edit.ejs", { listing }); // Render the "edit.ejs" template with the listing details for editing
});



// Update a listing (PUT request)
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params; // Extract the listing ID from the URL
  await Listing.findByIdAndUpdate(id, { ...req.body.listing }); // Update the listing with new data
  res.redirect(`/listings/${id}`); // Redirect to the updated listing's details page
});

// Delete a listing
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params; // Extract the listing ID from the URL
  let deleteListing = await Listing.findByIdAndDelete(id); // Find and delete the listing from the database
  console.log(deleteListing); // Log the deleted listing details
  res.redirect("/listings"); // Redirect back to the listings page after deletion
});

app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"Page not found"));
})
app.use((err,req,res,next)=>{
  let {statusCode,message}=err;
  res.status(statusCode).send(message);
})



// Start the Express server
app.listen(8080, () => {
  console.log("Server is running on port 8080"); // Log a message when the server starts
});
