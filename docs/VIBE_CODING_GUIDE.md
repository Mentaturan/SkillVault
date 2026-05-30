# Vibe Coding Guide: How to Build SkillVault with AI Agents

SkillVault 是一个适合用 AI Agent 协作开发的开源项目。本指南告诉你如何用最熟悉的 AI 编程工具参与。

## 5-Minute Start

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_NAME/SkillVault.git
cd SkillVault
```

### 2. Install & Verify

```bash
npm install
npm run typecheck
npm run lint
npm run test
npm run build
```

全部通过后再开始改代码。

### 3. Pick a Task

去 Issues 页面找带 `good first vibe` 标签的任务。这些任务：

- 颗粒度小（1-2 小时能做完）
- 边界清晰（改哪些文件、验收标准明确）
- 适合直接丢给 Agent 做

### 4. Paste Into Your Agent

把 issue 内容复制到 Codex / Claude Code / Trae Solo / Cursor 的聊天框，加上：

```
我在做 SkillVault 的一个 vibe task。请先阅读 docs/VIBE_CODING_GUIDE.md 和 AGENTS.md 了解项目规则，然后实现这个任务。
```

### 5. Review & PR

Agent 改完后，你自己 review：

- 有没有无关重构？
- 测试是否通过？
- 行为变更有没有更新文档？

确认后提交 PR，模板会自动加载。

## 项目结构速览

```
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

## 关键规则

- **React 组件只处理 UI**，不要在里面写数据库逻辑
- **Server Actions** 用 Zod 校验输入，调用 services，catch 错误，返回清晰结果
- **Services** 拥有业务规则，**Queries** 拥有数据库访问
- **新功能必须跑 `npm run typecheck && npm run lint && npm run test && npm run build`**
- **不要添加无关注释**

## 常见任务类型

### UI Polish
改组件样式、空状态、图标、主题变量。通常在 `components/` 和 `app/globals.css`。

### Import/Export Format
加新的导出预设或导入解析器。看 `lib/markdown/`、`server/services/markdown-service.ts`、已有的 preset 文件。

### Validation Rules
加新的校验规则或 fixture。看 `lib/validation/`、`scripts/check-validation-fixtures.ts`。

### Tests
加 vitest 测试或 fixture 检查。看已有的 `*.test.ts` 文件。

### Desktop Packaging
改 Swift 或 C# 启动器。看 `macos/SkillVault/`、`windows/SkillVault/`。

## 提问

- 开 issue 选 "Vibe Task" 模板
- 或在 Discussion 里问

## 记住

AI-generated code is welcome, but you are responsible for reviewing it.
