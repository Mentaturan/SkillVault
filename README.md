# SkillVault

> **One-liner:** SkillVault is a local-first vault for prompts, agent skills, AGENTS.md rules, and reusable AI workflows.
>
> **For developers:** A local-first AI workflow asset manager built for people who use Codex, Claude Code, Cursor, Trae Solo, and other coding agents every day.
>
> **For vibe coders:** An open-source playground for vibe coding your own AI workflow operating system.

## Join the Vibe Coding

SkillVault is intentionally structured for AI-assisted open-source development.

You can contribute with Codex, Claude Code, Cursor, Trae Solo, or any coding agent.

**Start here:**

- Pick a [`good first vibe`](https://github.com/Mentaturan/SkillVault/labels/good%20first%20vibe) issue
- Read [`docs/VIBE_CODING_GUIDE.md`](docs/VIBE_CODING_GUIDE.md)
- Run `npm run typecheck && npm run lint && npm run test && npm run build`
- Open a PR

**Good contribution areas:**

- UI polish
- import/export formats
- validation rules
- fixture tests
- desktop packaging
- documentation

---

SkillVault 是一个本地优先的个人 AI 工作流资产管理器，适合维护 20-50 个真正会重复使用的高价值资产。

它用于管理提示词、Agent 技能、项目规则、AGENTS.md、CLAUDE.md、Cursor/Windsurf 规则、回复模板、图像提示词、工作流、SOP、检查清单，以及从 AI 对话中沉淀出来的可复用材料。

## 当前状态

当前已实现：

- 资产 CRUD：创建、编辑、归档、软删除、恢复
- 标签绑定和显示
- 搜索、筛选、排序、置顶和重复内容检测
- 复制原始内容和变量填充后的渲染内容，并在复制成功后记录最近使用时间
- 版本历史、内容变更自动建版本、元数据修改不建版本、回滚，以及版本间的基础文本 diff
- Markdown 导入和导出
- `syncId` 冲突检测和 overwrite/copy/cancel 策略
- Codex Skill、AGENTS.md、CLAUDE.md、Cursor Rules 等导出预设
- 集合管理、集合排序、集合导出和批量导出
- 手动测试用例
- 内置模板
- 仪表盘和设置诊断
- 项目工作区、项目资产关联、项目视图和本地 AI 配置文件扫描
- 完整备份 bundle 导出、恢复预览、恢复执行、checksum 校验和 fresh database 恢复烟测
- 部署目录设置、单资产和项目级部署预览、copy-first 部署写入、冲突副本保留、部署状态记录和修复预览
- 资产详情、导入预览和维护队列中的确定性校验结果展示，覆盖 SKILL.md 元数据、变量占位符语法和可疑内容告警
- 文件化校验样例和确定性 fixture 检查脚本，覆盖有效、损坏和可疑的 SKILL.md 输入
- Capture Inbox：手动粘贴、review 后转资产、本地 Codex rollout `.jsonl` 预览导入，以及目录级 changed-file detection 扫描
- 手动设置复查截止日和独立复查队列
- 资产专项筛选：复查已到期、最近使用、从未使用、低评分、未测试
- Imported asset 的来源元数据：URL、ref、path、imported-at、checksum
- 公开 GitHub Markdown 文件导入：URL 预览、校验、导入前 checksum 复核
- GitHub 仓库归档导入：URL 预览、路径 glob 过滤、文件数量和大小限制、选择性批量导入
- 来源更新检查：比较远端 checksum，不自动覆盖，有变化时提供重新导入入口
- 本地精选示例：6 个内置示例资产，导入页预览和选择性导入
- 资产列表来源筛选和资产详情来源信息独立 Card
- 设置页版本更新检查：读取 GitHub Releases，显示最新版本、更新说明和 DMG 下载入口
- 空库可选 starter preset seed：支持 `npm run seed`，也支持通过 `SKILLVAULT_SEED_ON_EMPTY=1` 在空数据库自动写入预设资产
- macOS 打包增强：`.app` 内置 Node.js runtime，同时产出 `.zip` 和 `.dmg`
- Windows 打包：C# WebView2 原生壳，内置 Node.js runtime，产出 `.zip`
- iOS 伴侣应用：通过 Bonjour 发现局域网内的桌面端 SkillVault，WKWebView 加载 Web UI
- 桌面端 Bonjour 广播：macOS 和 Windows 启动时自动广播 `_skillvault._tcp.` 服务
- 移动端浏览器的基础查看、搜索和复制体验
- 重复候选审查队列：基于标题相似度和内容哈希匹配发现潜在重复资产
- 批量安全维护操作：归档、重标、评分、复查日期变更，均有预览确认
- 部署健康汇总视图：按状态分组查看所有部署目标
- 组合资产生命周期筛选：多条件组合筛选和"维护队列"预设
- 批量操作审计记录：所有批量操作保留审计历史
- UI 主题系统：浅色、深色、Claude 风格、液态玻璃（Liquid Glass）4 种主题，侧边栏和设置页可切换
- Exchange 交换包导入导出：manifest.json + asset.md + support-files/ 文件夹结构，Zod 校验，预览优先，冲突策略
- Claude Code JSONL 对话捕获：解析 `~/.claude/projects` 目录下的 `.jsonl` 对话文件，提取用户和助手消息候选
- 来源保留重导入：比较 checksum 跳过未变更来源，变更来源提供 diff 预览
- Fixture 测试：交换包往返测试和 Claude Code JSONL 解析测试
- SQLite FTS5 全文搜索：覆盖标题、描述、场景、内容和标签，搜索结果按相关性排序
- 即时搜索：输入后 300ms debounce 自动搜索，回车立即触发
- 搜索预设：保存搜索/筛选条件组合为命名预设，快速切换
- 键盘快捷键：Cmd/Ctrl+K 搜索、Cmd/Ctrl+N 新建资产、Escape 清空、Cmd/Ctrl+/ 帮助
- macOS 版本号自动同步：打包时从 package.json 同步到 Info.plist
- macOS 一键更新：检查 GitHub Releases、下载 DMG、提示替换安装
- 设置页原生更新入口：通过 skillvault:// URL scheme 触发原生更新流程

代码功能已完成 v1.0 稳定个人本地版本目标，v1.1 多平台打包、发布和 onboarding 打磨已完成，v1.2 库维护和复查效率已完成，v1.3 文件交换与捕获扩展已完成，v1.4 搜索效率与 macOS 更新已完成。当前版本 `1.4.0`。

## 产品范围

SkillVault 是一个运行在 localhost 的本地 Web 应用，使用本地 SQLite 存储。它面向单人使用，用来维护一个实用的小型 AI 工作流资产库。

SQLite 是主数据库。Markdown、文件夹和工具特定文件是导入、导出、备份、部署或交换格式。

SkillVault is intentionally not a SaaS, not a prompt marketplace, not another chat UI. It is a local-first workflow asset vault for people who already use AI tools heavily.

当前支持 macOS、Windows 轻量原生壳和 iOS 伴侣应用。

## 为什么这样规划

近期同类开源项目和需求显示，AI 技能/提示词管理的真实痛点主要集中在四类：

- 多工具统一管理：Claude Code、Codex、Cursor、Windsurf、Copilot、Gemini CLI 等工具都有自己的技能或规则目录。
- 可恢复的本地状态：用户需要备份、恢复、manifest、lock file、dry-run 和缺失项重装。
- 导入前校验：SKILL.md 的元数据和正文会影响 agent 如何发现、选择和信任技能。
- 从真实 AI 使用中捕获资产：很多有价值的提示词和流程来自日常对话记录，而不是从空白表单开始写。

SkillVault 的取舍是先把个人本地库做稳：先备份恢复，再做本地文件夹/工具部署，再做确定性校验，再做对话捕获。云同步、市场、AI 优化、公共分享和团队协作继续延后。

## 技术栈

- Next.js App Router
- TypeScript strict
- Tailwind CSS
- shadcn/ui
- SQLite
- Drizzle ORM
- TanStack Table
- Zod
- 普通 `textarea` 编辑器

## 本地开发

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

打开：

```text
http://localhost:3000
```

## 验证命令

实现功能后运行：

```bash
npm run typecheck
npm run lint
npm run build
```

文档-only 修改可以不跑这些命令，但提交说明里需要写明。

## 数据库

默认数据库路径：

```text
./data/skillvault.sqlite
```

可以用环境变量覆盖：

```bash
SKILLVAULT_DB_PATH=/absolute/path/to/skillvault.sqlite npm run dev
```

## 升级

拉取最新代码后，运行依赖安装和数据库迁移：

```bash
npm install
npm run db:migrate
```

如果数据库结构有变化，Drizzle 会自动应用迁移。迁移前建议先在设置页导出完整备份。

从备份恢复到新数据库：

1. 启动应用让 Drizzle 自动创建空数据库
2. 访问 `/restore` 页面
3. 上传之前导出的备份 bundle
4. 查看恢复预览，确认后执行恢复

数据库路径可通过环境变量 `SKILLVAULT_DB_PATH` 覆盖，默认为 `./data/skillvault.sqlite`。

## macOS 应用

SkillVault 可以打包为 macOS .app 应用，双击即可运行。

### 打包

```bash
scripts/package-macos.sh
```

脚本会自动构建 Next.js standalone 输出、编译 Swift 启动器、组装 .app bundle，并产出 `dist/SkillVault.app`、`dist/SkillVault-macOS-v1.1.0.zip` 和 `dist/SkillVault-macOS-v1.1.0.dmg`。

### 从源码更新

```bash
scripts/update-app.sh
```

自动执行 git pull → npm install → 打包。

### 前置条件

- macOS 13+
- Node.js 20+（仅打包时需要；打包后的 `.app` 已内置运行时）
- Xcode Command Line Tools（`xcode-select --install`）

### 数据

.app 使用独立数据库：`~/Library/Application Support/SkillVault/skillvault.sqlite`。开发模式的 `./data/skillvault.sqlite` 不受影响。可通过备份恢复迁移数据。运行时不依赖系统安装的 Node.js。

### 发布

推送 `v*` 格式的 tag 会触发 GitHub Actions 自动构建并创建 Release：

```bash
git tag v1.1.0
git push origin v1.1.0
```

首次打开未签名应用时，右键 `.app` 选择 Open，或执行：

```bash
xattr -cr /Applications/SkillVault.app
```

## Windows 应用

SkillVault 可以打包为 Windows 桌面应用，双击 SkillVault.exe 即可运行。

### 打包

在 Windows 上：

```powershell
scripts/package-windows.ps1
```

在 macOS 上准备 server 文件（需在 Windows 上完成 C# 编译）：

```bash
scripts/package-windows.sh
```

脚本会构建 Next.js standalone 输出、复制 Node.js runtime、编译 C# 启动器，并产出 `dist/SkillVault-Windows-v1.1.0.zip`。

### 前置条件

- Windows 10 1803+
- Node.js 20+（仅打包时需要；打包后的应用已内置运行时）
- .NET 8 SDK（用于编译 C# 启动器）
- WebView2 Runtime（Windows 10 2004+ 已内置）

### 数据

应用使用独立数据库：`%APPDATA%\SkillVault\skillvault.sqlite`。开发模式的 `./data/skillvault.sqlite` 不受影响。可通过备份恢复迁移数据。运行时不依赖系统安装的 Node.js。

## iOS 伴侣应用

SkillVault 提供 iOS 伴侣应用，可连接同一局域网内运行 SkillVault 的桌面端（macOS 或 Windows），在 iPhone/iPad 上查看、搜索和复制资产。

### 工作原理

1. 桌面端 SkillVault 启动时自动通过 Bonjour 广播 `_skillvault._tcp.` 服务
2. iOS 应用扫描局域网，自动发现桌面端实例
3. 选择一个桌面端后，WKWebView 加载其 Web UI

### 前置条件

- iOS 16+
- 同一 WiFi 网络下至少一台运行 SkillVault 的 Mac 或 PC

### 构建

在 Xcode 中打开 `ios/SkillVault/` 目录并构建。当前仅支持侧载和 TestFlight 分发。

### 限制

- iOS 应用不存储本地数据库，所有数据来自连接的桌面端
- 需要桌面端处于运行状态
- 不支持离线使用

## 备份

当前可在设置页直接导出完整备份，或访问：

```text
/api/backup/export
```

导出的备份是一个 JSON bundle，包含：

- manifest：应用版本、迁移标记、导出时间、实体计数和 payload checksum
- assets：每个资产的 Markdown 内容、元数据、版本历史和测试记录
- tags、collections、projects：标签以及不依赖本地 ID 的成员关系

设置页会记录最近一次成功导出的时间，并显示数据库迁移标记与 SQLite `PRAGMA integrity_check` 结果。

## 恢复

当前可在 `/restore` 页面粘贴或上传备份 bundle，先查看恢复预览，再明确执行恢复。

恢复行为：

- 恢复前会校验 bundle 的 Zod 结构和 payload checksum
- checksum 异常会阻止写入
- 资产冲突策略支持 `skip`、按 `syncId` `overwrite`、以及 `copy` 为新 `syncId`
- 预览会标出 `syncId`、slug、标题和内容重复告警
- 集合和项目按名称更新或新建，并重建成员关系

fresh database 烟测脚本：

```bash
npx tsx scripts/smoke-backup-restore.ts --bundle /absolute/path/to/skillvault-backup.json
```

## 部署

当前可在设置页配置 Codex、Claude Code、Cursor、Windsurf、Trae 和一个通用目录目标，然后从资产详情页或项目详情页进入部署预览。

当前部署行为：

- 部署前先生成预览，显示目标文件名、目标路径、现有文件状态和冲突副本路径
- 写入行为默认是 copy-first，不使用 symlink
- 若目标文件已存在且内容不同，会先保留一份 `*.skillvault-backup-*` 冲突副本，再覆盖写入
- 若目标文件内容已和当前资产渲染结果一致，则只同步部署记录，不重复覆盖
- 资产部署页会显示 `已部署 / 已过期 / 目标文件缺失 / 目标文件漂移` 等状态
- 当目标文件缺失或漂移时，可以直接使用"修复预览"重新进入该目标的部署流程

生成并应用 Drizzle 迁移：

```bash
npm run db:generate
npm run db:migrate
```

填充演示数据：

```bash
npm run seed
```

## 项目结构

```text
app/            Next.js App Router 页面和 Server Actions
components/     React UI 组件
db/             Drizzle schema、迁移和数据库入口
server/         服务和查询
lib/            常量、校验器、工具函数、Markdown、变量处理
scripts/        打包脚本、种子数据等工具脚本
macos/          macOS Swift WKWebView 原生壳
windows/        Windows C# WebView2 原生壳
ios/            iOS Swift WKWebView 伴侣应用
docs/           开发计划和项目文档
data/           本地 SQLite 数据库文件
```

## 资产类型

SkillVault 当前支持这些资产类型：

- `agent_skill`：Agent 技能
- `system_rule`：系统规则
- `chat_prompt`：聊天提示词
- `image_prompt`：图像提示词
- `reply_template`：回复模板
- `workflow`：工作流
- `checklist`：检查清单
- `sop`：标准作业流程
- `reference`：参考资料

## 目标工具

资产可以面向这些工具：

- Codex
- Trae Solo
- Claude Code
- ChatGPT
- Claude
- Gemini
- Cursor
- Midjourney
- Flux
- Stable Diffusion
- DALL-E
- 通用

## 导出预设

导出预设决定输出格式：

- 通用 Markdown
- Codex Skill Markdown
- AGENTS.md
- CLAUDE.md
- Cursor Rules
- 纯文本

## 版本模型

- 新资产创建版本 1。
- 内容哈希变化时创建新版本。
- 只修改元数据不创建新版本。
- 回滚会把旧内容写回资产，并创建一个新版本。
- 版本永不删除。

## 路线图摘要

### 已完成：v0.1-alpha

本地核心资产管理：CRUD、标签、搜索、筛选、排序、复制、变量、版本、回滚、Markdown 导入导出、设置页、移动端浏览器支持和基础验证。

### 已完成：v0.1-beta

集合、手动测试用例、仪表盘、内置模板、导出预设增强、批量导出和实验性文件夹导入。

### 已完成：v0.2

面向具体工具的导出模板和 SKILL.md 支持，包括 Codex Skill、AGENTS.md、CLAUDE.md、Cursor Rules 等格式。

### 已完成：v0.3

项目工作区扫描：项目 CRUD、项目资产关联、本地目录扫描、项目范围视图和项目统计。

### 已完成：v0.4

备份、恢复和数据完整性：完整备份 bundle 导出、恢复预览、冲突策略、checksum 恢复校验、更强诊断和 fresh database 恢复烟测都已落地。

### 已完成：v0.5

本地文件夹库和工具部署：目录配置、单资产和项目级部署预览、copy-first 部署写入、冲突副本保留、部署状态记录和修复预览。

### 已完成：v0.6

确定性校验和安全检查：SKILL.md 元数据校验、变量占位符语法检查、可疑内容告警、维护队列和校验固件测试。

### 已完成：v0.7

捕获收件箱和本地对话挖掘：手动捕获、候选资产预览、Codex rollout 导入和目录级 changed-file detection 扫描。

### 已完成：v0.8

版本 diff、测试运行和使用历史：文本差异、复制使用时间、过期资产和复查队列。

### 已完成：v0.9

导入来源、精选示例和 Git 友好交换：GitHub 单文件和仓库归档导入、来源更新检查、本地精选示例、来源筛选和来源信息 Card。

### 已完成：v1.0

稳定的个人本地版本：文档与实际行为一致、迁移升级说明、全链路验证。

### 已完成：v1.1

多平台打包、发布和 onboarding 打磨：设置页检查更新、空库预设 seed、macOS `.app/.zip/.dmg` 打包、Windows C# WebView2 原生壳、iOS 伴侣应用、桌面端 Bonjour 广播。

### 已完成：v1.2

库维护和复查效率：重复候选审查队列、批量安全维护操作、部署健康汇总视图、组合生命周期筛选、批量操作审计记录。

### 已完成：v1.3

文件交换与捕获扩展：Exchange 交换包导入导出、Claude Code JSONL 对话捕获、来源保留重导入、液态玻璃主题修复、Fixture 测试。

### 已完成：v1.4

搜索效率与 macOS 更新：SQLite FTS5 全文搜索、即时搜索（debounced）、搜索预设、键盘快捷键（Cmd/Ctrl+K 搜索、Cmd/Ctrl+N 新建、Escape 清空、Cmd/Ctrl+/ 帮助）、macOS 版本号自动同步、macOS 一键更新（GitHub Releases 检查、DMG 下载安装）、设置页原生更新入口。

详细开发计划见 `docs/TASKS.md`。

## 暂不包含

当前路线图不包含登录、用户账户、云同步、OAuth、iCloud API、OneDrive API、GitHub OAuth、技能市场、自动第三方技能下载、AI 提示词优化、浏览器插件、OCR 捕获、多模型聊天、RAG、团队功能、评论、点赞、支付、复杂图表、Monaco、CodeMirror、富文本编辑、复杂 diff、zip 导出、Electron、Tauri、App Store 发布、云部署适配、多用户权限、公开分享、模板商店、公共注册表发布或托管 MCP 服务。

## 调研参考

- skills-manage: <https://github.com/iamzhihuix/skills-manage>
- Skillful: <https://github.com/Mastermindzh/skillful>
- prompt-manager: <https://github.com/n-WN/prompt-manager>
- promptops: <https://github.com/llmhq-hub/promptops>
- Vercel skills lock file restore issue: <https://github.com/vercel-labs/skills/issues/283>
- Hermes external skill write directory issue: <https://github.com/NousResearch/hermes-agent/issues/4381>
- skill-validator: <https://github.com/agent-ecosystem/skill-validator>
- SKILL.md supply-chain risk paper: <https://arxiv.org/abs/2605.11418>

## 项目文档

- `README.md`：项目概览、本地运行方式、当前状态和路线图摘要。
- `docs/TASKS.md`：详细开发计划和阶段状态。
- `docs/ROADMAP.md`：路线图和版本规划。
- `docs/VIBE_CODING_GUIDE.md`：如何用 AI Agent 参与本项目。
- `AGENTS.md`：AI 编码 Agent 在本仓库工作的规则。
- `CONTRIBUTING.md`：贡献指南。
