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

## 代码结构约定（前端 / 单一权威来源）

本节是本仓库关于**目录结构、组件职责划分、以及瀑布流/打印硬约束**的唯一权威来源。

> 目标：让 `app/pages/index.vue` 保持为“装配层（composition/assembly layer）”，并确保 SSR / prerender / 打印行为在重构中不回退。

### 目录分层（按职责，而非业务域）

#### `app/pages/`

- 页面路由入口。
- 约定：页面只做 **数据获取 + 组件装配 + 少量布局测量 ref**，避免堆叠大量业务模板。

#### `app/components/`

组件统一放在这里，并按职责拆分：

- `app/components/layout/`

  - 页面级布局与框架组件（Header / Footer / ActionBar / Skeleton 等）。
  - 例：`ResumeHeader.vue`, `ResumeFooter.vue`, `ResumeActionBar.vue`, `ResumeSkeleton.vue`。

- `app/components/sections/`

  - 页面中的“版块/区域”组件。
  - 约定：**默认一文件对应一个瀑布流 item**；若需要输出多个瀑布流 item，可使用多根模板（fragment）输出多个 `.waterfall-item`。
  - 例：`ProjectsSection.vue`, `AwardsSection.vue`, `GithubSection.vue`。

- `app/components/cards/`

  - 列表中重复出现的“条目/卡片”组件，只负责渲染单条数据，不负责版块标题与布局。
  - 例：`ProjectCard.vue`。

- `app/components/ui/`

  - 与具体业务字段无关的可复用 UI 组件。
  - 例：`SectionHeader.vue`, `BadgePills.vue`。

- `app/components/content/`
  - 内容渲染/格式化器（例如 Markdown 渲染）。
  - 例：`Markdown.vue`。

#### `app/composables/`

- 可复用的组合式函数。
- 约定：页面数据组装优先放这里（例如 `useResumePageModel`）。

#### `app/types/`

- 项目内共享 TypeScript 类型（例如 `ResumeEntry` 等）。

### Nuxt 自动导入约定

- 本项目启用了组件自动导入，并配置为 **不带路径前缀**（`pathPrefix: false`）。

  - 因此模板中可以直接使用 `<ResumeHeader />`、`<SectionHeader />` 等组件标签。
  - 组件文件名必须保持唯一、清晰（PascalCase）。

- `app/composables/` 下的组合式默认可自动导入。
  - 约定：在同项目内调用 `useXxx()` 优先不写显式 import，除非出现命名冲突或需要显式绑定。

### 瀑布流布局硬约束（非常重要）

瀑布流布局逻辑依赖选择器 `:scope > .waterfall-item`，因此：

1. `.waterfall-item` **必须是容器的直系子元素**。
2. `sections/` 组件不要在外层额外包一层 wrapper 去“凑布局”。
   - 若一个 section 需要输出多个瀑布 item，请使用多根模板输出多个 `.waterfall-item`。
3. `AwardsSection` 必须保留 `id="awards-section"`（用于锁高/避免 hover 导致布局抖动）。

### 打印（print）与样式硬约束

- 影响瀑布流/打印行为的关键 CSS 必须放在全局 `app/assets/css/main.css`。

  - 避免将这些规则放进 `scoped` 样式中（会导致选择器命中失败，进而破坏布局/打印）。

- 避免在多个组件内分散实现“打印差异逻辑”。优先用 Tailwind `print:*` utilities，并确保层叠可控。

### 导入（imports）与路径别名

- 统一使用 `~/` 作为绝对导入前缀（例如 `~/types/resume`）。
- 对于**可由 Nuxt 自动导入的组件/组合式**，尽量移除显式 import，以减少样板代码。

### 修改后必须做的验证

每次重构（尤其涉及模板结构、样式、瀑布流 item）后：

- 必须通过 `pnpm -s build`（确保 SSR/prerender 不回退）。
- 需要人工快速确认：
  - 页面瀑布流正常（各 section 均为直系 `.waterfall-item`）。
  - 打印预览布局/隐藏规则符合预期（`print:*` 生效）。

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
