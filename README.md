# SkillVault

SkillVault 是一个本地优先的个人 AI 工作流资产管理器，适合维护 20-50 个真正会重复使用的高价值资产。

它用于管理提示词、Agent 技能、项目规则、AGENTS.md、CLAUDE.md、Cursor/Windsurf 规则、回复模板、图像提示词、工作流、SOP、检查清单，以及从 AI 对话中沉淀出来的可复用材料。

## 当前状态

当前已实现：

- 资产 CRUD：创建、编辑、归档、软删除、恢复
- 标签绑定和显示
- 搜索、筛选、排序、置顶和重复内容检测
- 复制原始内容和变量填充后的渲染内容
- 版本历史、内容变更自动建版本、元数据修改不建版本、回滚
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
- 移动端浏览器的基础查看、搜索和复制体验

代码功能现在已经推进到本地路线图的 v0.6：确定性校验和安全检查已完成，下一阶段是 v0.7 的 capture inbox 和本地对话挖掘。`package.json` 仍显示 `0.1.0-alpha`，这代表发布版本号尚未重切，不代表代码功能只停留在 alpha。

## 产品范围

SkillVault 是一个运行在 localhost 的本地 Web 应用，使用本地 SQLite 存储。它面向单人使用，用来维护一个实用的小型 AI 工作流资产库。

SQLite 是主数据库。Markdown、文件夹和工具特定文件是导入、导出、备份、部署或交换格式。

SkillVault 不是 SaaS、提示词市场、AI 聊天工具、RAG 系统、同步服务、浏览器插件、团队协作工具、云端应用或移动端 App。

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
- 当目标文件缺失或漂移时，可以直接使用“修复预览”重新进入该目标的部署流程

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
scripts/        种子数据等工具脚本
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

本地文件夹库和工具部署：目录配置、单资产和项目级部署预览、copy-first 部署写入、冲突副本保留、部署状态记录和修复预览都已落地。

### 已完成：v0.5

本地文件夹库和工具部署：目录配置、单资产和项目级部署预览、copy-first 部署写入、冲突副本保留、部署状态记录和修复预览都已落地。

### 进行中：v0.6

确定性校验和安全检查：已完成校验结果模型、SKILL.md 必填元数据、正文长度、重复名、unsupported metadata 和变量占位符语法检查，并显示在资产详情和导入预览中。危险模式检查、维护队列和测试固件待完成。

### v0.7

捕获收件箱和本地对话挖掘：手动捕获、候选资产预览、从 Codex/Claude Code 等本地记录中提取可复用片段。

### v0.8

版本 diff、测试运行和使用历史：文本差异、运行记录、复制使用时间、过期资产和复查队列。

### v0.9

手动远程导入和 Git 友好交换：GitHub 原始文件导入、source metadata、固定 ref、更新检查和本地精选示例。不会变成市场。

### v1.0

稳定的个人本地版本：可靠 SQLite、备份恢复、版本回滚、组织管理、工具部署、导入导出、校验和升级文档。

详细开发计划见 `docs/TASKS.md`。

## 暂不包含

当前路线图不包含登录、用户账户、云同步、OAuth、iCloud API、OneDrive API、GitHub OAuth、技能市场、自动第三方技能下载、AI 提示词优化、浏览器插件、OCR 捕获、多模型聊天、RAG、团队功能、评论、点赞、支付、复杂图表、Monaco、CodeMirror、富文本编辑、复杂 diff、zip 导出、Electron、Tauri、移动 App 发布、云部署适配、多用户权限、公开分享、模板商店、公共注册表发布或托管 MCP 服务。

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
- `AGENTS.md`：AI 编码 Agent 在本仓库工作的规则。
