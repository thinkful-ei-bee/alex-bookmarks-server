const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const store = require('../store')
const{PORT}=require('../config')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
  .route('/bookmarks')
  .get((req, res) => {
    // move implementation logic into here
    res.json(store.bookmarks)
  })
  .post(bodyParser, (req, res) => {
    // move implementation logic into here
    const { title, url, description, rating } = req.body
    if(!title){
      logger.error(`No title entered`)
      return res.status(400).send(`title must not be blank`)
    }

    if(!url || !(url.substring(0,8)==='https://' || url.substring(0,7)==='http://')){
        logger.error(`URL not in correct format`)
        return res.status(400).send(`must input url with http(s)://`)
      }

    if (!rating || !Number.isInteger(rating) || rating < 0 || rating > 5) {
        logger.error(`Rating must be between 0-5`)
        return res.status(400).send(`Rating must be between 0-5`)
    }

    const bookmarks = {id:uuid(),title,url,description,rating}

    store.bookmarks.push(bookmarks);
    res.status(200).location(`http://localhost:${PORT}/bookmarks/${bookmarks.id}`).json(bookmarks)

  })

bookmarksRouter
  .route('/bookmarks/:id')
  .get((req, res) => {
    // move implementation logic into here
    const {id} = req.params
    console.log(id);
    const bookmark = store.bookmarks.find(i=>i.id===id)
    if(!bookmark){
        logger.error(`Bookmark with id ${id} not found.`);
        return res.status(404).send('Not valid bookmark id')
    }

    res.json(bookmark)
  })
  .delete((req, res) => {
    // move implementation logic into here
    const { id } = req.params;

   const bookmarkPlace = store.bookmarks.findIndex(i => i.id == id);
   console.log(id);
   if (bookmarkPlace === -1) {
     logger.error(`bookmark with id ${id} not found.`);
     return res
       .status(404)
       .send('Not found');
   }

   console.log("got here");

   store.bookmarks.splice(bookmarkPlace, 1);

   logger.info(`Bookmark with id ${id} deleted.`);

   res
     .status(204)
     .end();
  })

module.exports = bookmarksRouter