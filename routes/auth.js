require("dotenv").config()

const express = require("express");
const passport = require('passport');
const router = express.Router();
const User = require("../models/User");
const Plan = require("../models/Plan");
const nodemailer = require("nodemailer")

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

let transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.USER_NAME,
    pass: process.env.PASS
  }
});


router.get("/login", (req, res, next) => {
  res.render("auth/login", { "message": req.flash("error") });
});


router.post("/login", passport.authenticate("local", {
  successRedirect: "/auth/profile",
  failureRedirect: "/auth/login",
  failureFlash: true,
  passReqToCallback: true
}));

// router.get("/profile", (req, res, next)=> {
//   res.render("/auth/profile", {user: req.user});
// });

// router.get("/signup", (req, res, next) => {
//   res.render("auth/signup");
// });

router.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
let token = '';
for (let i = 0; i < 25; i++) {
    token += characters[Math.floor(Math.random() * characters.length )];
}
  if (username === "" || password === "") {
    res.render("auth/login", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/login", { message: "The username already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      password: hashPass,
      email: email,
      confirmationCode: token
    });

    newUser.save()
    .then(() => {
      transporter.sendMail({
        from: '"Anibal" <anibalapp2019@gmail.com>',
        to: email, 
        subject: 'Anibal Sign Up', 
        text: 'Confirmation Email',
        html: `<b>Thanks for signing in to Anibal. Enjoy creating plans with friends</b> <a href="http://localhost:3000/auth/confirm/${token}">Confirm email address</a>`
      })
      .then(info => console.log(info))
      .catch(error => console.log(error))
      res.redirect("/");
    })
    .catch(err => {
      res.render("auth/signup", { message: "Something went wrong" });
    })
  });
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});
router.get("/confirm/:token", (req, res) => {
 
 User.findOneAndUpdate({confirmationCode:req.params.token},{$set:{status:"Active"}},{new:true})
 .then((user)=>{
  res.redirect("/auth/login");
   console.log("user activated")
 })
 .catch((err)=>{
  console.log(err)
})

});
router.get("/profile", (req, res) => {
  res.render("auth/profile", {user: req.user});
});
router.get("/create-plan", (req, res) => {
  res.render("auth/create-plan", {user: req.user});
});


router.post('/createPlan', (req, res, next) => {
  let author = req.user
  const characters2 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let token2 = '';
  for (let i = 0; i < 25; i++) {
      token2 += characters2[Math.floor(Math.random() * characters2.length )];
  }

  Plan
    .create({
      createdBy : author,
      title: req.body.title,
      city: req.body.city,
      name: req.body.name,
      date: req.body.date,
      time: req.body.time,
      price: req.body.price,
      confirmationCode: token2,
      email: req.body.email,
      
      location: { 
        type: 'Point', 
        coordinates: [+req.body.longitude, +req.body.latitude] 
      }
      
      
    })
    .then(newPlan =>{
      console.log(newPlan)
      Plan.find(newPlan)
      .populate("createdBy")
      .then(() => { res.render("plan-detail",{newPlan})})
      
    })
    
    // .then(plan => { res.render("plan-detail",{plan});console.log(plan)})
    .catch(error => console.log(error))
    .then(() => {
      
      transporter.sendMail({
        from: '"Anibal" <anibalapp2019@gmail.com>',
        to: req.body.email,  
        subject: 'You have been invited to a plan!!!', 
        text: 'You have been invited!',
        html: `<b>You have been invited to a plan!!!</b> <a href="http://localhost:3000/auth/plan/confirm/${token2}">Go to the plan</a>`
      })
 
})
.catch((err)=>{
  console.log(err)
})
});



 router.get("/plan/confirm/:token", (req, res) => {
 console.log("hola")
 Plan.findOne({confirmationCode:req.params.token})
 .populate("createdBy")
  .then(newPlan => { 
    
    res.render("plan-detail",{newPlan});
    console.log(`${newPlan}hola`)
  })
  
  .catch((err)=>{
   console.log(err)
 })

 });



module.exports = router;
