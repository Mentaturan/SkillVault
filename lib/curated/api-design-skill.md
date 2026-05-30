---
title: API 设计 Agent 技能
type: agent_skill
targetTool: codex
exportPreset: codex_skill_md
description: Codex Agent 技能，根据需求描述自动设计 RESTful API 接口，输出规范化的接口文档
tags:
  - API设计
  - Codex
  - Agent技能
  - RESTful
---

# API 设计 Agent 技能

## 触发条件

当用户要求设计 API、定义接口、规划 API 结构、或输出接口文档时激活。

## 执行步骤

### 1. 需求分析

- 提取业务实体和核心操作
- 识别实体间关系（一对一、一对多、多对多）
- 确定操作类型（CRUD + 自定义动作）
- 确认认证和权限要求

### 2. 接口设计

遵循 RESTful 规范：

- 资源命名使用复数名词（如 /users、/orders）
- HTTP 方法语义：GET 查询、POST 创建、PUT 全量更新、PATCH 部分更新、DELETE 删除
- 嵌套资源不超过两层（如 /users/:id/orders）
- 使用查询参数做过滤、排序、分页
- 动作类操作使用 POST /resources/:id/actions/:action

### 3. 响应格式

统一响应结构：

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

错误响应：

```json
{
  "code": "ERROR_CODE",
  "message": "Human readable message",
  "details": []
}
```

### 4. 状态码使用

- 200：成功
- 201：创建成功
- 204：删除成功（无返回体）
- 400：请求参数错误
- 401：未认证
- 403：无权限
- 404：资源不存在
- 409：冲突（重复创建）
- 422：业务校验失败
- 500：服务端错误

### 5. 版本策略

- URL 路径版本：/v1/users
- 破坏性变更升级大版本
- 同一大版本内保持向后兼容

### 6. 输出格式

每个接口输出包含：

- 接口路径和 HTTP 方法
- 请求参数（路径参数、查询参数、请求体）
- 响应结构和字段说明
- 错误码列表
- 请求/响应示例
