import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, '../public/img/logo_250709_2.png');
const outputDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
  const sizes = [192, 512];

  for (const size of sizes) {
    // 正方形のキャンバスを作成し、ロゴを中央に配置
    const logo = sharp(logoPath);
    const metadata = await logo.metadata();

    // ロゴの縦横比を維持しながら、正方形に収める
    const logoWidth = metadata.width;
    const logoHeight = metadata.height;

    // パディングを追加して正方形にする
    const padding = Math.floor(size * 0.15); // 15%のパディング
    const innerSize = size - (padding * 2);

    // ロゴをリサイズ（縦横比維持）
    const resizedLogo = await sharp(logoPath)
      .resize({
        width: innerSize,
        height: innerSize,
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toBuffer();

    // 白い背景の正方形を作成し、リサイズしたロゴを中央に配置
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite([{
        input: resizedLogo,
        gravity: 'center'
      }])
      .png()
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));

    console.log(`Generated icon-${size}x${size}.png`);
  }

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
