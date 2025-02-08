const axios = require('axios');
const cheerio = require('cheerio');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

async function scrapeExternalLinks(url) {
    console.log('\n🔍 Starting to scrape...');
    console.log('📫 Fetching webpage content...\n');

    try {
        const response = await axios.get(url);
        console.log('✅ Page content fetched successfully!\n');

        const $ = cheerio.load(response.data);
        console.log('🔎 Extracting external links...\n');

        const siteDomain = new URL(url).hostname;

        const externalLinks = new Set();

        $('a').each((_, element) => {
            const href = $(element).attr('href');
            if (href) {
                try {
                    const linkUrl = new URL(href, url);
                    if (linkUrl.hostname !== siteDomain && isValidUrl(linkUrl.href)) {
                        externalLinks.add(linkUrl.href);
                    }
                } catch (error) {
                }
            }
        });

        const links = Array.from(externalLinks);
        console.log('🎉 Scraping completed!\n');
        console.log(`Found ${links.length} unique external links:\n`);
        
        links.forEach((link, index) => {
            console.log(`${index + 1}. ${link}`);
        });

        return links;
    } catch (error) {
        console.error('\n❌ Error occurred while scraping:');
        console.error(error.message);
        return [];
    }
}

async function main() {
    rl.question('Please enter the website URL to scrape: ', async (url) => {
        if (!isValidUrl(url)) {
            console.error('\n❌ Invalid URL provided. Please enter a valid URL (e.g., https://example.com)');
            rl.close();
            return;
        }

        await scrapeExternalLinks(url);
        rl.close();
    });
}

rl.on('close', () => {
    console.log('\n👋 Scraping process completed. Goodbye!');
    process.exit(0);
});

main().catch(console.error);