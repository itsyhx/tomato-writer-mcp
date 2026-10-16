<div align="center">

# 🍅 tomato-writer-mcp

**让 AI 直接帮你写小说 —— 在 Claude / Cursor 里用一句话管书、发章节、盯数据。**

番茄小说作家后台的 [MCP](https://modelcontextprotocol.io) Server，**零浏览器依赖**，纯 HTTP + Cookie，部署只要 10 秒。

<p>
  <a href="https://github.com/itsyhx/tomato-writer-mcp"><img src="https://img.shields.io/badge/GitHub-tomato--writer--mcp-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License"></a>
  <img src="https://img.shields.io/badge/Node-%E2%89%A518-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node">
  <img src="https://img.shields.io/badge/MCP-2.0.0-8250DF?style=for-the-badge&logo=anthropic&logoColor=white" alt="MCP">
  <img src="https://img.shields.io/badge/工具-20+-FF6B35?style=for-the-badge" alt="Tools">
</p>

</div>

---

## ✨ 你能用它做什么

装好之后，你不再需要打开作家后台网页，直接对 AI 说话就行：

| 你说这句话 | AI 实际做的事 |
|---|---|
| 💬「看看我这几本书的数据怎么样」 | 调用 `list_novels` + `get_novel_stats`，对比各书阅读量 |
| 💬「把第 16 章发上去」 | `publish_chapter` 从 Markdown 稿件提取该章并发布 |
| 💬「明早 8 点定时发第 17 章」 | `publish_chapter` 带 `publish_time`，定时发布 |
| 💬「哪章追读掉得最狠？」 | `get_novel_stats` 拉全章追读数据并分析趋势 |
| 💬「有审核结果了吗」 | `list_notices` 查站内通知 / `get_banned_info` 查违规状态 |
| 💬「给我几个热词参考，我想开新书」 | `get_hot_words` + `get_douyin_hot_list` 拉选题灵感 |
| 💬「删掉那章测试稿」 | `delete_chapter`（需确认，防误删） |
| 💬「我的 Cookie 是不是过期了」 | `check_login` 一键探活 |

> 完整演示 GIF 待补充 —— 欢迎 PR

---

## 🚀 30 秒快速开始

### ① 拿鉴权（一次性）

1. 浏览器登录 [番茄小说作家后台](https://fanqienovel.com/main/writer/)
2. `F12 → Network` → 选中任意 `/api/author/...` 请求
3. 复制请求头里的 **`Cookie`** 和 **`X-Secsdk-Csrf-Token`**

```bash
cp .env.example .env
# 把上面两个值填进 .env
```

> Cookie 有效期约 1~2 个月。失效时用 `check_login` 工具秒发现。

### ② 跑起来

```bash
npx tomato-writer-mcp        # 无需安装，一行启动
```

或者本地开发：

```bash
git clone https://github.com/itsyhx/tomato-writer-mcp.git
cd tomato-writer-mcp
npm install && npm run build
npm start
```

### ③ 接入 AI 客户端

<details open>
<summary><b>Claude Desktop</b>（最常用）</summary>

编辑配置文件：
- macOS：`~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows：`%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "tomato-writer": {
      "command": "npx",
      "args": ["-y", "tomato-writer-mcp"],
      "env": {
        "TOMATO_COOKIE": "你的Cookie",
        "TOMATO_CSRF_TOKEN": "你的Token"
      }
    }
  }
}
```
</details>

<details>
<summary><b>Cursor</b></summary>

`.cursor/mcp.json`：
```json
{
  "mcpServers": {
    "tomato-writer": {
      "command": "npx",
      "args": ["-y", "tomato-writer-mcp"],
      "env": {
        "TOMATO_COOKIE": "你的Cookie",
        "TOMATO_CSRF_TOKEN": "你的Token"
      }
    }
  }
}
```
</details>

<details>
<summary><b>Cline / Continue / Cherry Studio / 其它</b></summary>

任意支持 MCP stdio 的客户端都一样配置，`command: npx`，`args: ["-y","tomato-writer-mcp"]`，把两个环境变量塞进 `env` 即可。
</details>

重启客户端 → 对 AI 说「**看看我有哪些书**」，搞定 ✅

---

## 🛠️ 20+ 工具一览

### 📚 书籍管理
| 工具 | 作用 |
|---|---|
| `list_novels` | 列出所有小说（book_id、书名、字数、阅读数、连载状态） |
| `switch_novel` | 切换当前操作的书（之后的工具默认作用于它） |
| `get_current_novel` | 查看当前选中的书 |

### ✍️ 发布
| 工具 | 作用 |
|---|---|
| `publish_chapter` | **发布 / 定时发布一章**（支持直接传正文，或从 Markdown 稿件按章节号提取） |
| `list_chapters` | 各分卷章节列表（含定时待发 / 已发布状态） |
| `list_drafts` | 草稿箱列表 |
| `delete_chapter` | 删除章节（**需 `confirm=true`**，防误删） |

### 📊 数据与分析
| 工具 | 作用 |
|---|---|
| `get_novel_stats` | 书级概览 + 各章阅读/追读/读完率明细 |
| `get_author_overview` | 作者级数据总览 |
| `get_attend_calendar` | 打卡 / 全勤日历 |
| `get_checkin_tickets` | 剩余打卡券 |

### 🔔 监控与灵感
| 工具 | 作用 |
|---|---|
| `list_notices` | 站内通知（审核结果监控） |
| `get_banned_info` | 违规 / 封禁状态（可做自动告警） |
| `get_hot_words` | 站内热词（起书名 / 蹭流量） |
| `get_douyin_hot_list` | 抖音热点榜（选题参考） |
| `get_medal_summary` | 任务勋章概览 |
| `get_ai_qualification` | AI 功能资格（AI 插画/命名/咨询是否开放） |

### 🔐 账号
| 工具 | 作用 |
|---|---|
| `check_login` | 登录态探针（Cookie 失效早知道） |
| `get_account_info` | 账号信息 |
| `get_login_qrcode` | 扫码登录二维码（Base64 PNG） |

---

## 🔬 为什么它能跑得通（协议要点）

这是本项目最有价值的部分 —— **我们把番茄作家后台的私有协议摸清楚了**：

| 要点 | 说明 |
|---|---|
| **鉴权方式** | `Cookie` + `X-Secsdk-Csrf-Token` 两个请求头即可 |
| **不需要风控签名** | ❌ 不需要 `a_bogus` / `msToken`（那是前端风控 SDK 注入的，服务端对带 cookie+csrf 的作家接口不强制校验） |
| **POST 编码** | 必须 `application/x-www-form-urlencoded`（用 JSON body 会得到空响应） |
| **公共参数** | `aid=2503&app_name=muye_novel` |
| **响应格式** | 统一 `{ code, message, data }`；`code===0` 成功，`-2` 参数有误，`-3` 鉴权失效 |

已实测端点覆盖：`/api/author/**` 共 22 个（详见源码注释）。

---

## 🧪 冒烟测试

不确定接口还好不好使？跑一遍体检：

```bash
npm run smoke              # 只读接口逐个体检
npm run smoke -- --write   # 额外测「建草稿→删草稿」安全写链路
```

输出示例：
```
✅ check_login（登录态）  (312 bytes)
✅ list_novels（书单）  (2841 bytes)
✅ get_hot_words（热词）  (12053 bytes)
...
结果：15 通过 / 0 失败
```

---

## 🏗️ 架构

```
src/
├── index.ts              # MCP Server 入口（stdio）
├── tomato/
│   ├── client.ts         # HTTP 客户端（鉴权 / 编码 / 错误归一）
│   ├── config.ts         # .env 加载 + 当前书状态持久化
│   ├── service.ts        # 书籍 / 章节 / 发布核心服务
│   ├── author.ts         # 账号 / 通知 / 违规 / 打卡 / 删除扩展
│   └── content.ts        # Markdown → 番茄正文 HTML
└── tools/                # MCP 工具定义（一个文件一个主题）
```

**零重依赖** —— 只有 MCP SDK + dotenv，单进程跑在 stdio 上，树莓派都能挂。

---

## 🤝 贡献

欢迎 PR / Issue。尤其需要：
- [ ] 补充演示 GIF 和截图
- [ ] 更多平台的 MCP 客户端配置示例
- [ ] 接口变动时及时提 issue（平台会改，我们一起维护）

```bash
git clone https://github.com/itsyhx/tomato-writer-mcp.git
cd tomato-writer-mcp
npm install
npm run build && npm run smoke
```

---

## ⚠️ 免责声明

- 本项目**仅调用作者本人账号**的后台接口，用于自动化自己的创作工作流
- 请遵守平台规则，**勿用于刷量、批量注册等灰产场景**
- Cookie 等同账号密码，**千万别提交到仓库里**（`.gitignore` 已排除 `.env`）
- 平台接口随时可能变更，发现失效欢迎提 issue
- 本项目与番茄小说官方无关，非官方 API

---

## 📄 License

[MIT](LICENSE) © 2026 Harrison Yin

---

<div align="center">
<sub>如果这个项目帮到你了，给它点个 ⭐ 吧 —— 这是开源作者唯一的报酬</sub>
</div>
