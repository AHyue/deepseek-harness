#!/usr/bin/env node
/**
 * 把 presets/settings.example.yaml 安全地写入 $DSH_HOME/settings.yaml。
 *
 * 三种情况：
 *   1. 目标不存在           → 直接创建
 *   2. 目标存在但没有 llm-pi-ai 段 → 备份后追加（顶层键不存在，追加是安全的）
 *   3. 目标已有 llm-pi-ai 段   → 只备份，提示手动合并（不做 YAML 级合并，避免破坏现有配置）
 *
 * 用法：
 *   node presets/apply.mjs [--dry-run]
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const templatePath = join(here, 'settings.example.yaml');
const dshHome = process.env.DSH_HOME || join(homedir(), '.dsh');
const targetPath = join(dshHome, 'settings.yaml');
const dryRun = process.argv.includes('--dry-run');

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupPath = `${targetPath}.bak-${stamp}`;

function log(msg) {
  console.log(`[presets] ${msg}`);
}

if (!existsSync(templatePath)) {
  console.error(`[presets] 模板缺失：${templatePath}`);
  process.exit(1);
}

const template = readFileSync(templatePath, 'utf8');

if (!existsSync(targetPath)) {
  if (dryRun) {
    log(`将创建 ${targetPath}（dry-run，未写入）`);
  } else {
    writeFileSync(targetPath, template, 'utf8');
    log(`已创建 ${targetPath}`);
  }
} else {
  const current = readFileSync(targetPath, 'utf8');
  copyFileSync(targetPath, backupPath);
  log(`已备份到 ${backupPath}`);

  if (/^llm-pi-ai\s*:/m.test(current)) {
    log('检测到现有 llm-pi-ai 段，未自动合并（避免破坏你的配置）。');
    log(`请手动把 ${templatePath} 中 llm-pi-ai.providers 下的条目合并进去。`);
    process.exit(2);
  }

  if (dryRun) {
    log(`将把预设追加到 ${targetPath}（dry-run，未写入）`);
  } else {
    writeFileSync(targetPath, `${current.trimEnd()}\n\n${template}`, 'utf8');
    log(`已把预设追加到 ${targetPath}`);
  }
}

log('');
log('下一步：');
log('  1. 按需修改模型 ID（必须与服务商后台完全一致）');
log('  2. 设置 apiKeyEnv 指定的环境变量');
log('  3. 重启 dsh 后，在 Settings → Models 里选中模型');
