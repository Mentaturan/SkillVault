---
title: Bug 修复分析提示词
type: chat_prompt
targetTool: general
exportPreset: general_markdown
description: 用于引导 AI 系统化分析 Bug 的聊天提示词，从复现到根因到修复方案
tags:
  - Bug修复
  - 提示词
  - 问题分析
  - 调试
---

## {{bug_title}}

请对以下 Bug 进行系统化分析：

### Bug 描述

{{bug_description}}

### 复现步骤

1. {{step_1}}
2. {{step_2}}
3. {{step_3}}

### 期望行为

{{expected_behavior}}

### 实际行为

{{actual_behavior}}

---

请按以下结构输出分析结果：

### 1. 影响范围

- 影响的功能模块
- 影响的用户群体和场景
- 严重程度评估（P0-P3）

### 2. 根因分析

- 直接原因：导致 Bug 的代码层面原因
- 根本原因：流程或设计层面的问题
- 使用 5-Why 方法逐层追问

### 3. 修复方案

- 最小修复：仅修复当前 Bug 的改动
- 推荐修复：防止同类问题再次出现的改动
- 每个方案给出改动范围和风险评估

### 4. 回归测试

- 修复后需要验证的场景
- 可能引入的新风险
- 建议补充的测试用例

### 5. 预防措施

- 代码层面：类型约束、断言、Lint 规则
- 流程层面：Review 检查项、CI 检查
- 监控层面：告警指标、日志埋点
