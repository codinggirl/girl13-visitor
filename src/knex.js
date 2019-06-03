import _knex  from 'knex'
import dotenv from 'dotenv'
dotenv.config()

const knex = _knex({
    client: 'sqlite3',
    connection: {
        filename: process.env.SQLITE_FILE_NAME
    }
})

export default knex
