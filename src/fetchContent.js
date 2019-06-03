import got from 'got'
import htmlParser from 'fast-html-parser'
import uuidv4 from 'uuid/v4.js'

async function fetchContent(url) {
    let p = got(url).catch(e => null)
    let result = await p
    if (result) {
        let root = htmlParser.parse(result.body)
        let title = root.querySelector('h1 a')
        let tags = root.querySelectorAll('.p-tags a')
        let time = root.querySelector('time')
        let img = root.querySelector('.post-content img')
        let item = {
            id: uuidv4(),
            title: title.text,
            tags: tags.map(v => v.text).join(','),
            time: time.attributes.datetime,
            img: img.attributes.src
        }
        return item
    }
    return null
}

export default fetchContent
