# SkillVault

SkillVault 是一个本地优先的个人 AI 工作流资产管理器，适合维护 20-50 个真正会重复使用的高价值资产。

它用于管理提示词、Agent 技能、项目规则、回复模板、图像提示词、工作流、SOP、检查清单，以及从 AI 对话中沉淀出来的可复用材料。

## 当前状态

项目版本为 `v0.1.0-alpha`。

本地基础已经搭好：Next.js App Router、TypeScript、Tailwind CSS、shadcn/ui、SQLite、Drizzle ORM、Zod 校验器、资产服务、标签服务、版本服务和基础资产页面。

下一步开发重点是补齐 alpha 工作流：

- 搜索、筛选和排序。
- 复制原始内容，以及填充变量后的渲染内容。
- 版本历史和回滚。
- Markdown 导入和导出。
- 移动端浏览器可用性。
- typecheck、lint、build 和完整冒烟测试。

## 产品范围

SkillVault 是一个运行在 localhost 的 Web 应用，使用本地 SQLite 存储。它面向单人使用，用来维护一个实用的小型 AI 工作流资产库。

SQLite 是主数据库。Markdown 是导入、导出、备份类流程和工具特定文件的交换格式。

SkillVault 不是 SaaS、提示词市场、AI 聊天工具、RAG 系统、同步服务、浏览器插件或多人协作工具。

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

每个阶段完成前运行：

```bash
npm run typecheck
npm run lint
npm run build
```

## 数据库

默认数据库路径：

```text
./data/skillvault.sqlite
```

可以用环境变量覆盖：

```bash
SKILLVAULT_DB_PATH=/absolute/path/to/skillvault.sqlite npm run dev
```

生成并应用 Drizzle 迁移：

```bash
npm run db:generate
npm run db:migrate
```

## 项目结构

```text
app/            Next.js App Router 页面和 Server Actions
components/     React UI 组件
db/             Drizzle schema、迁移和数据库入口
server/         服务和查询
lib/            常量、校验器、工具函数、Markdown、变量处理
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

导出预设决定 Markdown 输出格式：

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

### v0.1-alpha

完成本地核心资产管理：CRUD、标签、搜索/筛选/排序、复制、变量、版本、回滚、Markdown 导入导出、设置页、移动端浏览器支持和验证。

### v0.1-beta

集合管理、手动测试用例、运行记录、仪表盘统计、内置模板、导出预设增强、批量 Markdown 导出和实验性文件夹导入。

### v0.2

备份与恢复、PWA 使用体验、文件夹导入增强，以及更可靠的导入导出流程。

### v0.3

捕获收件箱、简单文本差异对比、复制使用记录、过期资产提示，以及 Tauri 可行性实验。

### v0.4

本地 Markdown 文件夹双向同步实验、dry-run 预览、冲突副本保留，以及可选的 Git 仓库工作流实验。

### v0.5

Codex Skill 模板、Claude Code 和 CLAUDE.md 模板、AGENTS.md 组合生成、Cursor Rules 模板和 Skill Pack 打包。

### v0.6

精选库浏览、手动导入精选资产、来源追踪和更新检查，同时保持本地优先。

### v0.7

确定性的提示词 lint、规则检查、资产健康评分和维护队列。

### v0.8

定期复查、归档流程、重复检测、生命周期筛选和批量元数据编辑。

### v0.9

迁移加固、数据完整性检查、修复工具、打包方向决策和升级文档。

### v1.0

稳定的个人本地版本，具备可靠 SQLite 存储、Markdown 导入导出、备份恢复、版本、回滚、组织管理和迁移文档。

详细开发计划见 `docs/TASKS.md`。

## v0.1-alpha 暂不包含

v0.1-alpha 不包含登录、用户账户、云同步、OAuth、iCloud API、OneDrive API、GitHub OAuth、技能市场、第三方技能下载、AI 提示词优化、浏览器插件、OCR 捕获、多模型聊天、RAG、团队功能、评论、点赞、支付、复杂图表、Monaco、CodeMirror、富文本编辑、复杂 diff、zip 导出、Electron、Tauri、移动 App 发布、云部署适配、多用户权限、公开分享、模板商店或远程精选库。

## 项目文档

- `README.md`：项目概览、本地运行方式和路线图摘要。
- `docs/TASKS.md`：详细开发计划和阶段状态。
- `AGENTS.md`：AI 编码 Agent 在本仓库工作的规则。
