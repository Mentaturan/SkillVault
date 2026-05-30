---
title: Git 提交工作流
type: workflow
targetTool: general
exportPreset: general_markdown
description: 规范化的 Git 提交工作流，涵盖分支策略、提交信息格式和合并规则
tags:
  - Git
  - 工作流
  - 提交规范
  - 协作
---

# Git 提交工作流

## 分支策略

- `main` 分支始终可部署，禁止直接推送
- 功能分支命名：`feat/简短描述`、`fix/简短描述`、`refactor/简短描述`
- 热修复分支：`hotfix/简短描述`，从 main 拉出，合并回 main 和当前开发分支
- 分支生命周期不超过一周，长期分支需拆分为更小的 PR

## 提交信息格式

遵循 Conventional Commits 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 列表

- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档变更
- `style`: 格式调整（不影响逻辑）
- `refactor`: 重构（不新增功能、不修复 Bug）
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具变更

### 规则

- subject 不超过 72 个字符，使用祈使句
- body 说明为什么做这个变更，而不是做了什么
- Breaking Change 必须在 footer 标注 `BREAKING CHANGE:`
- 关联 Issue 使用 `Closes #123` 或 `Refs #123`

## 提交前检查

1. 运行 `npm run typecheck` 确保类型正确
2. 运行 `npm run lint` 确保代码风格一致
3. 运行 `npm run test` 确保测试通过
4. 检查是否误提交了调试代码、console.log、.env 文件

## 合并规则

- PR 至少一人审查通过
- 所有 CI 检查通过
- 合并方式优先 Squash Merge，保持 main 历史整洁
- 合并后删除源分支
