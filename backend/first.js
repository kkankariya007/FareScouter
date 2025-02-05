const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Set a realistic viewport
    await page.setViewport({ width: 1366, height: 768 });

    // Edge user agents without Chrome
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edg/91.0.864.67',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edg/92.0.902.67',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edg/93.0.961.38'
    ];
    
    // Select a random user agent
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    await page.setUserAgent(randomUserAgent);

    const url = 'https://www.skyscanner.co.in/transport/flights/pnq/blr/241111/?adultsv2=1&cabinclass=economy&childrenv2=&ref=home&rtn=0&preferdirects=true&outboundaltsenabled=false&inboundaltsenabled=false';
    const url3='https://www.google.com/travel/flights/search?tfs=CBwQAhopEgoyMDI0LTExLTA3ag0IAhIJL20vMDE1eTJxcgwIAxIIL20vMDljMTdAAUgBcAGCAQsI____________AZgBAg'
    const url4='https://www.bing.com/travel/flight-search?q=flights+from+pnq-blr&src=pnq&des=blr&ddate=2024-12-16&isr=0&rdate=2024-12-19&cls=0&adult=1&child=0&infant=0&form=FLAFLI&entrypoint=FBSCOP';

    // Increase timeout for page load
    await page.goto(url4, { waitUntil: 'networkidle2', timeout: 30000 });

    // Introduce a random delay before checking for the selector
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000)); // Delay between 1 to 3 seconds

    // Wait for the specific selector
    await page.waitForSelector('.BpkText_bpk-text__ODgwN.BpkText_bpk-text--heading-4__Y2VlY', { timeout: 20000 });

    // Simulate scrolling down
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for a second after scrolling

    const html = await page.content();
    console.log('HTML of the page:');
    console.log(html);

    await browser.close();
  } catch (error) {
    console.error('Error:', error);
  }
})(); 
