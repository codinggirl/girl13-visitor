import got from 'got'
import htmlParser from 'fast-html-parser'
import uuidv4 from 'uuid/v4.js'

async function fetchContent(url) {
    let body
    try {
        let result = await got(url)
        body = result.body
    } catch (error) {
        if (error.statusCode === 404) {
            return notFound()
        } else {
            return serviceBusy()
        }
    }

    if (!body) {
        return notFound()
    }

    let item = parseInfo(body)
    if (item && item.img) {
        return found(item)
    } else {
        return notFound()
    }
}

function parseInfo(html) {
    let item = null
    let root = htmlParser.parse(html)
    if (root) {
        let title = root.querySelector('h1 a')
        let tags = root.querySelectorAll('.p-tags a')
        let time = root.querySelector('time')
        let img = root.querySelector('.post-content img')
        item = {
            id: uuidv4(),
            title: title && title.text || '',
            tags: (tags || []).map(v => v.text).join(','),
            time: (time && time.attributes && time.attributes.datetime) || '',
            img: (img && img.attributes && img.attributes.src) || ''
        }
    }
    return item
}

function notFound() {
    return {
        content: null,
        notFound: true
    }
}

function found(content) {
    return {
        content: content,
        notFound: false
    }
}

function serviceBusy() {
    return {
        content: null,
        notFound: false
    }
}

export default fetchContent
