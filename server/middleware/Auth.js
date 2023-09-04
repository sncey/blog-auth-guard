const Article = require('../models/article');

function onlyAuthenticated(req, res, next) {
  if (req.session.user) {
    // User is authenticated
    // Prevent accessing the sign-in and sign-up pages
    if (
      req.path.includes('/user/signin') ||
      req.path.includes('/user/signup')
    ) {
      return res.redirect('/');
    }
    next();
  } else {
    res.redirect('/user/signin');
  }
}

const authMiddleware = (req, res, next) => {
  if (req.session.user) {
    // User is authenticated
    if (
      req.path.includes('/user/signin') ||
      req.path.includes('/user/signup')
    ) {
      return res.redirect('user/authenticated');
    }
    next(); // Call the next middleware or route handler
  } else {
    // User is not authenticated
    res.redirect('/'); // Redirect to the sign-in page
  }
};

const onlyAuthor = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (article && article.author.equals(req.session.user.id)) {
      // User is the author of the article
      next();
    } else {
      // User is not the author of the article
      res.status(403).send('Forbidden');
    }
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
};

module.exports = {
  onlyAuthenticated,
  authMiddleware,
  onlyAuthor,
};
