const uuid = require('uuid/v4')

const bookmarks = [
  { id: uuid(),
    title: 'Wikipedia',
    url: 'https://www.wikipedia.org',
    description: 'wiki',
    rating: 5 
    },

  { id: uuid(),
    title: 'Google',
    url: 'https://www.google.com',
    description: 'Search Engine',
    rating: 5 
    },

  { id: uuid(),
    title: 'yahoo',
    url: 'https://www.yahoo.com',
    description: 'old email',
    rating: 2
    },
]

module.exports = { bookmarks }