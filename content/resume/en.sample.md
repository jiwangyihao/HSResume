---
locale: en
name: Sample User
subtitle: Open-source developer / SWE undergraduate
highlights:
  - kind: text
    label: Sample tag
    category: default
nationality: China
email: example@example.com
homepages:
  - label: GitHub
    url: https://github.com/example
    icon: i-simple-icons-github
summary: |
  This is a **HSResume** sample content file for the public main branch.

  For local development, you can create and edit `content/resume/zh.md` / `content/resume/en.md` (ignored on main) to preview with your real content.
education:
  - period: "2023-08 to 2027-07"
    school: Sample University
    city: Sample City, Sample Country
    degree: Bachelor
    major: Software Engineering
    form: Full-time
    # roles / honors / scholarships support 2 formats:
    # 1) plain string (legacy)
    # 2) object: { text, icon?, category? } to configure icons from markdown
    #
    # category is used to pick a default icon (overridable by icon):
    # party | representation | leadership | tech | award | scholarship | default
    roles:
      - text: Youth League Branch Secretary • Probationary Member of the CPC
        category: party
      - text: Faculty Student Representative (2024/2025)
        category: representation
      - text: Tech Support Dept. Lead, Spark Notes Club
        category: leadership
      - text: Officer, HITLUG open-source student club
        category: tech
        icon: i-heroicons-command-line
      - "Teaching Assistant: Data Structures"
    honors:
      - text: "Outstanding Student" (2024)
        category: award
      - "Dean's List (2023)"
    scholarships:
      - text: Single-item People's Scholarship (2025)
        category: scholarship
internships: []
work: []
projects: []
games: []
awards: []
awardsFoldingRules:
  # Remove the entire `awardsFoldingRules` field if you don't want folding.
  # If an award title matches this regex, it is treated as explicitly unimportant
  # and will be folded under the previous important award.
  unimportantTitlePattern: (school|provincial|regional|creative group)
  # If an award title matches this regex, it is treated as important
  # and will start a new visible group.
  importantTitlePattern: (national|global|international)
languages: []
footer:
  onlineUrl: https://example.com
  copyright: Copyright © 2025 - Present Example. All Rights Reserved.
  icp:
    text: Sample ICP Filing 00000000-1
    link: https://beian.miit.gov.cn/
  psb:
    text: Sample PSB Filing 00000000000000
    link: https://www.beian.gov.cn/
    icon: /gongan_beian.png
---
