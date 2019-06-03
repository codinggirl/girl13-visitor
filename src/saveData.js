import knex from './knex.js'

async function saveData(meta) {
    if (meta) {
        try {
            let item = await knex.from('contents').count('id as count').where({
                img: meta.img
            })
            if (item[0].count === 0) {
                try {
                    console.log(meta)
                    await knex('contents').insert(meta)
                } catch (e) {
                    console.log(e)
                }
                
            }
        } catch (e) {
            console.log(e)
        }
    }
}

export default saveData
