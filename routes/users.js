const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');
const mailer = require('../utils/Mailer')

let User = require('../models/user');

const avatars = ["https://cleak-s3.s3.amazonaws.com/media/profilephotos/1.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/2.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/3.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/4.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/5.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/6.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/7.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/8.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/9.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/10.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/11.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/12.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/13.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/14.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/15.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/16.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/17.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/18.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/19.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/20.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/21.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/22.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/23.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/24.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/25.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/26.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/27.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/28.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/29.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/30.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/31.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/32.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/33.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/34.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/35.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/36.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/37.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/38.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/39.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/40.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/41.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/42.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/43.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/44.png", "https://cleak-s3.s3.amazonaws.com/media/profilephotos/45.png"]

router.post('/register', function (req, res) {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({
    email: req.body.email
  }).then(user => {
    if (user) {
      return res.status(400).json({
        email: 'E-posta adresi daha önceden alınmıştır'
      });
    }
    else {
      User.findOne({
        username: req.body.username
      }).then(user => {
        if (user) {
          return res.status(400).json({
            username: 'Kullanıcı adı daha önceden alınmıştır'
          });
        } else {
          const avatar = avatars[Math.floor(Math.random() * avatars.length)]
          const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            avatar
          });
    
          bcrypt.genSalt(10, (err, salt) => {
            if (err) console.error('There was an error', err);
            else {
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) console.error('There was an error', err);
                else {
                  newUser.password = hash;
                  newUser
                    .save()
                    .then(user => {
                      const payload = {
                        id: user.id,
                        username: user.username,
                        avatar: user.avatar,
                        role: user.role
                      }
                      jwt.sign(payload, 'secret', {
                        expiresIn: 31556926
                      }, (err, token) => {
                        if (err) console.error('There is some error in token', err);
                        else {
                          res.json({
                            success: true,
                            token: `Bearer ${token}`
                          });
                        }
                      });
                    })
                    .then(() => {
                      mailer.send({
                        to: req.body.email,
                        from: 'Teknodeneyim <info@teknodeneyim.com>',
                        subject: "Teknodeneyim'e Hoşgeldiniz",
                        text: `
                        Teknodeneyim.com
                        Tekno Deneyim'e Hoşgeldiniz
                        Bu e-posta adresi ile Tekno Deneyim’e kaydolmadıysanız lütfen bu e-postayı dikkate almayınız.
                        İletişim için: info@teknodeneyim.com`,
                        html: `
                        <h1 style="text-align: center; font-family: Arial, Helvetica, sans-serif; color: #F67E7D">Teknodeneyim.com</h1>
                        <h3 style="text-align: center; font-family: Arial, Helvetica, sans-serif; margin-top: 70px">Tekno Deneyim'e Hoşgeldiniz</h3>
                        <h5 style="text-align: center; font-family: Arial, Helvetica, sans-serif; font-style: italic; margin-top: 70px;color: #843B62;">Bu e-posta adresi ile Tekno Deneyim’e kaydolmadıysanız lütfen bu e-postayı dikkate almayınız.</h5>
                        <h5 style="text-align: center; font-family: Arial, Helvetica, sans-serif; font-weight: bold; margin-top: 70px;color: #F67E7D;">İletişim için: info@teknodeneyim.com</h5>`,
                      })
                    })
                }
              });
            }
          });
        }
      })
    }
  });
});

router.post('/login', (req, res) => {

  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ username })
    .then(user => {
      if (!user) {
        errors.username = 'Kullanıcı Bulunamadı'
        return res.status(404).json(errors);
      }
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (isMatch) {
            const payload = {
              id: user.id,
              username: user.username,
              avatar: user.avatar,
              role: user.role
            }
            jwt.sign(payload, 'secret', {
              expiresIn: 31556926
            }, (err, token) => {
              if (err) console.error('There is some error in token', err);
              else {
                res.json({
                  success: true,
                  token: `Bearer ${token}`
                });
              }
            });
          }
          else {
            errors.password = 'Hatalı Şifre';
            return res.status(400).json(errors);
          }
        });
    });
});

router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
  return res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email
  });
});

router.route('/:userName').get((req, res) => {
  const username = req.params.userName
  User.findOne({ username })
    .populate({
      path: "saved",
      options: { sort: '-createdAt' },
      populate: {
        path: "username",
        select: 'username avatar'
      }
    })
    .populate({
      path: "comments",
      options: { sort: '-createdAt' },
      populate: {
        path: "username target",
        select: 'username avatar content slug'
      }
    })
    .exec()
    .then(req => res.json(req))
    .catch(err => res.status(400).json('Error: ' + err));
})

// Save or unsave post to User
router.post('/user-save-post', async (req, res) => {
  try {
    let user = await User.findById(req.body.userId)
      .catch(e => {
        throw new Error('No user')
      })

    if (!user) {
      throw new Error('No user')
    }
    if (!req.body.userId) {
      throw new Error('No user')
    }
    await user.toggleSave(req.body.postId)
    res.json({
      result: true,
      saved: user.saved
    })
  } catch (e) {
    let errMsgArray = []
    let errMsg = ''
    if (e.errors) {
      Object.keys(e.errors).forEach(key => {
        errMsgArray.push(e.errors[key].message)
      })

      errMsg = errMsgArray.join(', ')
    }

    if (e.message) {
      !!errMsg && (errMsg += ', ')
      errMsg += e.message
    }

    !errMsg && (errMsg = 'Error')

    res.json({
      result: false,
      errMsg,
      err: e
    })
  }
});

// Add description to User
router.route('/change-description').post((req, res) => {
  User.findByIdAndUpdate(req.body.userId, { $set: { description: req.body.description } })
    .then(req => res.json(req))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/report/:userId').get((req, res) => {
  const userId = req.params.userId
  User.findOne({ _id: userId })
    .select('lastReported lastCommentDeleted lastCommented')
    .exec()
    .then(req => res.json(req))
    .catch(err => res.status(400).json('Error: ' + err));
})

// Add description to User
router.route('/change-avatar').post((req, res) => {
  User.findByIdAndUpdate(req.body.userId, { $set: { avatar: req.body.avatar } })
    .then(req => res.json(req))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;

// router.route('/').get((req, res) => {
//   User.find()
//     .then(users => res.json(users))
//     .catch(err => res.status(400).json('Error: ' + err));
// });

// router.route('/add').post((req, res) => {
//   const username = req.body.username;

//   const newUser = new User({ username });

//   newUser.save()
//     .then(() => res.json('User added!'))
//     .catch(err => res.status(400).json('Error: ' + err));
// });