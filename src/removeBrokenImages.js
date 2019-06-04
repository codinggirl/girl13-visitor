import fs from 'fs'
import path from 'path'

import dotenv from 'dotenv'
dotenv.config()

function getImageSavePath(index) {
    return path.resolve(process.env.IMAGE_DATA_DIR, `${index}.image.jpg`)
}

function main() {
    const brokenImagesPath = path.resolve(process.env.IMAGES_META_DIR, `broken-images-index.json`)
    if (fs.existsSync(brokenImagesPath)) {
        let images = []
        try {
            images = JSON.parse(fs.readFileSync(brokenImagesPath))
        } catch (e) {

        }

        images.map(index => {
            const filePath = getImageSavePath(index)
            try {
                fs.unlinkSync(filePath)
            } catch (e) {

            }
        })
    }
}

main()
