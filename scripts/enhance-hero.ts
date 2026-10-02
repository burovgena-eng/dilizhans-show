import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function run() {
  const zai = await ZAI.create();
  const inFile = '/home/z/my-project/public/images/real/ball_1_f3cc7966.jpg';
  const outFile = '/home/z/my-project/public/images/hero-luxury.png';
  const buf = fs.readFileSync(inFile);
  const dataUrl = `data:image/jpeg;base64,${buf.toString('base64')}`;

  const prompt = `Transform this costume photo into a luxury cinematic editorial photograph. Apply dramatic dark theatrical atmosphere with deep emerald green background and antique gold rim lighting. Add subtle golden particles and warm golden glow around the subject. Remove any text watermarks and visible text completely. Preserve the exact costume, model pose and composition. Premium fashion magazine aesthetic, ultra detailed, dark moody luxury baroque theatre stage. Cinematic depth of field with golden bokeh.`;

  console.log('🎨 editing image...');
  const res = await zai.images.generations.edit({
    prompt,
    images: [{ url: dataUrl }],
    size: '1344x768',
  });
  const b64 = res.data[0].base64;
  fs.writeFileSync(outFile, Buffer.from(b64, 'base64'));
  console.log(`✅ saved ${outFile} (${fs.statSync(outFile).size} bytes)`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
