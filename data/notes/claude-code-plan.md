---
title: Claude Code Plan Mode 计划模式
tags: [claude-code, plan, architecture, design]
created: 2026-05-12T00:00:00.000Z
updated: 2026-05-12T00:00:00.000Z
---

# Claude Code Plan Mode 计划模式

Plan Mode 是 Claude Code 的"先规划后实施"工作模式，在执行复杂任务前先设计方案并获得用户确认。

## 何时使用 Plan Mode

**应该使用**的场景：

1. **新功能实现**：需要确定组件位置、数据流、状态管理
2. **多种可行方案**：如缓存策略（Redis vs 内存 vs 文件）
3. **影响现有行为**：修改 login flow、重构认证系统
4. **架构决策**：选择 WebSocket vs SSE vs 轮询
5. **多文件改动**：可能涉及 3 个以上文件
6. **需求不够明确**：需要探索后确定范围
7. **用户偏好重要**：多种合理方案需要用户选择

**不应该使用**的场景：

- 单行修复（typo、明显 bug）
- 添加单个函数（需求清晰）
- 纯研究/探索任务

## 工作流程

1. **进入 Plan Mode**：使用 `EnterPlanMode` 工具
2. **深入探索**：使用 Glob/Grep/Read 了解现有架构
3. **设计实现**：在 plan 文件中编写详细方案
4. **退出并请求审批**：使用 `ExitPlanMode` 提交方案
5. **用户审批**：用户查看方案并决定是否批准
6. **实施**：按计划逐步执行

## Plan 文件内容

Plan 文件应包括：

- **Context**：任务背景和动机
- **方案**：分阶段的实施步骤
- **文件清单**：需要创建/修改的文件
- **实施顺序**：阶段的依赖关系
- **验证方法**：如何确认实现正确

## Plan Agent

可以委托 Plan Agent 设计架构方案：

```bash
Agent(
  description="设计缓存方案",
  prompt="为 API 响应设计缓存策略，需要比较 Redis、内存缓存、文件缓存三种方案...",
  subagent_type="Plan"
)
```

详见 [[claude-code-agents]]

## 最佳实践

1. 复杂任务宁可先计划再实施，避免返工
2. Plan 中标注关键决策点和权衡
3. 实施过程中如有重大偏离，更新 plan 文件
4. 使用 `AskUserQuestion` 澄清模糊需求，而非猜测
