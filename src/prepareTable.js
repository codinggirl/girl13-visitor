import knex from './knex.js'

async function prepareTable() {
    let exists = await knex.schema.hasTable('contents')
    if (!exists) {
        await knex.schema.createTable('contents', function (t) {
            t.uuid('id').primary()
            t.string('title')
            t.string('tags')
            t.string('time')
            t.boolean('img')
        })
    }
}

export default prepareTable
