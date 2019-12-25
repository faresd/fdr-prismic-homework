const createError = require('http-errors');
const PORT = 3001;
const PrismicDOM = require('prismic-dom');
const PrismicConfig = require('./prismic-configuration');
const Prismic = require('prismic-javascript');


var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}/`);
});


// Initialize prismic context and api

app.use((req, res, next) => {

    Prismic.getApi(PrismicConfig.apiEndpoint)
      .then((api) => {
        req.prismic = { api };
        res.locals.PrismicDOM = PrismicDOM;
        res.locals.ctx = {
          endpoint: PrismicConfig.apiEndpoint,
          linkResolver: PrismicConfig.linkResolver,
        };
        next();
      }).catch((err) => {
    next(err);
  });
});

// Query the site layout with every route
app.route('*').get((req, res, next) => {
    req.prismic.api.getSingle('menu')
        .then(function(menuContent){

            // Define the layout content
            res.locals.menuContent = menuContent;
            next();
        });
});

// GET home page.
app.get('/', function(req, res, next) {
    // res.render('homepage', { title: 'Express' });
    req.prismic.api.getSingle("homepage")
        .then((pageContent) => {
            if (pageContent) {
                res.render('homepage', { pageContent });
            } else {
                res.status(404).send('Could not find a homepage document. Make sure you create and publish a homepage document in your repository.');
            }
        })
        .catch((error) => {
            next(`error when retriving page ${error.message}`);
        });

});

app.get('/:uid', function(req, res, next) {
    const uid = req.params.uid;

    req.prismic.api.getByUID("page", uid)
        .then((pageContent) => {
            if (pageContent) {
                res.render('page', { pageContent });
            } else {
                res.status(404).render('404');
            }
        })
        .catch((error) => {
            next(`error when retriving page ${error.message}`);
        });

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
