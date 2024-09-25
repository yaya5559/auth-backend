const dbConnect = require("./db/dbConnect");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./auth");

const User = require("./db/userModel");
const { response } = require("express");
const express = require("express"); // Import express
const app = express(); // Create an instance of the Express app

app.use(express.json()); 

// execute database connection 
dbConnect();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.post("/register", (request, response) => {
  // hash the password
  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
      // create a new user instance and collect the data
      const user = new User({
        email: request.body.email,
        password: hashedPassword,
      });

      // save the new user
      user
        .save()
        // return success if the new user is added to the database successfully
        .then((result) => {
          response.status(201).send({
            message: "User Created Successfully",
            result,
          });
        })
        // catch error if the new user wasn't added successfully to the database
        .catch((error) => {
          response.status(500).send({
            message: "Error creating user",
            error,
          });
        });
    })
    // catch error if the password hash isn't successful
    .catch((e) => {
      response.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});

app.post("/login", (request, response)=>{
  User.findOne({email: request.body.email})
  .then((user)=>{
    bcrypt.compare(request.body.password, user.password)
    .then((passwordCheck)=>{
      if(!passwordCheck){
        return response.status(400).send({
          message: "Password does not match",
          error,
        });
      }
      const token = jwt.sign({
        userId : user._id,
        userEmail: user.email,
      },
      "RANDOM-TOKEN",
      {expiresIn: "24h"}
    );
    response.status(200).send({
      message:"Login Successful",
      email: user.email,
      token,
    });
    })
    .catch((error)=>{
      response.status(400).send({
        message: "Passwords does not match",
        error,
      })
    })
  })
  .catch((e)=>{
    response.status(404).send({
      message: "Email not found",
      e,
    })
  })
})
// free endpoint
app.get("/free-endpoint", (request, response) => {
  response.json({ message: "You are free to access me anytime" });
});

// authentication endpoint
app.get("/auth-endpoint", auth, (request, response) => {
  response.json({ message: "You are authorized to access me" });
});





module.exports = app;