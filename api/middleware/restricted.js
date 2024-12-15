const jwt = require('jsonwebtoken');

function restricted(req, res, next) {
    const token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'token required' });
    }
  const tokenValue = token.slice(7);
  jwt.verify(tokenValue, process.env.JWT_SECRET || 'shh', (err, decodedToken) => {
        if (err) {
            console.error('Token invalid:', err);
            return res.status(401).json({ message: 'token invalid' });
        }
        req.user = decodedToken;
       next();
  });
}

module.exports = { restricted };
  /*
    IMPLEMENT

    1- On valid token in the Authorization header, call next.

    2- On missing token in the Authorization header,
      the response body should include a string exactly as follows: "token required".

    3- On invalid or expired token in the Authorization header,
      the response body should include a string exactly as follows: "token invalid".
  */

