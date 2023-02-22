

const conductorCourseInfoCall = (req, res, redirect_url, conductor_api_url) => {
  if (!req.cookies.analytics_conductor_access || !req.cookies.analytics_conductor_refresh) {
    return res.redirect(redirect_url); // need to sign in
  }
  var courseID = req.cookies.analytics_conductor_course_id;
  return axios.get(`${conductor_api_url}/analytics/courses/`+courseID, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest', // non-auth routes need this header for CSRF protection
      'Authorization': `Bearer ${req.cookies.analytics_conductor_access}`,
    },
  }).then((conductorRes) => {
    if (!conductorRes.data.err) {
      res.json(conductorRes.data)
    } else {
      throw (new Error(conductorRes.data.errMsg)); // some error happened, more detail in msg
    }
  }).catch((err) => {
    if (err.response?.data?.expired_token) {
      console.error('expired_token'); // get new token and start over
    } else {
      console.error(err);
    }
    return res.status(500).send({
      msg: 'unknown error!',
    });
  });
}

module.exports = conductorCourseInfoCall;
