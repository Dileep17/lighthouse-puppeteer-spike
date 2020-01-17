const chromeLauncher = require('chrome-launcher');
const puppeteer = require('puppeteer');
const util = require('util');
const request = require('request');
const lighthouse = require('lighthouse');
const config = require('lighthouse/lighthouse-core/config/lr-desktop-config.js');
const reportGenerator = require('lighthouse/lighthouse-core/report/report-generator');
const fs = require('fs');

const URL = 'https://www.goibibo.com';
let browser;

function delay(timeout) {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
}

const perftest = async() => {

    const opts = {
        //chromeFlags: ['--headless'],
        logLevel: 'info',
        output: 'json',
        disableDeviceEmulation: true,
        defaultViewport: {
            width: 1200,
            height: 900
        },
        chromeFlags: ['--disable-mobile-emulation']
    };

    // Launch chrome using chrome-launcher
    const chrome = await chromeLauncher.launch(opts);
    opts.port = chrome.port;

    // Connect to it using puppeteer.connect().
    const resp = await util.promisify(request)(`http://localhost:${opts.port}/json/version`);
    const {webSocketDebuggerUrl} = JSON.parse(resp.body);
    browser = await puppeteer.connect({browserWSEndpoint: webSocketDebuggerUrl});
    
    page = (await browser.pages())[0];
    await page.setViewport({ width: 1200, height: 900});

    await page.goto(URL, {waitUntil: 'networkidle2'});


    // Run Lighthouse.
    const report = await lighthouse(page.url(), opts, config).then(results => {
        return results;
    });
    const html = reportGenerator.generateReport(report.lhr, 'html');
    const json = reportGenerator.generateReport(report.lhr, 'json');
    //Write report html to the file
    fs.writeFile('reports/report1.html', html, (err) => {
        if (err) {
            console.error(err);
        }
    });

    //Write report json to the file
    fs.writeFile('reports/report1.json', json, (err) => {
        if (err) {
            console.error(err);
        }
    });

    
    await delay(1000);    
    await page.type('[id="gosuggest_inputSrc"]', 'chennai');
    
    await delay(1000);    
    let selector = '[id="react-autosuggest-1-suggestion--0"]'
    page.waitForSelector(selector)
    await page.evaluate((selector) => document.querySelector(selector).click(), selector); 
    await page.click(selector)
    
    await delay(1000);    
    await page.type('[id="gosuggest_inputDest"]', 'hyderabad');
    
    await delay(1000);    
    page.waitForSelector(selector)
    await page.evaluate((selector) => document.querySelector(selector).click(), selector); 
    await page.click(selector)
    
    await delay(1000);    
    selector = '[class="DayPicker-Day DayPicker-Day--today DayPicker-Day--selected"]'
    await page.evaluate((selector) => 
        document.querySelector(selector).click(), selector);
    
    await delay(1000);    
    selector = '[id="gi_search_btn"]'
    await page.evaluate((selector) => document.querySelector(selector).click(), selector);
    
    await delay(3000);    

    // Run Lighthouse.
    const report2 = await lighthouse(page.url(), opts, config).then(results => {
        return results;
    });
    const html2 = reportGenerator.generateReport(report2.lhr, 'html');
    const json2 = reportGenerator.generateReport(report2.lhr, 'json');
    //Write report html to the file
    fs.writeFile('reports/report2.html', html2, (err) => {
        if (err) {
            console.error(err);
        }
    });

    //Write report json to the file
    fs.writeFile('reports/report2.json', json2, (err) => {
        if (err) {
            console.error(err);
        }
    });


    await delay(3000);    
    browser.close();
    await browser.disconnect();
    await chrome.kill();
};

const logErrorAndExit = err => {
    console.log(err);
    process.exit();
    
};

perftest().catch(logErrorAndExit);