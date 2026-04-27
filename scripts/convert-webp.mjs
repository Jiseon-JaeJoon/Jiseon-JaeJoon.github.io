import sharp from 'sharp'
import { readdirSync, mkdirSync, existsSync } from 'fs'
import { join, extname, basename } from 'path'

const INPUT_DIR = 'public/Image'
const OUTPUT_DIR = 'public/Image/webp'
const MAX_WIDTH = 1400
const QUALITY = 85

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })

const files = readdirSync(INPUT_DIR).filter(f =>
  ['.jpg', '.jpeg', '.png'].includes(extname(f).toLowerCase())
)

console.log(`변환 시작: ${files.length}개 파일`)

let totalOriginal = 0
let totalConverted = 0

for (const file of files) {
  const inputPath = join(INPUT_DIR, file)
  const outputName = basename(file, extname(file)) + '.webp'
  const outputPath = join(OUTPUT_DIR, outputName)

  const { size: originalSize } = (await import('fs')).statSync(inputPath)
  totalOriginal += originalSize

  await sharp(inputPath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(outputPath)

  const { size: convertedSize } = (await import('fs')).statSync(outputPath)
  totalConverted += convertedSize

  const ratio = ((1 - convertedSize / originalSize) * 100).toFixed(1)
  console.log(`  ${file} → ${outputName}  ${(originalSize/1024/1024).toFixed(1)}MB → ${(convertedSize/1024).toFixed(0)}KB  (-${ratio}%)`)
}

console.log(`\n완료: ${(totalOriginal/1024/1024).toFixed(1)}MB → ${(totalConverted/1024/1024).toFixed(1)}MB  (-${((1 - totalConverted/totalOriginal)*100).toFixed(1)}%)`)
