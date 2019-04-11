const knex = require('knex')
const app = require('../src/app')

describe('App', () => {
  let db 
  let testBookmarks = [
    {
       id: 1,
       title: 'Google',
       url: 'https://google.com',
       description:'search engine',
       rating: 5
    },
    {
      id: 2,
      title: 'Wikipedia',
      url: 'https://wikipedia.org',
      description:'wiki',
      rating: 3
    },
    {
      id: 3,
      title: 'Youtube',
      url: 'https://youtube.com',
      description:'videos',
      rating: 5
    },
  ]
  let badBookmarks ={
    id:100,
    title:'dangerous <script>alert("xss");</script>',
    url:'https://google.com',
    description:`FAKE NEWS <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    rating:1
  }

  let expectedBookmarks={
    ...badBookmarks,
    title:'dangerous &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    description: `FAKE NEWS <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  }

  before('make db instance',()=>{
    db = knex({
      client: 'pg',
      connection:process.env.TEST_DB_URL,
    })
    app.set('db',db)
  })

  after(() => db.destroy())

  before(() => db('bookmarks').truncate())

  afterEach(() => db('bookmarks').truncate())

  describe('getting bookmarks',()=>{
    context('given bookmarks has no data',()=>{
      it('responds with 200', ()=>{
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
          .expect(200,[])
      })
    })

    context(`Given 'bookmarks' has data`, () => {
      beforeEach(() => {
        return db
            .into('bookmarks')
            .insert(testBookmarks)
      })
      
      it(`getAllBookmarks() resolves all bookmarks from 'bookmarks table`, () => {
        return supertest(app)
        .get('/bookmarks')
        .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
        .expect(200,testBookmarks)
      })
      
      it('responds with 204 and removes the bookmark', () => {
        const idToRemove = 2
        const expected = testBookmarks.filter(bookmark => bookmark.id !== idToRemove)
          return supertest(app)
             .delete(`/bookmarks/${idToRemove}`)
             .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
             .expect(204)
             .then(() =>
                supertest(app)
                  .get(`/bookmarks`)
                  .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
                  .expect(expected)
              )
      })
    })

    it('addBookmarks creates a new item in bookmark table', ()=>{
      const newBookmark ={
        title:'test',
        url:'https://test.com',
        description:'testing',
        rating: 4,
      }

      return supertest(app)
        .post('/bookmarks')
        .send(newBookmark)
        .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
        .expect(201)
        .expect(res=>{
          expect(res.body.title).to.eql(newBookmark.title)
          expect(res.body.url).to.eql(newBookmark.url)
          expect(res.body.description).to.eql(newBookmark.description)
          expect(res.body.rating).to.eql(newBookmark.rating)
        })
    })

  })

  context(`Given an XSS attack bookmark`, () => {

    beforeEach('insert bad bookmark', () => {
      return db
        .into('bookmarks')
        .insert([badBookmarks])
    })

    it('removes XSS attack content', () => {
      return supertest(app)
        .get(`/bookmarks/${badBookmarks.id}`)
        .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
        .expect(200)
        .expect(res => {
          expect(res.body.title).to.eql(expectedBookmarks.title)
          expect(res.body.description).to.eql(expectedBookmarks.description)
        })
    })
  })

  describe(`PATCH /bookmarks/:id`,()=>{
    context('Given no bookmarks', ()=>{
      it('responds with 404', ()=>{
        const id = 99999
        return supertest(app)
          .patch(`/bookmarks/${id}`)
          .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
          .expect(404,'Not valid bookmark id')
      })
    })

    beforeEach('insert bookmarks', () => {
      return db
        .into('bookmarks')
        .insert(testBookmarks)
    })

    it('responds with 400 if no data was given',()=>{
      const newId=2
      const newBookmark={}
      return supertest(app)
        .patch(`/bookmarks/${newId}`)
        .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
        .send(newBookmark)
        .expect(400)
    })

    it('responds with 204 and updates', ()=>{
      const newId =2
      const newBookmark ={
        id:2,
        title: 'new title',
        url: 'https://newlink.com',
        description: 'new desc',
        rating: 5,
      }

      return supertest(app)
        .patch(`/bookmarks/${newId}`)
        .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
        .send(newBookmark)
        .expect(204).then(res=>
           supertest(app)
            .get(`/bookmarks/${newId}`)
            .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
            .expect(newBookmark)
        )
    })

  })

})
