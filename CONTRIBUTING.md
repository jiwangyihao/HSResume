# Contributing / 协作指南

> 这份文档主要面向**维护者/协作者**：涉及分支策略、worktree 工作流、以及代码结构约定。
> 如果你只是“改简历内容/改样式然后部署”，通常只需要看“快速上手（私密内容工作流）”即可。

## 你最可能需要的：快速上手（私密内容工作流）

本仓库使用 **双分支 + Git worktree** 来隔离“可开源的公共代码”和“私密简历内容”。日常最推荐的操作路径：

1. 初始化/确保 content worktree 存在：

- `pnpm content:init`

2. 在 `main` 工作区编辑私密文件（本地存在、不会提交到 `main`）：

- `content/resume/zh.md`
- `content/resume/en.md`
- `public/avatar.png`

3. 同步私密内容到 content worktree（并默认合并 `main` 的公共改动）：

- `pnpm content:sync`

4. 在 content worktree 提交私密内容：

- `pnpm content:commit -- -m "chore(content): update resume"`

5. 想确认有没有跑偏：

- `pnpm content:status`

> Windows / PowerShell 提示：上面 `--` 是把参数透传给脚本，按原样使用即可。

## 分支与职责（为什么要这样做）

这个仓库采用两条分支：

- `main`：公共代码（主题/样式/组件/示例内容）。可以放心开源/PR。
- `content`：私密内容（真实 `zh.md` / `en.md` / `avatar.png`）。只在你自己的仓库/私密环境维护。

这样能同时满足：

- `main` 永远不包含真实简历与头像
- 本地开发时仍然可以用真实内容预览
- 私密内容提交发生在 `content` 分支，不会被 `main` 的 `.gitignore`/切分支影响

## 私密文件与 sample 回退

在 `main` 分支中，这些文件应被 `.gitignore` 忽略（仅本地存在）：

- `content/resume/zh.md`
- `content/resume/en.md`
- `public/avatar.png`

`main` 分支提供对应的示例文件（可开源）：

- `content/resume/zh.sample.md`
- `content/resume/en.sample.md`
- `public/avatar.sample.svg`

页面逻辑会在找不到真实文件时自动回退到 sample。

## worktree 目录结构（两个工作区）

建议的布局（相对路径表达）：

- `./`：本仓库（`main` worktree）
- `../HSResume-content/`：`content` worktree（默认脚本路径）

为什么不建议“同一个工作区直接切分支”？

- `main` 忽略私密文件后，切分支/合并更容易触发删除、冲突或误提交
- worktree 让两个分支各自有独立工作目录，减少心智负担

## 一键脚本（content worktree 管理）

仓库提供脚本：`scripts/content-worktree.mjs`。

### 初始化 content 工作区

创建/确保 `content` 分支对应的 worktree 存在（默认目录：`../HSResume-content`）：

- `pnpm content:init`

### 同步私密内容到 content worktree

当你在 `main` 工作区修改了本地私密文件（更新 `zh.md/en.md`、替换 `avatar.png` 等），运行：

- `pnpm content:sync`

默认行为：

- 先在 `content` worktree 中合并 `main` 的公共改动（避免“复制提交”导致历史分叉）
- 再把 `main` 工作区的私密文件复制到 `content` worktree
- 最后打印 `content` 的 git 状态

如需跳过合并（不推荐）：

- `pnpm content:sync -- --no-merge`

### 在 content worktree 里提交

- `pnpm content:commit -- -m "chore(content): update resume"`

### 查看状态

- `pnpm content:status`

### 自定义 worktree 目录（相对路径）

如果你不想用默认的 `../HSResume-content`，可以指定相对路径：

- `pnpm content:init -- --dir ..\\my-content-worktree`

脚本会以“仓库根目录”为基准解析相对路径。

## 代码协作约定：前端组件落盘规则（强约定）

目标：让 `app/pages/index.vue` 逐步瘦身为**装配层**；组件目录按职责拆分，避免项目演进后目录退化。

### 组件目录职责

所有组件统一放在 `app/components/` 下，并遵循：

- `app/components/content/`

  - **渲染器 / 格式化器**：把 Markdown/富文本/代码块等“内容源”渲染为 HTML。
  - 示例：`Markdown.vue`。
  - 约束：不依赖具体简历业务字段（尽量只吃 `source`/`tag`/`unwrap` 等通用 props）。

- `app/components/shared/`

  - **跨版块复用的 UI 壳**：与业务无关、可在多个 section 复用。
  - 示例：`SectionHeader.vue`、`BadgePills.vue`、`ResumeSkeleton.vue`、`ResumeActionBar.vue`。
  - 约束：不读全局状态，不直接访问简历数据结构（允许接收少量通用 props）。

- `app/components/sections/`

  - **业务版块/区域组件**：对应页面中的一个完整区域（Header/Profile/Education/Projects…）。
  - 命名建议：`XxxSection.vue`；对于特殊区域（如 Header）允许使用更直观的 `ResumeHeader.vue`。
  - 约束：可以读取简历的业务字段（`ResumeEntry` 等），但尽量把视觉原子复用给 `shared/` 或 `cards/`。

- `app/components/cards/`（后续引入）

  - **条目/卡片组件**：列表里重复出现的单元，如项目卡片、教育条目、奖项条目等。
  - 命名建议：`XxxCard.vue`、`XxxItem.vue`。
  - 约束：不负责版块标题/布局，只渲染单条数据。

### 命名与约束（默认规则）

- 文件名使用 PascalCase：`ProjectCard.vue`、`EducationSection.vue`。
- 组件 props 尽量显式类型：优先使用项目内的类型（如 `ResumeEntry`、`ResumeLocale`）。
- 不把打印样式的“行为差异”藏在多个地方：
  - `print:hidden/print:flex` 等 Tailwind utilities 必须保持可控层叠
  - 自定义 utility shims 必须放低优先级 layer，避免覆盖 Tailwind
- `index.vue` 只做“装配”：
  - 负责拿数据（composables）+ 传 props + 放置少量与布局测量相关的 ref
  - 不再堆叠大量重复模板

## 常见问题

### 1) 我担心误把私密内容提交到 main

- `main` 已通过 `.gitignore` 忽略私密文件。
- 建议只在 `content` worktree 做提交（用 `pnpm content:commit`）。

### 2) content worktree 创建失败

常见原因：

- `content` 分支已经被其它 worktree 占用
- `../HSResume-content` 目录已存在但不是 worktree

解决：

- 运行 `pnpm content:status` 看当前 worktree 列表
- 或用 `--dir` 换一个目录
