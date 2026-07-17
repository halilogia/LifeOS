async function test() {
  try {
    const res = await fetch('https://halkarz.com');
    const text = await res.text();
    
    // We want to extract <article class="index-list"> blocks
    const articleRegex = /<article class="index-list">([\s\S]*?)<\/article>/g;
    let match;
    const articles = [];
    
    while ((match = articleRegex.exec(text)) !== null && articles.length < 15) {
      const content = match[1];
      
      // Extract Company Name
      const nameMatch = content.match(/<h3 class="il-halka-arz-sirket"><a href="[^"]*" title="([^"]*)">/i);
      const name = nameMatch ? nameMatch[1] : '';
      
      // Extract Url
      const urlMatch = content.match(/<a href="([^"]*)" class="[^"]*"|href="([^"]*)"/i);
      const url = urlMatch ? (urlMatch[1] || urlMatch[2]) : '';
      
      // Extract Ticker / Code
      const tickerMatch = content.match(/<span class="il-bist-kod">([\s\S]*?)<\/span>/i);
      const tickerRaw = tickerMatch ? tickerMatch[1].replace(/<[^>]*>/g, '').trim() : '';
      
      // Extract Dates
      const dateMatch = content.match(/<time datetime="[^"]*" title="([^"]*)"/i) || content.match(/<time[^>]*>([\s\S]*?)<\/time>/i);
      const dateRaw = dateMatch ? dateMatch[1].replace(/<[^>]*>/g, '').trim() : '';
      
      // Extract Badge (e.g. Gong!, Yeni!, etc.)
      const badgeMatch = content.match(/<div class="il-(new|gong|tarih|spk)">([\s\S]*?)<\/div>/i) || content.match(/<div class="il-[^"]*">([\s\S]*?)<\/div>/i);
      const badge = badgeMatch ? badgeMatch[1].replace(/<[^>]*>/g, '').trim() : '';

      articles.push({
        name,
        url,
        ticker: tickerRaw,
        date: dateRaw,
        badge
      });
    }
    
    console.log(JSON.stringify(articles, null, 2));
  } catch (err) {
    console.error(err);
  }
}

test();
