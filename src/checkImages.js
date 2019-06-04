import path from 'path'
import fs from 'fs'

import dotenv from 'dotenv'
dotenv.config()

function getImageMeta(index) {
    const imageMetaPath = path.resolve(process.env.IMAGES_META_DIR, `${index}.meta.json`)
    if (!fs.existsSync(imageMetaPath)) {
        return null
    }
    const file = fs.readFileSync(imageMetaPath)
    if (!file) {
        return null
    }
    try {
        return JSON.parse(file)
    } catch (err) {
        return null
    }
}

function getImageSavePath(index) {
    return path.resolve(process.env.IMAGE_DATA_DIR, `${index}.image.jpg`)
}

function main() {

    const minIndex = parseInt(process.env.SITE_PAGE_MIN_ID)
    const maxIndex = parseInt(process.env.SITE_PAGE_MAX_ID)
    const brokenImagesIndex = []
    for (let i = minIndex; i <= maxIndex; i++) {
        let stat
        try {
            stat = fs.statSync(getImageSavePath(i))
        } catch (e) {

        }
        if (stat) {
            let meta = getImageMeta(i)
            let contentLength = meta.contentLength
            if (stat.size.toString() !== meta.contentLength) {
                brokenImagesIndex.push(i)
                console.log(`file ${i} error: expected size ${meta.contentLength} but ${stat.size}`)
            }
        }
    }

    const brokenImagesPath = path.resolve(process.env.IMAGES_META_DIR, `broken-images-index.json`)
    fs.writeFileSync(brokenImagesPath, JSON.stringify(brokenImagesIndex, null, 4))

    const brokenCount = brokenImagesIndex.length
    if (brokenCount !== 1) {
        console.log(`done. ${brokenCount} broken images found.`)
    } else {
        console.log(`done. 1 broken image found.`)
    }
}

main()
