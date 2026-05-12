---
title: Claude Code 代码编辑能力
tags: [claude-code, editing, tools]
created: 2026-05-12T00:00:00.000Z
updated: 2026-05-12T00:00:00.000Z
---

# Claude Code 代码编辑能力

Claude Code 提供三种主要的文件编辑工具：Read、Write、Edit。

## Read 工具

读取文件内容，支持多种格式：

- 纯文本和代码文件（支持行偏移和行数限制）
- 图片（PNG、JPG 等），可进行视觉分析
- PDF 文件（支持页码范围）
- Jupyter Notebook（.ipynb）

```bash
# 基本用法
Read file_path="/path/to/file.ts"

# 读取指定范围
Read file_path="/path/to/file.ts" offset=100 limit=50
```

## Write 工具

创建新文件或完全覆盖现有文件。写入前必须先 Read 已有文件。

**适用场景**：
- 创建全新文件
- 完全重写文件内容

**注意**：对于已有文件的局部修改，应优先使用 Edit 工具。

## Edit 工具

精确的字符串替换，是修改现有文件的首选工具：

- `replace_all` 参数可批量替换所有匹配项
- 替换文本必须包含足够的上下文以保证唯一性
- 自动检测替换冲突

**示例**：
```
old_string: "function getCwd() {"
new_string: "function getCurrentWorkingDirectory() {"
```

### 编辑原则

1. **优先编辑而非重写**：对现有文件的修改使用 Edit 工具，减少 diff 大小
2. **精确匹配**：old_string 必须与文件内容完全一致（包括缩进、空格）
3. **上下文唯一性**：如果匹配不唯一，Edit 会失败，需要提供更多上下文
4. **批量替换**：如果需要重命名多处，使用 `replace_all: true`

## NotebookEdit 工具

专门用于编辑 Jupyter Notebook (.ipynb) 文件：

- 替换/插入/删除指定 cell
- 支持 code 和 markdown 两种 cell 类型
- 通过 cell_id 精确定位

## 编码规范

在 [[claude-code-settings]] 中配置的 CLAUDE.md 文件可以定义项目代码风格，Claude Code 会自动遵循这些规范进行编辑。
