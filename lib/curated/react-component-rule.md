---
title: React 组件开发规则
type: system_rule
targetTool: cursor
exportPreset: cursor_rules
description: Cursor 辅助 React 组件开发时遵循的规则，覆盖组件设计、状态管理、性能和样式
tags:
  - React
  - Cursor
  - 组件开发
  - 前端规范
---

# React 组件开发规则

## 组件设计

- 函数组件优先，禁止使用 class 组件
- 单一职责：一个组件只做一件事，超过 150 行考虑拆分
- Props 使用独立 interface 定义，与组件同文件导出
- 组件文件名使用 PascalCase，与导出组件名一致
- 避免 prop drilling 超过 3 层，优先使用组合模式或 Context

## 状态管理

- 本地状态用 useState，跨组件共享用 Context
- 派生状态不要存入 state，直接计算
- useEffect 仅用于副作用，不用于数据转换
- useEffect 依赖数组必须完整，禁止 eslint-disable
- 状态提升到最近公共祖先

## 性能

- 列表渲染必须提供稳定 key，禁止使用 index
- 昂贵计算使用 useMemo，重渲染频繁的子组件使用 React.memo
- 大列表使用虚拟滚动（react-window / react-virtuoso）
- 图片使用懒加载和合适的尺寸格式
- 避免在渲染路径中创建新对象/函数引用

## 样式

- 使用 Tailwind CSS，不引入额外 CSS-in-JS 方案
- 类名按一致性顺序排列：布局 → 尺寸 → 间距 → 排版 → 颜色 → 状态
- 复用样式组合提取为 cva variant 或独立组件
- 响应式使用 Tailwind 断点前缀，不使用自定义媒体查询
- 深色模式使用 dark: 前缀

## 错误处理

- 组件级使用 ErrorBoundary 捕获渲染错误
- 异步操作使用 try/catch，展示友好的错误状态
- 加载状态必须处理，使用 Skeleton 或 Spinner
- 空状态必须处理，提供引导操作
