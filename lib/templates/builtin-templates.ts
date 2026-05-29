import type { AssetType, TargetTool, ExportPreset } from "@/lib/constants";

export interface BuiltinTemplate {
  id: string;
  name: string;
  description: string;
  type: AssetType;
  targetTool: TargetTool;
  exportPreset: ExportPreset;
  content: string;
  scenario: string;
}

export const BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  {
    id: "agent_skill_code_review",
    name: "代码审查技能",
    description: "用于 Codex 的代码审查技能模板，自动检查代码质量、安全性和最佳实践",
    type: "agent_skill",
    targetTool: "codex",
    exportPreset: "codex_skill_md",
    scenario: "提交代码前需要自动化审查，或对团队代码进行质量把关时使用",
    content: `---
name: code-review
version: 1.0.0
description: 代码审查技能
triggers:
  - code_review
  - 审查代码
  - review
---

# 代码审查技能

## 角色
你是一位资深代码审查专家，擅长发现代码中的潜在问题并提供改进建议。

## 审查维度

### 1. 代码质量
- 命名是否清晰且符合项目约定
- 函数是否保持单一职责
- 是否存在重复代码可提取为公共方法
- 圈复杂度是否过高（建议不超过 10）

### 2. 安全性
- 是否存在 SQL 注入风险
- 用户输入是否经过校验和转义
- 敏感信息是否硬编码在代码中
- 权限校验是否完整

### 3. 性能
- 是否存在 N+1 查询问题
- 循环内是否有不必要的重复计算
- 大数据量场景是否考虑分页或懒加载
- 是否有不必要的同步阻塞操作

### 4. 错误处理
- 异常是否被正确捕获和处理
- 边界条件是否覆盖
- 错误信息是否对调试有帮助且不泄露敏感信息
- 资源是否在 finally 块中正确释放

## 输出格式

对每个问题输出：
- **位置**：文件名和行号
- **级别**：🔴 严重 / 🟡 建议 / 🔵 风格
- **描述**：问题说明
- **建议**：修复方案或改进代码片段

## 约束
- 只审查实际存在的问题，不臆测
- 建议必须具体可执行，不说空话
- 区分"必须修改"和"建议修改"
- 尊重项目现有风格，不强制推行个人偏好`,
  },
  {
    id: "system_rule_coding_standards",
    name: "项目编码规范",
    description: "用于 Claude Code 的项目编码规范规则，统一团队代码风格和工程实践",
    type: "system_rule",
    targetTool: "claude_code",
    exportPreset: "agents_md",
    scenario: "新项目启动时建立编码规范，或团队需要统一代码风格时使用",
    content: `# 项目编码规范

## 通用规则

- 使用 TypeScript strict 模式，禁止 any 类型
- 所有函数和公共方法必须有 JSDoc 注释
- 文件命名使用 kebab-case，组件命名使用 PascalCase
- 每个文件只导出一个主要组件或函数
- 导入顺序：React → 第三方库 → 本地模块 → 类型

## React 组件

- 函数组件优先，不使用 class 组件
- Props 必须定义独立的 interface 或 type
- 组件文件结构：imports → type定义 → 组件 → exports
- 自定义 Hook 以 use 前缀命名
- useState 初始化使用函数形式避免重复计算

## 样式

- 使用 Tailwind CSS，不写自定义 CSS 除非必要
- 类名顺序：布局 → 尺寸 → 间距 → 排版 → 颜色 → 其他
- 响应式使用 mobile-first 方式编写
- 重复 3 次以上的样式组合提取为组件

## 错误处理

- 异步操作必须 try-catch
- API 调用统一错误处理模式
- 用户可见的错误信息使用中文
- 日志信息使用英文

## 测试

- 核心逻辑必须有单元测试
- 测试文件与源文件同目录，命名为 \`.test.ts\`
- 测试描述使用中文，清晰表达测试意图
- Mock 只在外部依赖处使用，不 mock 被测模块内部函数

## Git

- Commit message 使用 Conventional Commits 格式
- 每次提交保持原子性，一个提交只做一件事
- 分支命名：feature/xxx、fix/xxx、refactor/xxx`,
  },
  {
    id: "chat_prompt_requirements_analysis",
    name: "需求分析助手",
    description: "用于 ChatGPT 的需求分析提示词，帮助梳理和拆解产品需求",
    type: "chat_prompt",
    targetTool: "chatgpt",
    exportPreset: "general_markdown",
    scenario: "收到模糊的产品需求时，需要系统化分析和拆解时使用",
    content: `你是一位经验丰富的产品需求分析师。我会给你一个产品需求描述，你需要帮我完成以下分析：

## 分析框架

### 1. 需求澄清
- 识别需求中的模糊点和歧义
- 列出需要向需求方确认的问题
- 区分"必须满足"和"最好有"的部分

### 2. 用户场景
- 描述典型用户画像
- 列出核心用户场景（至少 3 个）
- 识别边缘场景和异常流程

### 3. 功能拆解
- 将需求拆分为可独立交付的功能模块
- 标注模块间的依赖关系
- 建议交付优先级（P0/P1/P2）

### 4. 技术考量
- 可能的技术方案及利弊
- 数据模型初步设计
- 需要关注的技术风险

### 5. 验收标准
- 每个功能模块的验收条件
- 可量化的成功指标
- 需要回归测试的场景

## 输出要求

- 使用 Markdown 格式
- 每个部分给出具体内容，不说空话
- 如果信息不足以分析，直接指出缺失点
- 给出你的专业建议，即使需求方没有提到`,
  },
  {
    id: "image_prompt_product_icon",
    name: "产品图标生成",
    description: "用于 DALL-E 的产品图标生成提示词，生成现代风格的应用图标",
    type: "image_prompt",
    targetTool: "dalle",
    exportPreset: "plain_text",
    scenario: "需要为新应用或功能设计图标时使用，可替换变量快速生成不同风格",
    content: `A modern app icon for {{app_name}}, featuring a {{main_element}} symbol. The icon uses a {{color_scheme}} color palette with a clean, flat design style. The background is a smooth gradient from {{bg_color_start}} to {{bg_color_end}}. The symbol is centered and slightly elevated with a subtle shadow. The overall style is minimalist and professional, suitable for both iOS and Android app stores. No text in the icon. The icon should work well at sizes from 16x16 to 1024x1024 pixels. Style reference: Apple's SF Symbols meets Material Design icon guidelines.`,
  },
  {
    id: "workflow_code_deployment",
    name: "代码部署流程",
    description: "标准代码部署工作流，涵盖从代码合并到线上发布的完整流程",
    type: "workflow",
    targetTool: "general",
    exportPreset: "general_markdown",
    scenario: "团队需要规范化代码部署流程，或新成员了解部署步骤时使用",
    content: `# 代码部署流程

## 前置条件
- 代码已通过 Code Review 并合并到 main 分支
- 所有自动化测试通过
- 部署配置已更新（如有变更）

## 部署步骤

### Step 1: 构建验证
1. 拉取最新 main 分支代码
2. 执行 \`npm run build\` 确认构建成功
3. 执行 \`npm run typecheck\` 确认类型检查通过
4. 执行 \`npm run lint\` 确认代码规范检查通过

### Step 2: 预发布环境部署
1. 将构建产物部署到 staging 环境
2. 执行冒烟测试验证核心功能
3. 检查环境变量和配置是否正确
4. 确认数据库迁移已执行（如有）

### Step 3: 预发布验证
1. 功能验证：按测试用例逐项检查
2. 性能验证：确认无显著性能退化
3. 兼容性验证：检查目标浏览器和设备
4. 通知相关人员进行验收测试

### Step 4: 生产环境部署
1. 确认预发布验收通过，获取部署批准
2. 执行数据库迁移（先备份）
3. 部署生产环境
4. 验证健康检查接口返回正常
5. 确认监控和告警正常

### Step 5: 部署后验证
1. 在生产环境执行冒烟测试
2. 观察错误率和性能指标（至少 15 分钟）
3. 确认用户反馈渠道无异常报告
4. 更新部署记录和变更日志

## 回滚方案
- 保留前一个版本的构建产物
- 数据库迁移必须提供回滚脚本
- 回滚决策：错误率超过 1% 或核心功能不可用时立即回滚
- 回滚后进行复盘，记录根因和改进措施`,
  },
  {
    id: "sop_code_review",
    name: "代码评审 SOP",
    description: "标准代码评审流程，规范评审参与者的职责和评审标准",
    type: "sop",
    targetTool: "general",
    exportPreset: "general_markdown",
    scenario: "团队需要建立代码评审规范，或新人学习如何进行代码评审时使用",
    content: `# 代码评审 SOP

## 目的
确保代码质量、促进知识共享、降低线上故障风险。

## 适用范围
所有合并到主分支的代码变更。

## 角色与职责

### 代码提交者
- 提交前完成自测和静态检查
- PR 描述包含：变更目的、影响范围、测试方法
- 标注需要重点审查的部分
- 及时回复审查意见并修改

### 代码审查者
- 1 个工作日内完成首次审查
- 按审查清单逐项检查
- 给出具体可操作的修改建议
- 区分"阻塞问题"和"建议改进"

## 评审流程

### 1. 提交 PR
- 标题格式：\`[类型] 简要描述\`（类型：feat/fix/refactor/docs）
- 关联相关 Issue
- 代码行数建议不超过 400 行，超出需拆分

### 2. 自动检查
- CI 流水线全部通过
- 代码覆盖率未下降
- 无新增 lint 错误

### 3. 人工审查
审查顺序：
1. 变更意图是否清晰合理
2. 实现方案是否正确
3. 是否有明显的 bug 或安全隐患
4. 代码可读性和可维护性
5. 命名和风格是否符合规范
6. 是否有遗漏的边界条件

### 4. 审查结论
- **批准**：可以合并
- **需修改**：提出阻塞问题，修改后重新审查
- **建议改进**：非阻塞建议，可合并后优化

### 5. 合并
- 至少 1 人批准后方可合并
- 使用 Squash Merge 保持提交历史整洁
- 合并后自动删除分支

## 注意事项
- 对事不对人，审查意见针对代码不针对人
- 有异议时通过讨论解决，不强行推进
- 紧急修复可简化流程但事后必须补审`,
  },
  {
    id: "checklist_pre_release",
    name: "发布前检查清单",
    description: "产品发布前的完整检查清单，确保发布质量和流程完整",
    type: "checklist",
    targetTool: "general",
    exportPreset: "general_markdown",
    scenario: "每次产品版本发布前逐项检查，避免遗漏关键步骤",
    content: `# 发布前检查清单

## 代码质量
- [ ] 所有 PR 已合并到发布分支
- [ ] 无未解决的代码冲突
- [ ] 代码审查全部完成
- [ ] 无 TODO/FIXME/HACK 标记遗留（或已记录 Issue）
- [ ] 第三方依赖版本已锁定

## 测试验证
- [ ] 单元测试全部通过
- [ ] 集成测试全部通过
- [ ] E2E 测试全部通过（核心流程）
- [ ] 手动冒烟测试完成
- [ ] 回归测试通过（受影响模块）
- [ ] 性能测试无显著退化

## 功能确认
- [ ] 新功能按需求文档逐项验证
- [ ] 修复的 Bug 已验证不再复现
- [ ] 已知问题已记录并通知相关方
- [ ] 功能开关配置正确

## 数据与配置
- [ ] 数据库迁移脚本已准备并测试
- [ ] 环境变量已更新到目标环境
- [ ] 配置文件已同步
- [ ] 数据备份已完成

## 安全检查
- [ ] 无敏感信息硬编码
- [ ] API 鉴权机制正常
- [ ] 用户输入校验完整
- [ ] 依赖包无已知高危漏洞

## 文档与沟通
- [ ] 更新日志（CHANGELOG）已编写
- [ ] 用户文档已更新（如有功能变更）
- [ ] API 文档已更新（如有接口变更）
- [ ] 发布通知已准备
- [ ] 相关团队已通知（客服、运营等）

## 部署准备
- [ ] 部署脚本已测试
- [ ] 回滚方案已准备
- [ ] 发布时间窗口已确认
- [ ] 值班人员已安排
- [ ] 监控告警已配置`,
  },
  {
    id: "reply_template_customer_reply",
    name: "客户回复模板",
    description: "常见客户问题的标准回复模板，保持回复专业和一致",
    type: "reply_template",
    targetTool: "general",
    exportPreset: "plain_text",
    scenario: "回复客户咨询、投诉或反馈时使用，确保回复风格统一",
    content: `{{greeting}} {{customer_name}}，

感谢您联系{{company_name}}。

{{body}}

如有其他问题，请随时联系我们，我们将尽快为您处理。

祝好，
{{agent_name}}
{{company_name}} 客服团队

---

## 常用回复片段

### 确认收到
我们已收到您的反馈，正在安排相关团队处理。预计会在{{response_time}}内给您回复。

### 问题已解决
经核实，您反馈的问题已修复。请您重新操作确认，如仍有问题请告知我们。

### 需要更多信息
为了更好地帮助您解决问题，请提供以下信息：
1. 您的操作步骤
2. 出现问题时的截图
3. 您使用的设备和浏览器版本

### 功能建议
感谢您的建议！我们已将其记录到产品需求池中，会在后续版本中评估优先级。有进展会及时通知您。

### 无法满足需求
很抱歉目前暂不支持该功能。我们理解这给您带来的不便，已将您的需求反馈给产品团队。如有相关功能上线，我们会第一时间通知您。`,
  },
];

export function getTemplatesByType(type: AssetType): BuiltinTemplate[] {
  return BUILTIN_TEMPLATES.filter((t) => t.type === type);
}
