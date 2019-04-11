'use strict';
const express = require('express');
const path = require('path');
const xss = require('xss');
const logger = require('../logger');
const bookmarkDatabase = require('./bookmarkDatabase');

const bookmarksRouter = express.Router();
const bodyParser = express.json();

const setBookmark = bookmark =>({
  id:bookmark.id,
  title:xss(bookmark.title),
  url:bookmark.url,
  description:xss(bookmark.description),
  rating:Number(bookmark.rating),
});

bookmarksRouter
  .route('/api/bookmarks')
  .get((req, res) => {
    // move implementation logic into here
    bookmarkDatabase.getAllBookmarks(req.app.get('db'))
      .then(bookmarks =>{
        res.json(bookmarks.map(setBookmark));
      });
    
  })
  .post(bodyParser, (req, res, next) => {
    // move implementation logic into here
    const { title, url, description, rating } = req.body;
    if(!title){
      logger.error('No title entered');
      return res.status(400).send('title must not be blank');
    }

    if(!url || !(url.substring(0,8)==='https://' || url.substring(0,7)==='http://')){
      logger.error('URL not in correct format');
      return res.status(400).send('must input url with http(s)://');
    }

    if (!rating || !Number.isInteger(rating) || rating < 0 || rating > 5) {
      logger.error('Rating must be between 0-5');
      return res.status(400).send('Rating must be between 0-5');
    }

    const bookmarks = {title,url,description,rating};

    bookmarkDatabase.addBookmark(req.app.get('db'),bookmarks)
      .then(bookmark =>{
        res.status(201).location(path.posix.join(req.originalUrl,`${bookmark.id}`)).json(setBookmark(bookmark));
      })
      .catch(next);
    

  });

bookmarksRouter
  .route('/api/bookmarks/:id')
  .get((req, res, next) => {
    // move implementation logic into here
    const {id} = req.params;
    //const bookmark = store.bookmarks.find(i=>i.id===id)
    bookmarkDatabase.getById(req.app.get('db'),id)
      .then(bookmark =>{
        if(!bookmark){
          logger.error(`Bookmark with id ${id} not found.`);
          return res.status(404).send('Not valid bookmark id');
        }
        res.json(setBookmark(bookmark));
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    const { id } = req.params;
    bookmarkDatabase.deleteBookmark(req.app.get('db'),id)
      .then(() =>{
        logger.info(`Bookmark with id ${id} deleted.`);
        res.status(204).end();
      })
      .catch(next);

  })

  .patch(bodyParser,(req, res, next)=>{
    const { title, url, description, rating} = req.body;
    const{id}=req.params;
    const newBookmark ={title,url,description,rating};

    bookmarkDatabase.getById(req.app.get('db'),id)
      .then(bookmark =>{
        if(!bookmark){
          logger.error(`Bookmark with id ${id} not found.`);
          return res.status(404).send('Not valid bookmark id').end();
        }
        else if(!title && !url && !description && !rating){
          logger.error('No data submitted to patch');
          return res.status(400).end();
        }
        else{
          bookmarkDatabase.updateBookmark(req.app.get('db'),id,newBookmark)
            .then(()=>{
              res.status(204).end();
                
            }).catch(next);
        }
      }).catch(next);
  });

module.exports = bookmarksRouter;