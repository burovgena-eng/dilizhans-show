import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const PHOTOS = [
  { src: 'adult_gatsby_05277.jpg', out: 'adult_gatsby_05277_clean.jpg' },
  { src: 'adult_gatsby_05278.jpg', out: 'adult_gatsby_05278_clean.jpg' },
];

const DIR = '/home/z/my-project/public/images/real';
const PROMPT = `Remove the text watermark 'dilizhans-show.ru' / 'dilizhans show' / 'DILIZHANS-SHOW' visible anywhere in this photo. Restore the underlying area to look natural — same background color, same fabric, same lighting. DO NOT change the costume, model, pose, colors, or anything else. Just clean the watermark. Output exactly the same composition and framing.`;

async function run() {
  const zai = await ZAI.create();
  for (const job of PHOTOS) {
    const inFile = `${DIR}/${job.src}`;
    const outFile = `${DIR}/${job.out}`;
    if (fs.existsSync(outFile) && fs.statSync(outFile).size > 5000) {
      console.log(`⏭  skip ${job.out}`);
      continue;
    }
    try {
      const buf = fs.readFileSync(inFile);
      const dataUrl = `data:image/jpeg;base64,${buf.toString('base64')}`;
      console.log(`🎨 cleaning ${job.src}...`);
      const res = await zai.images.generations.edit({
        prompt: PROMPT,
        images: [{ url: dataUrl }],
        size: '864x1152',
      });
      fs.writeFileSync(outFile, Buffer.from(res.data[0].base64, 'base64'));
      console.log(`✅ saved ${job.out} (${fs.statSync(outFile).size} bytes)`);
    } catch (e: any) {
      console.error(`❌ ${job.src}: ${e.message}`);
    }
  }
  console.log('🎉 done');
}

run().catch((e) => { console.error(e); process.exit(1); });
