import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images';

type Job = { name: string; prompt: string; size: string; subdir: string };

const jobs: Job[] = [
  // === Featured collections (6 cards) ===
  {
    name: 'newyear.jpg',
    subdir: 'collections',
    size: '1024x1024',
    prompt:
      'Luxurious New Year costume showcase, elegant golden and emerald green holiday outfit with sequined snowflake patterns, ornate masquerade mask with golden filigree, dark background with golden sparkles and snowflakes, premium fashion editorial, deep emerald and gold palette, cream ivory highlights, ultra detailed, cinematic lighting, professional photography',
  },
  {
    name: 'gatsby.jpg',
    subdir: 'collections',
    size: '1024x1024',
    prompt:
      '1920s Gatsby-style flapper dress in champagne gold and deep emerald, art deco beaded fringe, pearl headpiece with feathers, vintage glamour photography, dark moody background with golden art deco patterns, luxury editorial fashion, emerald and gold color palette, ultra detailed, cinematic',
  },
  {
    name: 'superhero.jpg',
    subdir: 'collections',
    size: '1024x1024',
    prompt:
      'Cinematic luxury superhero costume display, deep emerald and gold ornate hero suit with metallic golden emblem, dramatic theatrical lighting, dark background with golden energy particles, premium fashion editorial photography, ultra detailed, professional, emerald green gold palette',
  },
  {
    name: 'national.jpg',
    subdir: 'collections',
    size: '1024x1024',
    prompt:
      'Elegant Russian folk national costume with golden kokoshnik headdress, deep emerald velvet dress with gold embroidery and pearls, ornate traditional patterns, luxury museum-quality presentation, dark dramatic background, professional fashion editorial photography, emerald and gold palette, ultra detailed',
  },
  {
    name: 'evening.jpg',
    subdir: 'collections',
    size: '1024x1024',
    prompt:
      'Luxury evening gown in deep emerald silk with antique gold sequin detailing, elegant silhouette, sophisticated couture dress, dark elegant background with golden bokeh, high fashion editorial photography, emerald and gold palette, ivory highlights, ultra detailed, cinematic lighting',
  },
  {
    name: 'steampunk.jpg',
    subdir: 'collections',
    size: '1024x1024',
    prompt:
      'Luxury steampunk costume with brass and copper gears, emerald green velvet coat with antique gold buttons, leather corset details, Victorian goggles with golden rims, ornate baroque mechanical details, dark moody background with golden steam, premium editorial fashion photography, emerald gold palette, ultra detailed',
  },
  // === Special offers (3) ===
  {
    name: 'offer-gatsby.jpg',
    subdir: 'offers',
    size: '864x1152',
    prompt:
      'Promotional luxury photo: 1920s Gatsby-themed couple dancing, woman in champagne gold flapper dress with feathers, man in emerald green pinstripe tuxedo, art deco golden ballroom, cinematic editorial photography, emerald and gold palette, dark dramatic lighting, ultra detailed',
  },
  {
    name: 'offer-russian.jpg',
    subdir: 'offers',
    size: '864x1152',
    prompt:
      'Promotional luxury photo: Russian folk ensemble in elegant traditional costumes, deep emerald sarafan with golden embroidery, golden kokoshnik headdresses, ornate palace interior with gold details, cinematic editorial photography, emerald and gold palette, ultra detailed',
  },
  {
    name: 'offer-disco.jpg',
    subdir: 'offers',
    size: '864x1152',
    prompt:
      'Promotional luxury photo: 1980s disco diva in shimmering gold sequined dress with emerald green accessories, retro disco ball reflections, dramatic neon and gold lighting, dark dance floor background, cinematic editorial fashion photography, emerald and gold palette, ultra detailed',
  },
  // === Portfolio gallery (4) ===
  {
    name: 'gal-1.jpg',
    subdir: 'gallery',
    size: '1024x1024',
    prompt:
      'Luxury masquerade mask, deep emerald green and antique gold filigree, ornate Venetian carnival mask with feathers, dark background, ultra detailed product photography, emerald gold palette',
  },
  {
    name: 'gal-2.jpg',
    subdir: 'gallery',
    size: '1024x1024',
    prompt:
      'Luxury pirate captain costume, deep emerald velvet coat with gold braiding, ornate golden trim, antique gold buttons, theatrical dramatic portrait, dark moody background with golden particles, emerald gold palette, ultra detailed editorial fashion',
  },
  {
    name: 'gal-3.jpg',
    subdir: 'gallery',
    size: '1024x1024',
    prompt:
      'Elegant child princess costume, deep emerald velvet ballgown with golden tiara, ornate gold embroidery, royal court background, luxury editorial children fashion photography, emerald and gold palette, ultra detailed',
  },
  {
    name: 'gal-4.jpg',
    subdir: 'gallery',
    size: '1024x1024',
    prompt:
      'Luxury Hogwarts wizard robe in deep emerald with antique gold trim, ornate golden embroidery, magical golden particles, dark dramatic gothic library background, cinematic editorial photography, emerald and gold palette, ultra detailed',
  },
];

async function run() {
  const zai = await ZAI.create();
  for (const job of jobs) {
    const outDir = path.join(OUT_DIR, job.subdir);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, job.name);
    if (fs.existsSync(outPath)) {
      console.log(`⏭  skip existing: ${outPath}`);
      continue;
    }
    try {
      console.log(`🎨 generating ${job.subdir}/${job.name} (${job.size})`);
      const res = await zai.images.generations.create({
        prompt: job.prompt,
        size: job.size,
      });
      const b64 = res.data[0].base64;
      fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
      console.log(`✅ saved ${outPath}`);
    } catch (e) {
      console.error(`❌ failed ${job.name}:`, (e as Error).message);
    }
  }
  console.log('🎉 all image jobs done');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
