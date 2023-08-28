const passport = require('passport');
const bcrypt = require('bcrypt');

module.exports = (app, myDataBase) => {
  app.route('/').get((req, res) => {
    res.render('index', {
      title: 'Connected to Database',
      message: 'Please login',
      showLogin: true,
      showRegistration: true,
      showSocialAuth: true
    });
  });

  app.route('/login').post(
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res) => {
      res.redirect('/profile');    
     }
  );

  app.route('/logout').get(
    (req, res) => {
      req.logout();
      res.redirect('/');
    }
  );

  app.route('/profile')
    .get(ensureAuthenticated, (req, res) => {
      res.render('profile', {username: req.user.username});
    });

  app.route('/register')
    .post(async (req, res, next) => {
      console.log(req.body);
      try {
        const hash = bcrypt.hashSync(req.body.password, 12);
        const user = await myDataBase.findOne({ username: req.body.username });

        if (user) {
          res.redirect('/');
        }

        const newUser = await myDataBase.insertOne({
          username: req.body.username,
          password: hash
        });
        const userData = newUser.ops[0];
        
        req.login(userData, (err) => {
          if (err) {
            return next(err)
          }
          res.redirect('/profile');
        })

      } catch (error) {
        res.redirect('/');
      }
    });
    
  
  app.route('/auth/github').get(passport.authenticate('github'));
  app.route('/auth/github/callback').get(
    passport.authenticate('github', { failureRedirect: "/" }),
    (req, res) => {
      res.redirect('/profile');
    }
  );
  
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  }

    // Missing pages
  app.use((req, res, next) => {
    res.status(404)
      .type("text")
      .send('Not Found');
  });
};