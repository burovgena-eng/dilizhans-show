import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function run() {
  const zai = await ZAI.create();
  const inFile = '/home/z/my-project/public/images/old-logo.png';
  const outFile = '/home/z/my-project/public/images/logo-gold.png';
  const buf = fs.readFileSync(inFile);
  const dataUrl = `data:image/png;base64,${buf.toString('base64')}`;

  const prompt = `Recolor this logo. Keep the exact same shape (stylized letter "D" resembling a carnival mask or waving flag) and the text "Dilizhans-show" below. Change ALL colors to luxury antique gold gradient: top of D is bright gold #E6C775, bottom is deep bronze #8A6F2F. Text "Dilizhans-show" in matching gold #C9A961. Background stays transparent. Preserve transparency, sharp edges, and all details. No new elements, no new shadows.`;

  console.log('🎨 recoloring logo to gold...');
  const res = await zai.images.generations.edit({
    prompt,
    images: [{ url: dataUrl }],
    size: '1024x1024',
  });
  const b64 = res.data[0].base64;
  fs.writeFileSync(outFile, Buffer.from(b64, 'base64'));
  console.log(`✅ saved ${outFile} (${fs.statSync(outFile).size} bytes)`);
}

run().catch((e) => { console.error(e); process.exit(1); });
