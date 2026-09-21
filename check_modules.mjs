import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 开始检查所有模块...\n');

const srcDir = path.join(__dirname, 'src');
const errors = [];
const success = [];

async function checkModule(filePath) {
  const relativePath = path.relative(__dirname, filePath);
  const fileUrl = new URL(`file:///${filePath.replace(/\\/g, '/')}`);

  try {
    console.log(`⏳ 检查: ${relativePath}`);
    await import(fileUrl);
    console.log(`✅ 成功: ${relativePath}`);
    success.push(relativePath);
  } catch (err) {
    console.error(`❌ 失败: ${relativePath}`);
    console.error(`   错误: ${err.message}`);
    if (err.stack) {
      console.error(`   堆栈: ${err.stack.split('\n').slice(0, 3).join('\n')}`);
    }
    errors.push({ file: relativePath, error: err.message, stack: err.stack });
  }
  console.log('');
}

async function walkDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await walkDir(filePath);
    } else if (file.endsWith('.js')) {
      await checkModule(filePath);
    }
  }
}

await walkDir(srcDir);

console.log('\n========================================');
console.log('📊 检查结果汇总');
console.log('========================================\n');
console.log(`✅ 成功: ${success.length} 个模块`);
console.log(`❌ 失败: ${errors.length} 个模块\n`);

if (errors.length > 0) {
  console.log('❌ 错误详情:\n');
  errors.forEach((e, i) => {
    console.log(`${i + 1}. ${e.file}`);
    console.log(`   ${e.error}\n`);
  });
}
