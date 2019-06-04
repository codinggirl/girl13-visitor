import fetchContent from './fetchContent.js'
import fs from 'fs'
import path from 'path'
import got from 'got'
import dotenv from 'dotenv'
import _debug from 'debug'
import moment from 'moment-timezone'

dotenv.config()
const debug = _debug('...')

// fetch meta info
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

    // not found index
    let notFoundIndexList = []
    let notFoundFilePath = path.resolve(process.env.META_DATA_DIR, `not-found.json`)
    try {
        let notFoundContent = fs.readFileSync(notFoundFilePath)
        notFoundIndexList = JSON.parse(notFoundContent)
    } catch (e) {
        notFoundIndexList = []
        console.log(e)
    }

    console.log('fetch contents.')
    while (pendingPages.length > 0) {

        console.log(`processing: ${pendingPages[0].index}`)

        const size = parseInt(process.env.MAX_TASK_COUNT)
        const currentItems = pendingPages.splice(0, size)
        const ps = currentItems.map(async page => {
            // if not found list contains it, it should not be continue to spide.
            if (notFoundIndexList.indexOf(page.index) !== -1) {
                return
            }

            // meta
            let metaFilePath = path.resolve(process.env.META_DATA_DIR, `${page.index}.meta.json`)
            if (!fs.existsSync(metaFilePath)) {
                let p = await fetchContent(page.url)
                if (p.notFound) {
                    notFoundIndexList.push(page.index)
                    return
                }
                if (p.content) {
                    p.content.index = page.index
                    p.content.created_at = moment.tz('Asia/Shanghai').format()
                    
                    console.log(`write data to: ${metaFilePath}`)
                    fs.writeFileSync(metaFilePath, JSON.stringify(p.content, null, 4))
                }
            }
        })

        await Promise.all(ps)
        fs.writeFileSync(notFoundFilePath, JSON.stringify(notFoundIndexList, null, 4))
    }

    console.log('fetch contents done.')
}

(async () => {
    await main()
})()
