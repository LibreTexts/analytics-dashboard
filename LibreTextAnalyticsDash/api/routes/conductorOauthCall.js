const url = require('url');
/**
 * Receive the authorization code from Conductor and exchange it for access and refresh tokens.
 */
const conductorOauthCall = (req, res, env, homepage, dashboard_url) => {
  /* Check required values */
  if (!req.query.code) {
    return res.status(400).send({
      msg: 'Missing auth code!',
    });
  }
  if (!req.cookies.analytics_conductor_oauth_state) {
    return res.status(400).send({
      msg: 'Missing state nonce!',
    });
  }

  /* Verify the state nonce is the same -- deny if mismatch */
  if (req.cookies.analytics_conductor_oauth_state !== req.query.state) {
    return res.status(400).send({
      msg: 'Invalid state nonce!',
    });
  }

  /*
   * Build the data to send with the request - use URLSearchParams to
   * send it in the required "application/x-www-form-urlencoded" format.
   *
   * The same data is required when access_token expires; swap 'code' field for
   * 'refresh_token' field and set 'grant_type' to 'refresh_token'. Getting a
   * new access_token using refresh_token also issues a new refresh_token.
   *
   * If the authorization code OR refresh token is expired, the response includes
   * 'expired_grant': true. If the access token for any request is expired for any
   * request, the response includes 'expired_token': true.
   */
  const params = new url.URLSearchParams({
    grant_type: 'authorization_code',
    code: req.query.code,
    redirect_uri: homepage + 'oauth2.0/callback',
    client_id: env.CONDUCTOR_API_CLIENT_ID,
    client_secret: env.CONDUCTOR_API_CLIENT_SECRET,
  });
  axios.post(
    'https://commons.libretexts.org/api/v1/oauth2.0/accessToken',
    params.toString()
  ).then((conductorRes) => {
    // console.log(conductorRes.data);

    /*
     * Grab the tokens and save them to the browser for later use, then redirect
     * to Dashboard. 'Max-Age' could also be set to the 'expires_in' value
     * to automatically expire the access token.
     * Cookies should be Secure and HttpOnly: requests to Conductor should be routed through
     * the Analytics API to prevent XSS and CORS denial!
     */
    if (typeof (conductorRes.data.access_token) === 'string') {
      res.setHeader('Set-Cookie', [
        `analytics_conductor_access=${conductorRes.data.access_token}; Path=/; Domain=localhost; HttpOnly; Secure;`,
        `analytics_conductor_refresh=${conductorRes.data.refresh_token}; Path=/; Domain=localhost; HttpOnly; Secure;`,
      ]);
      res.cookie(`analytics_conductor_access`, conductorRes.data.access_token)
      res.cookie(`analytics_conductor_refresh`, conductorRes.data.refresh_token)
      return res.redirect(dashboard_url);
    }

    /* Something went wrong ... show user an error */
    throw (new Error('unknown'));
  }).catch((err) => {
    if (err.response?.data?.expired_grant) {
      console.error('auth_code_expired'); // start over?
    } else {
      console.error(err);
    }
    return res.status(500).send({
      msg: 'err!',
    });
  });
}

module.exports = conductorOauthCall;
