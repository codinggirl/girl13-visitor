
import {startIndex, endIndex} from './config.js'
import fetchContent from './fetchContent.js'
import saveData from './saveData.js';
import prepareTable from './prepareTable.js'

async function main() {

    await prepareTable()

    let ps = []
    let maxRunning = 100
    // url
    let j = 0
    for (let i = startIndex; i <= endIndex; i++) {
        if (j === maxRunning) {
            j = 0

            let result = await Promise.all(ps)
            let saveImagePs = []
            result.map(item => {
                saveImagePs.push(saveData(item))
            })
            await Promise.all(saveImagePs)

            // save images
            ps = []
        }
        let url = `http://www.girl13.com/${i}.html`
        let p = fetchContent(url)
        ps.push(p)

        j++
    }
}

(async () => {
    await main()
})()
