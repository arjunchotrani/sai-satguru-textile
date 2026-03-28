import fs from 'fs';

export async function testUrl(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    const titleMatch = text.match(/<title>(.*?)<\/title>/i);
    const descMatch = text.match(/<meta name="description" content="([^"]+)">/i);
    const robotsMatch = text.match(/<meta name="robots" content="([^"]+)">/i);
    return {
      url,
      status: res.status,
      title: titleMatch ? titleMatch[1] : 'NOT FOUND',
      desc: descMatch ? descMatch[1] : 'NOT FOUND',
      robots: robotsMatch ? robotsMatch[1] : 'NOT FOUND'
    };
  } catch (e) {
    return { url, error: e.message };
  }
}

async function run() {
  const results = [];
  results.push(await testUrl('http://localhost:8788/'));
  results.push(await testUrl('http://localhost:8788/product/royal-georgette-set-mobk'));
  results.push(await testUrl('http://localhost:8788/product/invalid-slug-1234'));
  results.push(await testUrl('http://localhost:8788/brands'));
  results.push(await testUrl('http://localhost:8788/brand/alizeh-offical'));
  
  fs.writeFileSync('output_seo.json', JSON.stringify(results, null, 2));
}

run();
