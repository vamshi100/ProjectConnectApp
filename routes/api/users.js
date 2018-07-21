const express = require('express')

const router = express.Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passport = require('passport')

//load input validation
const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')

//load user model
const User = require('../../models/User')

const keys = require('../../config/keys')

//@route GET('/api/users/test')
//@desc  Tests users routes
//@access Public
router.get('/test', (req, res) => res.json({ msg: 'users works' }))


//@route POST('/api/users/register')
//@desc  register users routes
//@access Public
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body)

  if (!isValid) {
    return res.status(400).json(errors)
  }

  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        errors.email = 'Email already exists'
        res.status(400).json(errors)
      } else {
        const avatar = gravatar.url(req.body.email, {
          s: '200', //size
          r: 'pg', //rating
          d: 'mm', //default
        })
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          avatar,
        })
        /*eslint-disable */
        bcrypt.genSalt(10, (err, Salt) => {
          bcrypt.hash(newUser.password, Salt, (err, hash) => {
            if (err) throw err
            newUser.password = hash
            newUser
              .save()
              .then(user => res.json(user))
              .catch(err => console.log(err))
          })
        })
      }
    })
})

//@route POST('/api/users/login')
//@desc  login users/ return JWT token
//@access Public
router.post('/login', (req,res) => {
  const { errors, isValid } = validateLoginInput(req.body)

  if (!isValid) {
    return res.status(400).json(errors)
  }

  const email = req.body.email
  const password = req.body.password
  //find user Email
  User.findOne({email})
    .then(user => {
      if (!user) {
        errors.email = 'User not found'
        return res.status(404).json(errors)
      }
      //chack for password
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (isMatch) {
            //User found
            const payload = { id: user.id, name: user.name, avatar: user.avatar } // create jwt payload

            //Sign token
            jwt.sign(
              payload,
              keys.secretOrKey,
              { expiresIn: 3600 },
              (err, token) => {
              res.json({
                sucess: true,
                token: 'Bearer ' + token
              })
            })
          } else {
            errors.password = 'Password incorrect'
            return res.json(errors)
          }
        })
    })
})

//@route GET('/api/users/current')
//@desc  current users/ return current user
//@access private
router.get('/current', passport.authenticate('jwt', {session: false}), (req,res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
  })
})

module.exports = router
