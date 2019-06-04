

import fetchContent from './fetchContent.js'
import fs from 'fs'
import path from 'path'
import got from 'got'
import dotenv from 'dotenv'
import _debug from 'debug'
import moment from 'moment-timezone'
import http from 'http'

dotenv.config()
const debug = _debug('...')

// fetch images
async function main() {
    let indexes = []
    const startIndex = parseInt(process.env.SITE_PAGE_MIN_ID)
    const endIndex = parseInt(process.env.SITE_PAGE_MAX_ID)
    for (let i = startIndex; i <= endIndex; i++) {
        indexes.push(i)
    }
    while (indexes.length > 0) {
        console.log(`begin task: ${indexes[0]}`)

        const size = process.env.MAX_TASK_COUNT
        const currentItems = indexes.splice(0, size)
        const ps = currentItems.map(async index => {
            let imageFilePath = getImageSavePath(index)
            if (!fs.existsSync(imageFilePath)) {
                let metaFilePath = path.resolve(process.env.META_DATA_DIR, `${index}.meta.json`)
                if (fs.existsSync(metaFilePath)) {
                    let meta = JSON.parse(fs.readFileSync(metaFilePath))
                    try {
                        await downloadImage(index, meta.img)
                    } catch (e) {
                        console.log(e)
                    }
                }
            }
        })

        await Promise.all(ps)
    }
}

function downloadImage(index, url) {
    return new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
            if (res.statusCode === 200) {

                const imageMetaPath = path.resolve(process.env.IMAGES_META_DIR, `${index}.meta.json`)
                const imageMeta = {
                    index: index,
                    url: url,
                    contentLength: res.headers['content-length'] || null,
                    contentType: res.headers['content-type'] || null,
                    lastModified: res.headers['last-modified'] || null,
                    createdAt: moment.tz('Asia/Shanghai').format()
                }
                fs.writeFileSync(imageMetaPath, JSON.stringify(imageMeta, null, 4))

                res.pipe(fs.createWriteStream(getImageSavePath(index)))
            }
            resolve()
        })
        req.on('timeout', (error) => {
            console.log(error)
            reject()
        })
        req.on('error', (error) => {
            console.log(error)
            reject(error)
        })
    })
}

function getImageSavePath(index) {
    return path.resolve(process.env.IMAGE_DATA_DIR, `${index}.image.jpg`)
}

(async () => {
    await main()
})()
