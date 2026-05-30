import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  assetTags,
  assetVersions,
  assets,
  tags,
} from "@/db/schema";
import { createContentHash } from "@/lib/hash";
import { createId } from "@/lib/id";
import { createSlug } from "@/lib/slug";
import { nowTimestamp } from "@/lib/time";
import { rebuildFtsIndex } from "@/server/services/fts-service";

export const seedAssets = [
  {
    title: "代码审查助手提示词",
    type: "chat_prompt" as const,
    targetTool: "claude" as const,
    exportPreset: "general_markdown" as const,
    description: "用于 Claude 聊天的代码审查提示词，帮助系统化审查 Pull Request 和代码变更",
    scenario: "代码审查、Pull Request 审查、代码质量检查",
    content: `你是一位资深代码审查助手。请对以下代码变更进行系统性审查。

审查维度：
1. 逻辑正确性：检查业务逻辑是否正确，边界条件是否处理
2. 安全性：检查是否存在注入、越权、敏感信息泄露等安全风险
3. 性能：检查是否存在 N+1 查询、内存泄漏、不必要的循环等性能问题
4. 可维护性：命名是否清晰，函数职责是否单一，是否有重复代码
5. 错误处理：异常是否被正确捕获和处理，错误信息是否对调试有帮助
6. 测试覆盖：关键路径是否有测试，测试用例是否覆盖边界条件

输出格式：
- 按严重程度分级：🔴 必须修复 / 🟡 建议改进 / 🟢 可选优化
- 每条问题给出具体位置、问题描述和修改建议
- 最后给出整体评价和审查结论`,
    status: "active" as const,
    rating: 4,
    visibility: "private" as const,
    source: "self_created" as const,
    pinned: true,
    tagNames: ["代码审查", "Claude", "提示词", "质量保证"],
  },
  {
    title: "项目编码规范",
    type: "system_rule" as const,
    targetTool: "claude_code" as const,
    exportPreset: "claude_md" as const,
    description: "Claude Code 项目编码规范规则，确保 AI 辅助编码时遵循统一的代码风格和架构约束",
    scenario: "AI 辅助编码、项目初始化、代码生成",
    content: `# 项目编码规范

## 命名规范
- 文件名：kebab-case（如 user-service.ts）
- 组件名：PascalCase（如 UserProfile.tsx）
- 函数/变量：camelCase（如 getUserById）
- 常量：UPPER_SNAKE_CASE（如 MAX_RETRY_COUNT）
- 类型/接口：PascalCase，接口不加 I 前缀（如 UserProfile）

## TypeScript 规范
- 严格模式开启，禁止使用 any
- 优先使用 interface 定义对象类型，type 用于联合类型和工具类型
- 所有函数参数和返回值必须显式声明类型
- 使用 enum 替代字面量联合类型当枚举值超过 3 个

## React 规范
- 函数组件优先，不使用 class 组件
- Props 使用独立 interface 定义，与组件同文件
- 状态提升到最近公共祖先，避免 prop drilling 超过 3 层
- useEffect 依赖数组必须完整，禁止 eslint-disable

## 错误处理
- 服务层捕获异常并转换为业务错误
- API 路由统一错误响应格式：{ code, message, details }
- 前端使用 ErrorBoundary 捕获渲染错误
- 永远不要吞掉异常（空 catch 块）

## 数据库规范
- 使用 Drizzle ORM，禁止原始 SQL
- 迁移必须可回滚
- 查询放在 queries 层，业务逻辑放在 services 层
- 事务用于涉及多表写操作的场景`,
    status: "active" as const,
    rating: 5,
    visibility: "private" as const,
    source: "self_created" as const,
    pinned: true,
    tagNames: ["编码规范", "Claude Code", "TypeScript", "React"],
  },
  {
    title: "API 文档生成技能",
    type: "agent_skill" as const,
    targetTool: "trae_solo" as const,
    exportPreset: "codex_skill_md" as const,
    description: "Trae Solo Agent 技能，根据代码接口自动生成标准化的 API 文档",
    scenario: "API 文档编写、接口文档生成、OpenAPI 规范输出",
    content: `# API 文档生成技能

## 触发条件
当用户要求为接口生成文档、编写 API 说明、或输出 OpenAPI 规范时激活。

## 执行步骤

1. 分析代码中的接口定义
   - 提取路由路径、HTTP 方法
   - 识别请求参数（query、path、body）
   - 识别响应结构和状态码
   - 检查认证和权限要求

2. 生成文档结构
   - 接口概述：简要描述接口用途
   - 请求说明：URL、方法、Headers
   - 参数表格：名称、类型、必填、说明、示例
   - 响应说明：状态码、响应体结构、字段说明
   - 错误码列表
   - 请求/响应示例

3. 格式要求
   - Markdown 格式输出
   - 参数表格使用标准表格语法
   - 示例使用 JSON 代码块
   - 错误码按 HTTP 状态码排序

4. 质量检查
   - 所有参数是否都有说明
   - 示例是否与参数定义一致
   - 是否覆盖所有错误情况
   - 是否标注了废弃接口`,
    status: "active" as const,
    rating: 4,
    visibility: "private" as const,
    source: "self_created" as const,
    pinned: false,
    tagNames: ["API文档", "Trae Solo", "技能", "自动化"],
  },
  {
    title: "技术问题回复模板",
    type: "reply_template" as const,
    targetTool: "general" as const,
    exportPreset: "general_markdown" as const,
    description: "技术问题回复模板，支持变量填充，适用于社区问答和技术支持场景",
    scenario: "技术社区回复、工单回复、技术支持",
    content: `## {{question}}

关于 {{technology}} 的这个问题，以下是详细解答：

### 问题分析

{{question}} 是 {{technology}} 中常见的场景。核心原因在于：

{{answer}}

### 解决方案

1. 确认 {{technology}} 版本和环境配置
2. 按照以下步骤操作：
   {{answer}}
3. 验证结果是否符合预期

### 注意事项

- 该方案适用于 {{technology}} 3.x 及以上版本
- 如果遇到 {{error_code}} 错误，请检查配置文件中的 {{config_key}} 参数
- 生产环境部署前建议在测试环境验证

### 相关资源

- {{technology}} 官方文档：参考 {{doc_section}} 章节
- 示例代码：{{example_url}}

---

如果以上方案未能解决问题，请提供以下信息以便进一步排查：
- {{technology}} 版本号
- 完整错误日志
- 最小复现步骤`,
    status: "active" as const,
    rating: 3,
    visibility: "private" as const,
    source: "self_created" as const,
    pinned: false,
    tagNames: ["回复模板", "技术支持", "变量模板", "社区"],
  },
  {
    title: "新项目初始化流程",
    type: "workflow" as const,
    targetTool: "general" as const,
    exportPreset: "general_markdown" as const,
    description: "新项目从零到可开发的完整初始化流程，涵盖仓库创建到首次提交的全过程",
    scenario: "新项目启动、团队项目初始化、开发环境搭建",
    content: `# 新项目初始化流程

## 第一步：项目规划

- [ ] 确定项目名称和描述
- [ ] 明确技术栈选型（框架、语言、数据库、部署方案）
- [ ] 梳理核心功能模块和目录结构
- [ ] 确定代码规范和 Git 分支策略

## 第二步：仓库初始化

- [ ] 创建 Git 仓库（GitHub/GitLab）
- [ ] 配置 .gitignore（node_modules、.env、dist、.next 等）
- [ ] 初始化项目：npm init / create-next-app / 其他脚手架
- [ ] 配置 TypeScript（tsconfig.json）
- [ ] 配置 ESLint + Prettier
- [ ] 首次提交：init: project scaffold

## 第三步：基础设施

- [ ] 配置环境变量方案（.env.example + .env.local）
- [ ] 配置数据库连接和 ORM
- [ ] 执行首次数据库迁移
- [ ] 配置日志方案
- [ ] 配置错误监控（Sentry 等）

## 第四步：开发规范

- [ ] 编写 README.md（项目说明、启动方式、开发指南）
- [ ] 编写 AGENTS.md 或 CLAUDE.md（AI 编码规则）
- [ ] 配置 CI/CD 流水线
- [ ] 配置 PR 模板和审查规则
- [ ] 配置 commitlint 或 conventional commits

## 第五步：验证

- [ ] 新成员 clone 后能一键启动
- [ ] npm run typecheck 通过
- [ ] npm run lint 通过
- [ ] npm run build 通过
- [ ] 数据库迁移可正常执行`,
    status: "active" as const,
    rating: 4,
    visibility: "private" as const,
    source: "self_created" as const,
    pinned: false,
    tagNames: ["工作流", "项目初始化", "规范", "Checklist"],
  },
  {
    title: "产品界面设计提示词",
    type: "image_prompt" as const,
    targetTool: "dalle" as const,
    exportPreset: "plain_text" as const,
    description: "用于生成产品界面设计稿的图像提示词，适用于 DALL-E 等图像生成工具",
    scenario: "UI 设计灵感、产品原型视觉化、设计稿生成",
    content: `A clean, modern SaaS dashboard interface design, dark theme with subtle blue accents, left sidebar navigation with icon-only collapsed state, main content area showing data visualization cards with line charts and KPI metrics, top bar with search input and user avatar, rounded corners on all cards, 8px spacing grid system, professional typography using Inter font, glassmorphism effects on hover states, responsive layout optimized for 1440px viewport, high fidelity UI mockup, no text placeholders, realistic data in charts, subtle drop shadows, Figma-style design quality, 4K resolution`,
    status: "draft" as const,
    rating: null,
    visibility: "private" as const,
    source: "self_created" as const,
    pinned: false,
    tagNames: ["图像提示词", "UI设计", "DALL-E", "产品界面"],
  },
];

export async function seedPresetAssets(database: typeof db): Promise<number> {
  const existing = await database.select({ id: assets.id }).from(assets).limit(1);
  if (existing.length > 0) return 0;

  const now = nowTimestamp();
  let count = 0;

  for (const item of seedAssets) {
    const id = createId();
    const syncId = createId();
    const slug = createSlug(item.title);
    const contentHash = createContentHash(item.content);

    await database.insert(assets).values({
      id,
      syncId,
      slug,
      title: item.title,
      type: item.type,
      targetTool: item.targetTool,
      exportPreset: item.exportPreset,
      description: item.description,
      scenario: item.scenario,
      content: item.content,
      contentHash,
      status: item.status,
      rating: item.rating,
      visibility: item.visibility,
      source: item.source,
      sourceUrl: null,
      pinned: item.pinned,
      createdAt: now,
      updatedAt: now,
      lastUsedAt: null,
      lastSyncedAt: null,
      deletedAt: null,
    });

    await database.insert(assetVersions).values({
      id: createId(),
      assetId: id,
      version: 1,
      titleSnapshot: item.title,
      contentSnapshot: item.content,
      contentHash,
      changeNote: "初始版本",
      score: null,
      createdAt: now,
    });

    for (const tagName of item.tagNames) {
      const normalizedName = tagName.trim().toLowerCase();
      const existingTags = await database
        .select()
        .from(tags)
        .where(eq(tags.name, normalizedName));

      let tagId: string;
      if (existingTags.length > 0) {
        tagId = existingTags[0].id;
      } else {
        tagId = createId();
        await database.insert(tags).values({
          id: tagId,
          name: normalizedName,
          createdAt: now,
        });
      }

      await database.insert(assetTags).values({
        assetId: id,
        tagId,
      });
    }

    count++;
  }

  rebuildFtsIndex();

  return count;
}
