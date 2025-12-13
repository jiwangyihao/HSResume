---
locale: zh
name: 示例用户
subtitle: 开源开发者 / 软件工程本科生
highlights:
  - kind: text
    label: 示例标签
    category: default
nationality: 中国
email: example@example.com
homepages:
  - label: GitHub
    url: https://github.com/example
    icon: i-simple-icons-github
summary: |
  这是 **HSResume** 的示例内容文件（用于开源主分支演示）。

  你可以在本地创建并编辑 `content/resume/zh.md` / `content/resume/en.md`（主分支会忽略它们），用真实内容进行开发预览。
education:
  - period: "2023-08 至 2027-07"
    school: 示例大学
    city: 示例省-示例市
    degree: 本科
    major: 软件工程
    form: 全日制
    # roles / honors / scholarships 的条目支持两种写法：
    # 1) 纯字符串（兼容旧格式）
    # 2) 对象：{ text, icon?, category? }，可在 Markdown 中配置图标
    #
    # category 会用于选择默认 icon（可被 icon 覆盖），内置：
    # party | representation | leadership | tech | award | scholarship | default
    roles:
      - text: 班级团支书 • 预备党员
        category: party
      - text: 学部学生代表 (2024/2025)
        category: representation
      - text: 薪火笔记社技术支持部部长
        category: leadership
      - text: HITLUG 开源学生俱乐部干事
        category: tech
        icon: i-heroicons-command-line
      - "助教：数据结构"
    honors:
      - text: 示例大学“优秀学生” (2024)
        category: award
      - "示例学院：Dean's List (2023)"
    scholarships:
      - text: 单项人民奖学金 (2025)
        category: scholarship
internships: []
work: []
projects: []
games: []
awards: []
awardsFoldingRules:
  # 不需要折叠的话，删掉整个 awardsFoldingRules 字段即可。
  # 若奖项标题匹配该正则，将被视为“显式不重要”，会折叠到上一条重要奖项下。
  unimportantTitlePattern: (校级|省级|区域|创意组|regional|university|creative group)
  # 若奖项标题匹配该正则，将被视为“重要”，会开始一个新的可见分组。
  importantTitlePattern: (全国|全球|international|national|global)
languages: []
footer:
  onlineUrl: https://example.com
  copyright: Copyright © 2025 - Present Example. All Rights Reserved.
  icp:
    text: 示例ICP备案00000000号-1
    link: https://beian.miit.gov.cn/
  psb:
    text: 示例公网安备00000000000000号
    link: https://www.beian.gov.cn/
    icon: /gongan_beian.png
---
