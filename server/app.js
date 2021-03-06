require('ignore-styles');
const bodyParser = require('body-parser');
const compression = require('compression');
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cookiesMiddleware = require('universal-cookie-express');

// routes
const index = require('./routes/index');
const api = require('./routes/api');
const universalLoader = require('./universal');

const app = express();

// Support Gzip
app.use(compression());

// Support post requests with body data (doesn't support multipart, use multer)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Setup logger
app.use(morgan('combined'));

// Setup cookies
app.use(cookiesMiddleware());

app.use('/api', api);
app.use('/', index);
app.use(express.static(path.resolve(__dirname, '..', 'build')));
// Always return the main index.html, so react-router render the route in the client
app.use('/', universalLoader);

module.exports = app
