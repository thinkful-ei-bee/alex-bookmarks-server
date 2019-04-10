const bookmarkDatabase ={
    getAllBookmarks(knex){
        return knex.select('*').from('bookmarks')
    },
    getById(knex,id){
        return knex.from('bookmarks').select('*').where('id', id).first()
    },
    addBookmark(knex,newBookmark){
        return knex
        .insert(newArticle)
        .into('bookmarks')
        .returning('*')
        .then(rows=>{
            return rows[0]
        })
    },
    deleteBookmark(knex,id){
        return knex('bookmarks')
             .where({ id })
             .delete()
    },
    updateBookmark(knex,id,newBookmarkFields){
        return knex('bookmarks')
        .where({ id })
        .update(newArticleFields)
    
    },
}

module.exports = bookmarkDatabase