# SkillVault Roadmap

> 当前版本：`1.3.0`
>
> 详细开发计划见 `docs/TASKS.md`。

## 已完成

### v0.1-alpha — 核心资产管理
资产 CRUD、标签、搜索、筛选、排序、复制、变量、版本、回滚、Markdown 导入导出、设置页、移动端浏览器支持、基础验证。

### v0.1-beta — 组织与评估
集合、手动测试用例、仪表盘、内置模板、导出预设增强、批量导出、实验性文件夹导入。

### v0.2 — 工具导出
面向具体工具的导出模板和 SKILL.md 支持：Codex Skill、AGENTS.md、CLAUDE.md、Cursor Rules 等格式。

### v0.3 — 项目工作区
项目 CRUD、项目资产关联、本地目录扫描、项目范围视图、项目统计。

### v0.4 — 备份与完整性
完整备份 bundle 导出、恢复预览、冲突策略、checksum 恢复校验、更强诊断、fresh database 恢复烟测。

### v0.5 — 本地部署
目录配置、单资产和项目级部署预览、copy-first 部署写入、冲突副本保留、部署状态记录、修复预览。

### v0.6 — 确定性校验
SKILL.md 元数据校验、变量占位符语法检查、可疑内容告警、维护队列、校验固件测试。

### v0.7 — 捕获收件箱
手动捕获、候选资产预览、Codex rollout 导入、目录级 changed-file detection 扫描。

### v0.8 — Diff、测试与历史
文本差异、复制使用时间、过期资产、复查队列。

### v0.9 — 导入来源与交换
GitHub 单文件和仓库归档导入、来源更新检查、本地精选示例、来源筛选、来源信息 Card。

### v1.0 — 稳定本地版本
文档与实际行为一致、迁移升级说明、全链路验证。

### v1.1 — 多平台打包
设置页检查更新、空库预设 seed、macOS `.app/.zip/.dmg`、Windows C# WebView2 原生壳、iOS 伴侣应用、桌面端 Bonjour 广播。

### v1.2 — 库维护与复查
重复候选审查队列、批量安全维护操作、部署健康汇总视图、组合生命周期筛选、批量操作审计记录。

### v1.3 — 文件交换与捕获扩展
Exchange 交换包导入导出、Claude Code JSONL 对话捕获、来源保留重导入、液态玻璃主题修复、Fixture 测试。

## 进行中 / 下一步

### v1.4 — 开源协作与社区（当前）
- [ ] 完善开源协作入口：CONTRIBUTING.md、Issue/PR 模板、Vibe Coding 指南
- [ ] 创建 good-first-vibe issues
- [ ] README 优化：截图、宣传定位、参与入口
- [ ] GitHub topics 和项目板
- [ ] 社区宣传：中文和英文渠道

### v1.5 — 质量与扩展（计划）
- [ ] 更多导入/导出格式（Gemini CLI、Windsurf 规则等）
- [ ] 更完善的 validation fixtures 和测试覆盖
- [ ] UI/UX 持续打磨
- [ ] 文档和示例资产扩充

## 暂不包含

当前明确不进入路线图的领域：

- 登录、用户账户、多用户权限
- 云同步、OAuth、iCloud/OneDrive/GitHub OAuth
- 技能市场、公共注册表、自动第三方技能下载
- AI 提示词优化、模型评估
- 浏览器插件、OCR 捕获
- 多模型聊天、RAG
- 团队功能、评论、点赞、支付、社交功能
- Monaco、CodeMirror、富文本编辑、复杂图表
- Electron、Tauri
- App Store 发布、云部署适配
- 公开分享、模板商店
- 托管 MCP 服务

## 如何参与

见 [CONTRIBUTING.md](../CONTRIBUTING.md) 和 [VIBE_CODING_GUIDE.md](VIBE_CODING_GUIDE.md)。
