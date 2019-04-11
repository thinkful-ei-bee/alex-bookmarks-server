const express = require('express')
const path = require('path')
const uuid = require('uuid/v4')
const xss = require('xss')
const logger = require('../logger')
const store = require('../store')
const{PORT}=require('../config')
const bookmarkDatabase = require('./bookmarkDatabse')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

const setBookmark = bookmark =>({
  id:bookmark.id,
  title:xxs(bookmark.title),
  link:bookmark.link,
  description:xss(bookmark.description),
  rating:Number(bookmark.rating),
})

bookmarksRouter
  .route('/')
  .get((req, res) => {
    // move implementation logic into here
    bookmarkDatabase.getAllBookmarks(req.app.get('db'))
      .then(bookmarks =>{
        res.json(bookmarks.map(setBookmark))
      })
    
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

    bookmarkDatabase.addBookmark(req.app.get('db'),bookmarks)
      .then(bookmark =>{
        res.status(200).location(path.posix.join(req.originalUrl,`${bookmark.id}`)).json(setBookmark(bookmark))
      })
    

  })

bookmarksRouter
  .route('/:id')
  .get((req, res) => {
    // move implementation logic into here
    const {id} = req.params
    //const bookmark = store.bookmarks.find(i=>i.id===id)
    bookmarkDatabase.getById(req.app.get('db'),id)
      .then(bookmark =>{
        if(!bookmark){
          logger.error(`Bookmark with id ${id} not found.`);
          return res.status(404).send('Not valid bookmark id')
        }
      })
    res.json(setBookmark(bookmark))
  })
  .delete((req, res) => {
    // move implementation logic into here
    const { id } = req.params;

   //const bookmarkPlace = store.bookmarks.findIndex(i => i.id == id);
   bookmarkDatabase.deleteBookmark(req.app.get('db'),id)
    .then(() =>{
      logger.info(`Bookmark with id ${id} deleted.`);
      res.status(204).end();
    })

  })

  .patch(bodyParser,(req,res,next)=>{
    const { title, url, description, rating } = req.body
    const newBookmark ={title,url,description,rating}
    bookmarkDatabase.updateBookmark(req.app.get('db'),req.params.id,newBookmark)
      .then(()=>{
        res.status(204).end()
      })
  })

module.exports = bookmarksRouter