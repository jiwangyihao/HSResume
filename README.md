# <img src="./public/favicon.svg" width="24" height="24" alt="HSResume" /> HSResume

基于 **Nuxt v4** 构建的简历展示与打印页面。内容由 Markdown/YAML 驱动，支持静态生成与部署。

## Why HSResume?

**HSResume** stands for **Human‑centric & Structured Resume**:

- **Human‑centric**：强调以候选人的真实故事和特点为中心，而不是只堆技术关键词。模板支持用 Markdown 自由组织内容，让你的经历更贴近「人」而不是「机器生成的列表」。
- **Structured**：通过模块化配置和响应式布局，把信息组织成清晰的层级与版块，在网页和打印视图中都保持一致、专业的展示效果。

## 主要特性

- **数据驱动**：通过 Markdown Frontmatter 管理简历数据，便于版本控制。
- **打印优化**：针对打印场景进行了样式适配，支持自动隐藏交互元素与链接处理。
- **双语支持**：内置中英文切换功能。

## 快速开始

```bash
pnpm install
pnpm dev
# 浏览器访问 http://localhost:3000
```

## 生成静态站点

```bash
pnpm generate
# 输出位于 .output/public，可直接推送至 GitHub Pages / 静态托管
```

## 目录结构

```text
.
├── app/                # Nuxt 应用源码 (组件, 页面, 布局)
├── content/            # 简历内容 (Markdown/YAML)
├── public/             # 静态资源 (头像, 图标)
├── schemas/            # 数据校验 Schema
├── scripts/            # 辅助脚本 (Worktree 管理, 资源缓存)
└── nuxt.config.ts      # Nuxt 配置文件
```

## 配置指南

简历内容位于 `content/resume/` 目录下，支持 `zh.md` (中文) 和 `en.md` (英文)。

### 基础字段

支持的字段如下（详细定义见 `schemas/resume-frontmatter.schema.json`）：

- **基础信息**：`name`, `subtitle`, `highlights`, `nationality`, `email`, `homepages`, `summary`
- **教育经历**：`education` (包含 `period`, `school`, `city`, `degree`, `major`, `form`, `roles`, `honors`, `scholarships`)
- **工作/实习**：`work`, `internships`
- **项目经历**：`projects` (包含 `period`, `name`, `role`, `description`, `responsibilities`, `links`)
- **游戏经历**：`games` (包含 `name`, `detail`, `notes`)
- **奖项荣誉**：`awards` (包含 `date`, `title`)
- **语言能力**：`languages` (包含 `name`, `certificate`)

### 高级配置

#### 奖项折叠 (Awards Folding)

当奖项较多时，可通过正则规则自动折叠“不重要”的奖项，保持版面整洁。

```yaml
awardsFoldingRules:
  # 匹配该正则的奖项会被折叠
  unimportantTitlePattern: (校级|省级|区域|creative group)
  # 匹配该正则的奖项会强制开始新分组
  importantTitlePattern: (全国|全球|international|national)
```

#### 主题配色 (Colors)

支持为不同版块指定颜色，可使用 Tailwind CSS 颜色名（如 `primary`, `blue`, `gray`）或 Hex 色值。

```yaml
colors:
  profile: primary
  education: blue
  projects: emerald
  awards: amber
```

#### GitHub 贡献图

在页脚展示 GitHub 贡献热力图。

```yaml
github:
  user: your-username
  orgs: [] # 可选：包含的组织
```

## 自定义与扩展

### 样式定制

- **全局样式**：修改 `app/assets/css/main.css` 可调整字体、间距等全局 CSS 变量。
- **组件样式**：项目使用 Tailwind CSS，可直接在组件类名中修改样式。

### 图标系统

项目集成了 Iconify，支持在 YAML 配置中直接使用图标类名（如 `homepages` 或 `projects` 的 `icon` 字段）：

- `i-heroicons-envelope`
- `i-simple-icons-github`
- `i-ph-globe`

## 界面与打印

- **多语言**：右上角支持中/英切换。
- **打印优化**：
  - 点击打印按钮或使用浏览器打印 (Ctrl+P) 即可输出 PDF。
  - 打印模式下会自动隐藏交互元素（按钮、切换器）。
  - 链接会自动处理显示格式，适应纸质阅读。
  - 内容顺序由 Markdown 的 `sectionOrder` 和 `projects` 数组决定，网页与打印共用；`printWidth`、`awardsPrintWidth` 仅控制打印列宽。
  - `overview` 聚合个人信息、教育与开源贡献：屏幕上仍使用原来的瀑布流排列，打印时才组成等高双栏，并将贡献图置于两栏下方。
  - 打印采用 12 列瀑布流；`printWidth: 70` / `30` 对应 8 / 4 列，适合宽窄项目配对，`50` 对应等宽双栏。
  - 项目按较粗的技术方向与成果优先级排列，不增加可见分类标题；通过项目自身的 `printWidth` 调整打印配对，不改变正文、字号或共用卡片组件。当前中文原生 PDF 共 7 页：第 4 页稷下独占左列，右列 Saturn 在上、小希在下；`printWidth` 分别为 `42`、`58`、`58`，映射为左侧 5 列、右侧 7 列，三个项目完整同页。瀑布流不保证后续内容变化后仍保持同页，需以实际 PDF 重新检查。
  - 第 5 页 GXDE 独占左侧 5 列，星火与 Newcar 在右侧 7 列上下排列，对应 `printWidth: 42 / 58 / 58`；只调整打印列宽，保留项目顺序、正文和字号。
  - 打印简介在实际的段落容器上设置行距、段距和两端分布，使左栏文字在视觉上与右栏底部对齐，不影响网页排版。
  - 网页奖项保留悬停叠卡；打印使用独立布局，主奖项和附属奖项完整展示，并与实习卡片共用 20px 内边距。长标题建议搭配 `awardsPrintWidth: 100`。

打印瀑布流依赖 `grid-template-rows: masonry`，请使用支持该特性的 Firefox 原生打印预览验收，不以 Chromium 的打印媒体模拟替代。正式导出前先运行 `pnpm generate` 并预览 `.output/public`，避免开发热更新在打印期间重置加载状态。当前中文排版以 A4 纵向、默认边距和自适应页面宽度验收；内容增减后需重新逐页检查。

打印奖项使用与整页一致的 Firefox 原生瀑布流（`grid-template-rows: masonry`）：每个主项及其全部次级奖项构成独立单元，按原始顺序自动排入较短的列，使用统一的 `0.5rem` 纵向组间距。不按组数拆列，不创建等高列容器，也不强制底部对齐。赛事名称与奖级、日期分行呈现，主项奖级使用主题强调色，次级奖项保留在主项下并用细竖线区分；较窄打印区域自动降为单栏。标题仍按最后一个 ` - ` 分隔赛事与奖级，无分隔符则保留完整标题；行内 Markdown 复用 `inline-content`，避免内部容器强制换行。这些变化仅作用于打印，网页保留原有悬停叠卡交互。

## 部署指引（GitHub Pages 示例）

推荐方式（GitHub Actions 自动部署）：

1. 在仓库设置中将 Pages 的 Source 选择为 **GitHub Actions**。
2. 推送到 `content` 分支后，会自动执行 `pnpm generate` 并发布到 Pages。

手动方式（发布到 `gh-pages` 分支）：

1. `pnpm install && pnpm generate`
2. 将 `.output/public` 发布到 `gh-pages` 分支。
3. 在仓库设置里启用 Pages，指向 `gh-pages`。

## 依赖

- Nuxt 4
- @nuxt/content
- @nuxt/ui
- @nuxt/image

如需开发调试，可开启 Nuxt DevTools。
