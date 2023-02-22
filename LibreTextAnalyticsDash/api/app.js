const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const basicAuth = require("express-basic-auth");
const cookieParser = require('cookie-parser');

const userPassword = process.env.userPassword;
const env = process.env;

const ENVIRONMENT = "production"; //development or production -- test server vs production server, test server temporarily out of use

const app = express();
app.use(cors());
if (ENVIRONMENT === "development") {
  app.use(
    basicAuth({
      users: { admin: userPassword },
      challenge: true,
    })
  );
}
app.use(cookieParser());
//set the content security policy
// app.use(function(req, res, next){
//     res.header("Content-Security-Policy", "default-src 'self';script-src 'self';object-src 'none';img-src 'self';media-src 'self';frame-src 'none';font-src 'self' data:;connect-src 'self';style-src 'self'");
//     next();
// });

const PORT = process.env.PORT || 8080;
app.listen(PORT, console.log(`Server started on port ${PORT}`));

app.use(bodyParser.json());

//call all the routes, pass the app, environment, and all of the environment variables
require("./routes")(app, ENVIRONMENT, env)
