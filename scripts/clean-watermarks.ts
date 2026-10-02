import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

// Photos to clean (remove watermark) — the most visible ones
const PHOTOS = [
  // Collections (6) + Hero (1) — uses ball_1 for hero
  { src: 'ball_1_f3cc7966.jpg', out: 'ball_1_clean.jpg' }, // HERO + collection
  { src: 'newyear_2_405a636d.jpg', out: 'newyear_2_clean.jpg' },
  { src: 'retro_1_1c256a6b.jpg', out: 'retro_1_clean.jpg' },
  { src: 'historical_5_fdca73c5.jpg', out: 'historical_5_clean.jpg' },
  { src: 'spanish_1_c3c0b2a3.jpg', out: 'spanish_1_clean.jpg' },
  { src: 'halloween_1_de232ce9.jpg', out: 'halloween_1_clean.jpg' },
  // Offers (3)
  { src: 'retro_2_36431bdc.jpg', out: 'retro_2_clean.jpg' },
  { src: 'gypsy_2_9da76b78.jpg', out: 'gypsy_2_clean.jpg' },
  { src: 'eastern_6_1e61fdc9.jpg', out: 'eastern_6_clean.jpg' },
  // Booking side
  { src: 'wedding_3_b0679951.jpg', out: 'wedding_3_clean.jpg' },
];

const DIR = '/home/z/my-project/public/images/real';
const PROMPT = `Remove the text watermark 'dilizhans-show.ru' / 'dilizhans show' / 'DILIZHANS-SHOW' visible anywhere in this photo. Restore the underlying area to look natural — same background color, same fabric, same lighting. DO NOT change the costume, model, pose, colors, or anything else. Just clean the watermark. Output exactly the same composition and framing.`;

async function run() {
  const zai = await ZAI.create();
  for (const job of PHOTOS) {
    const inFile = path.join(DIR, job.src);
    const outFile = path.join(DIR, job.out);
    if (fs.existsSync(outFile) && fs.statSync(outFile).size > 5000) {
      console.log(`⏭  skip ${job.out} (exists)`);
      continue;
    }
    if (!fs.existsSync(inFile)) {
      console.log(`✗ source missing: ${job.src}`);
      continue;
    }
    try {
      const buf = fs.readFileSync(inFile);
      const dataUrl = `data:image/jpeg;base64,${buf.toString('base64')}`;
      console.log(`🎨 cleaning ${job.src}...`);
      const res = await zai.images.generations.edit({
        prompt: PROMPT,
        images: [{ url: dataUrl }],
        size: '1024x1024',
      });
      const b64 = res.data[0].base64;
      fs.writeFileSync(outFile, Buffer.from(b64, 'base64'));
      console.log(`✅ saved ${job.out} (${fs.statSync(outFile).size} bytes)`);
    } catch (e: any) {
      console.error(`❌ ${job.src}: ${e.message}`);
    }
  }
  console.log('🎉 done');
}

run().catch((e) => { console.error(e); process.exit(1); });
