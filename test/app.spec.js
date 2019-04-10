const knex = require('knex')
const app = require('../src/app')

describe('App', () => {
  let db 
  let testBookmarks = [
    {
       id: 1,
       title: 'Google',
       link: 'https://google.com',
       description:'search engine',
       rating: '5'
    },
    {
      id: 2,
      title: 'Wikipedia',
      link: 'https://wikipedia.org',
      description:'wiki',
      rating: '3'
    },
    {
      id: 3,
      title: 'Youtube',
      link: 'https://youtube.com',
      description:'videos',
      rating: '5'
    },
]

  before('make db instance',()=>{
    db = knex({
      client: 'pg',
      connection:process.env.TEST_DB_URL,
    })
    app.set('db',db)
  })

  before(() => db('bookmarks').truncate())

  afterEach(() => db('bookmarks').truncate())

  after(() => db.destroy())

  describe('getting bookmarks',()=>{
    context('given bookmarks has no data',()=>{
      it('responds with 200', ()=>{
        return supertest(app)
          .get('/bookmarks')
          .expect(200,[])
      })
    })

    context(`Given 'bookmarks' has data`, () => {
      beforeEach(() => {
        return db
            .into('bookmarks')
            .insert(testBookmarks)
      })
      
      it(`getAllBookmarks() resolves all articles from 'bookmarks table`, () => {
        // test that ArticlesService.getAllArticles gets data from table
        return supertest(app)
        .get('/bookmarks')
        .expect(200,testBookmarks)
      })
      

    })

    //context delete bookmark

    //updated bookmark

    it('addBookmarks creates a new item in bookmark table', ()=>{
      const newBookmark ={
        title:'test',
        url:'https://test.com',
        description:'testing',
        rating:'4',
      }
      return supertest(app)
        .post('/bookmarks')
        .send(newBookmark)
        .expect(201)
        .expect(res=>{
          expect(res.body.title).to.eql(newBookmark.title)
          expect(res.body.link).to.eql(newBookmark.link)
          expect(res.body.description).to.eql(newBookmark.description)
          expect(res.body.rating).to.eql(newBookmark.rating)
        })
    })

  })

})
