# Contributing to SkillVault

SkillVault 是一个本地优先的 AI 工作流资产管理器，面向重度使用 Codex、Claude Code、Cursor、Trae Solo 等 AI 编程工具的用户。

## AI-Assisted Contributions Welcome

我们欢迎 AI 生成的代码，但贡献者需要对代码质量负责。

## Quick Start

1. Fork 本仓库
2. 阅读 [docs/VIBE_CODING_GUIDE.md](docs/VIBE_CODING_GUIDE.md)
3. 选一个 `good first vibe` issue
4. 本地运行：
   ```bash
   npm install
   npm run typecheck
   npm run lint
   npm run test
   npm run build
   ```
5. 提交 PR

## Before PR

- 不要包含无关的重构
- 不要在 issue 讨论之外扩大 scope
- 必须通过 `typecheck`、`lint`、`test`、`build`
- 行为变更必须更新文档
- import/export/backup/restore/validation 逻辑必须添加测试

## What We Need

- UI polish
- 导入/导出格式扩展
- Agent skill 校验规则
- 测试 fixtures
- 桌面端打包改进
- 文档和示例资产

## What We Don't Do

见 README「暂不包含」部分。当前不接受：
- 登录/用户账户
- 云同步
- OAuth
- 技能市场/公共注册表
- AI 提示词优化
- 浏览器插件
- RAG
- 团队功能
- Electron/Tauri

## Code Style

- TypeScript strict
- 不添加无关注释
- React 组件只处理 UI，数据库逻辑放在 services/queries
- 新功能先跑 `npm run typecheck && npm run lint && npm run build`

## Questions?

开 issue 或 discussion，我们会回复。
