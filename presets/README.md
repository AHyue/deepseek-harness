# DSH 多模型接入预设

本目录是 DeepSeek Harness（DSH）的**模型接入扩展包**，用来把官方内置目录之外的
OpenAI 兼容端点接进来。

## 为什么需要它

DSH 的模型层来自 `packages/llm/llm-pi-ai`，provider 目录由上游 `@earendil-works/pi-ai`
提供。当前内置 **42 个 provider**，已覆盖：

```
deepseek  openai  anthropic  google  xai  groq  mistral  cerebras
moonshotai(-cn)  zai(-coding-cn)  minimax(-cn)  openrouter
opencode(-go)  kimi-coding  qwen-token-plan(-cn)  xiaomi(-token-plan-*)
amazon-bedrock  azure  cloudflare-*  github-copilot  vercel-ai-gateway ...
```

**没覆盖的**，正是国内最常用的两类：

| 类型 | 例子 | 内置目录 |
|---|---|---|
| 国内聚合/兼容网关 | 硅基流动、通义 DashScope 兼容模式、火山方舟 | ❌ |
| 本地推理服务 | Ollama、vLLM、LM Studio | ❌ |

本预设补齐这两类，并且**不改动任何核心代码** —— 全部通过
`$DSH_HOME/settings.yaml` 的 `llm-pi-ai.providers` 配置层生效。

## 三种接入方式怎么选

| 方式 | 适用 | 说明 |
|---|---|---|
| Web UI「Add a custom provider」 | 新手、只加一两个 | 点点点就行，密钥存进 `.credentials.yaml` |
| **本预设（settings.yaml）** | 一次配多个、想版本化 | 可提交到 Git，团队共享 |
| 环境变量覆盖 `DEEPSEEK_BASE_URL` | 只有一家、模型名与官方一致 | 最省事但最容易 `UNKNOWN_MODEL` |

## 用法

```bash
# 1. 备份并写入模板（首次）
node presets/apply.mjs

# 2. 按需修改 $DSH_HOME/settings.yaml 里的模型 ID
#    模型 ID 必须与服务商后台完全一致，不确定就用 Web UI 的
#    Settings → Models → Fetch available models 拉取

# 3. 设置密钥（变量名见 apiKeyEnv 字段）
set SILICONFLOW_API_KEY=sk-xxxx      # Windows cmd
export SILICONFLOW_API_KEY=sk-xxxx   # bash

# 4. 重启 dsh
dsh web
```

## 三个必须知道的坑

1. **`models` 是「替换」不是「追加」**
   对内置目录里已有的 provider（如 `openrouter`），一旦写了 `models` 列表，
   内置的模型细节（上下文窗口、模态、思考格式）就被整体覆盖。
   只想加密钥就**只写 `apiKeyEnv`**，别写 `baseURL` 和 `models`。

2. **模型 ID 不做任何转换**
   DSH 把 `id` 原样发给端点。写错就是 `UNKNOWN_MODEL`，不会自动纠正。

3. **多模态要显式声明**
   视觉模型不写 `input: [text, image]`，图片会在发送前被拦下（这是刻意的：
   宁可提前拒绝，也不要在会话中途被服务端 400）。

## 文件说明

| 文件 | 用途 |
|---|---|
| `settings.example.yaml` | 完整配置模板，含国内网关 + 本地模型 |
| `apply.mjs` | 安全写入脚本：不存在则创建，已存在则备份后提示手动合并 |

## 许可

与 DSH 主体一致，MIT。
