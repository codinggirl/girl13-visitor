

import fetchContent from './fetchContent.js'
import fs from 'fs'
import path from 'path'
import got from 'got'
import dotenv from 'dotenv'
import _debug from 'debug'
import moment from 'moment-timezone'

dotenv.config()
const debug = _debug('...')

async function main() {

    console.log('task started.')

    console.log('prepare urls.')
    let pendingPages = []
    const startIndex = parseInt(process.env.SITE_PAGE_MIN_ID)
    const endIndex = parseInt(process.env.SITE_PAGE_MAX_ID)
    for (let i = startIndex; i <= endIndex; i++) {
        let url = `http://www.girl13.com/${i}.html`
        pendingPages.push({
            index: i,
            url: url
        })
    }
    console.log('prepare urls done.')

    console.log('fetch contents.')
    while (pendingPages.length > 0) {
        const size = process.env.MAX_TASK_COUNT
        const currentItems = pendingPages.splice(0, size)
        const ps = currentItems.map(async page => {
            // meta
            let metaFilePath = path.resolve(process.env.META_DATA_DIR, `${page.index}.meta.json`)
            if (!fs.existsSync(metaFilePath)) {
                let p = await fetchContent(page.url)
                if (p) {
                    p.index = page.index
                    p.created_at = moment.tz('Asia/Shanghai').format()
                    
                    console.log(`write data to: ${metaFilePath}`)
                    fs.writeFileSync(metaFilePath, JSON.stringify(p, null, 4))
                }
            }
            // img
            if (fs.existsSync(metaFilePath)) {
                let imageFilePath = path.resolve(process.env.IMAGE_DATA_DIR, `${page.index}.image.jpg`)
                if (!fs.existsSync(imageFilePath)) {
                    try {
                        let meta = JSON.parse(fs.readFileSync(metaFilePath))
                        got.stream(meta.img).pipe(fs.createWriteStream(imageFilePath))
                    } catch (e) {
                        debug(e)
                    }
                }
            }         
        })
        await Promise.all(ps)
    }
    console.log('fetch contents done.')
}

(async () => {
    await main()
})()
