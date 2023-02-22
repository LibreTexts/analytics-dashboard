const randomString = require('randomstring');
/**
 * Start the auth flow by redirecting to Conductor's OAuth2 'authorize' endpoint.
 * This endpoint could optionally check if valid access tokens are already present and
 * skip straight to the Dashboard instead of generating new tokens.
 */
const conductorInitCall = (req, res, env, conductor_api_url) => {
  const stateNonce = randomString.generate(10);
  const cookiesToSet = [
    `analytics_conductor_oauth_state=${stateNonce}; Path=/; Domain=localhost; HttpOnly; Secure;`,
  ]
  if (req.query.courseID) {
    cookiesToSet.push(`analytics_conductor_course_id=${req.query.courseID}; Path=/; Domain=localhost; HttpOnly; Secure;`)
    res.cookie('analytics_conductor_course_id', req.query.courseID)
  }
  //res.setHeader('Set-Cookie', cookiesToSet);
  res.cookie('analytics_conductor_oauth_state', stateNonce)
  return res.redirect(`${conductor_api_url}/oauth2.0/authorize?client_id=${env.CONDUCTOR_API_CLIENT_ID}&response_type=code&state=${stateNonce}`);
}

module.exports = conductorInitCall;
