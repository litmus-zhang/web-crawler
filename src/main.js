// For more information, see https://crawlee.dev/
import { PlaywrightCrawler, Dataset } from 'crawlee';

const crawler = new PlaywrightCrawler({
    requestHandler: async ({ request, enqueueLinks, page }) => {
        console.log(`Processing URL: ${request.url}\n`)

        if (request.label === 'DETAIL') {
        const urlParts = request.url.split('/').slice(-2);
        const uniqueIdentifier = urlParts.join('/');
        const owner = urlParts[0];
        const title = await page.locator('.ActorHeader-identificator > h1').textContent();
        const description = await page.locator('.ActorHeader-description').textContent();
        const modifiedTimestamp = await page.locator('.ActorHeader-userMedallion > li > time').getAttribute('datetime');
        const modified = new Date(Number(modifiedTimestamp));
        const runsRow = page.locator('ul.ActorHeader-userMedallion > li').filter({ hasText: 'Runs' });
        const runCountString = await runsRow.textContent().then(text => text.replace('Runs', '').trim());
        const runCount = Number(runCountString.replace(',', ''));

        const results = {
            url: request.url,
            uniqueIdentifier,
            owner,
            title,
            description,
            // modifiedTimestamp,
            modified,
            //runCount
            runCountString
        }
        console.log(results);
        await Dataset.pushData(results);
        } else {

            await page.waitForSelector('.ActorStorePagination-buttons a');
            await enqueueLinks({
                selector: '.ActorStorePagination-buttons > a',
                label: 'LIST'
            });

            await page.waitForSelector('.dSIEMQ');
            await enqueueLinks({
                selector: '.dSIEMQ',
                label: 'DETAIL'
            })
        }
    }
});
// Add first URL to the queue and start the crawl.
await crawler.run(['https://apify.com/store']);
