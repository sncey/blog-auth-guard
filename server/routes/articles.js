const express = require('express');
const Article = require('./../models/article');
const router = express.Router();
const { onlyAuthenticated, onlyAuthor } = require('../middleware/Auth');

router.get('/new', onlyAuthenticated, (req, res) => {
  res.render('articles/new', { article: new Article() });
});

router.get('/edit/:id', onlyAuthenticated, async (req, res) => {
  const article = await Article.findById(req.params.id);
  res.render('articles/edit', { article: article });
});

router.get('/:slug', async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug });
  if (article == null) res.redirect('/');
  res.render('articles/show', { article: article });
});

router.post(
  '/',
  onlyAuthenticated,
  async (req, res, next) => {
    req.article = new Article();
    next();
  },
  saveArticleAndRedirect('new')
);

router.put(
  '/:id',
  onlyAuthenticated,
  onlyAuthor,
  async (req, res, next) => {
    req.article = await Article.findById(req.params.id);
    next();
  },
  saveArticleAndRedirect('edit')
);

router.delete('/:id', onlyAuthenticated, onlyAuthor, async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (error) {
    res.status(403).json({ msg: error.message });
  }
});

function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article;
    article.title = req.body.title;
    article.snippet = req.body.snippet;
    article.markdown = req.body.markdown;
    try {
      article.author = req.session?.user?.id ?? null;
      article = await article.save();
      res.redirect(`/articles/${article.slug}`);
    } catch (e) {
      console.log(e);
      res.render(`articles/${path}`, { article: article });
    }
  };
}

module.exports = router;
