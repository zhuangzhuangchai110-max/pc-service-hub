这是为你整理的**全栈本地化技术架构文档**。

由于你要求**所有服务（前后端、数据库）均在本地**，且不使用云端服务，我为你选择了一套极其稳定、且 Cursor 能够完美调动（拥有海量文档训练数据）的开源技术栈。

---

## 💻 电脑综合服务平台：技术架构文档 (Technical Specification)

### 1. 核心技术栈选型 (Tech Stack)

为了避免 Cursor "手搓" 基础样式或逻辑，我们引用目前最成熟的工业级开源组合：

| 维度 | 推荐选型 | 理由 |
| :--- | :--- | :--- |
| **前端框架** | **Next.js 14+ (App Router)** | 全栈框架，一套代码搞定前后端。Cursor 对其路由逻辑理解极深。 |
| **UI 组件库** | **Shadcn UI + Tailwind CSS** | **关键：** 它是基于 Radix UI 的开源组件，Cursor 可以直接调用其标准组件（如 `Stepper`, `Calendar`, `Table`）。 |
| **本地数据库** | **SQLite + Prisma ORM** | **完全本地化**。SQLite 是一个文件，不需要安装复杂的数据库软件。Prisma 让 Cursor 写 SQL 变得极简单。 |
| **本地存储** | **Local File System** | 所有的订单数据都保存在你电脑本地的一个 `.db` 文件中。 |
| **图标库** | **Lucide React** | 开源且轻量，涵盖所有电脑维修相关的图标。 |

---

### 2. 本地部署架构 (Local Deployment)

所有组件均运行在你的个人电脑（localhost）上：

* **Frontend (Next.js)**: 运行在 `http://localhost:3000` (用户预约界面)
* **Admin Dashboard**: 运行在 `http://localhost:3000/admin` (内部管理界面)
* **Database (SQLite)**: 存储在项目根目录下的 `dev.db` 文件中。

---

### 3. 数据库模型定义 (Prisma Schema)

这是给 Cursor 的核心指令，要求它直接生成本地数据库表结构：

```prisma
// prisma/schema.prisma

model Order {
  id              String   @id @default(cuid())
  serviceType     String   // 服务类型：清灰/系统重装等
  deviceCategory  String   // 笔记本/台式机
  brandModel      String   // 品牌型号
  location        String   // 上门地址/到店
  phone           String   // 联系电话
  appointmentDate DateTime // 预约日期
  timeSlot        String   // 预约时段（上午/下午/晚上）
  status          String   @default("pending") // pending, completed, cancelled
  createdAt       DateTime @default(now())
}
```

---

### 4. 关键组件调用指令 (避免手搓)

在开发时，明确告诉 Cursor 调用以下成熟组件：

* **日期选择**：直接使用 `shadcn/ui` 的 `Calendar` 组件，不要让它写原生原生 JS 日历。
* **表单验证**：使用 `Zod` 库进行手机号正则匹配，防止无效订单。
* **动画效果**：使用 `Framer Motion` 处理步骤切换时的平滑过渡。

---

### 5. 给 Cursor 的最终“本地全栈”启动 Prompt

请将以下指令复制到 Cursor 的对话框（或 `.cursorrules` 文件）中：

> **Task:** 建立一个完全本地化的电脑服务预约系统。
> 
> **技术要求：**
> 1. 使用 **Next.js (App Router)** 和 **Shadcn UI**。
> 2. 数据库使用 **SQLite** 并通过 **Prisma** 进行连接（确保所有数据留在本地 `dev.db`）。
> 3. **前端实现：** >    - 使用 Shadcn 的 `Card` 和 `Stepper` 开发 4 步表单。
>    - 接入 `lucide-react` 图标。
> 4. **后台管理：**
>    - 在 `/admin` 路由下，使用 Shadcn 的 `DataTable` 组件展示本地数据库中的订单。
>    - 实现一个按钮，点击后通过 Prisma Action 修改本地数据库中的订单状态。
> 5. **核心原则：** 优先使用现有的开源组件库，严禁手搓复杂的 CSS 动画或基础 UI 逻辑。
> 
> **请先为我初始化项目结构，并配置好 Prisma 的 SQLite 环境。**

---

### 💡 建议的下一步操作：

1.  **环境准备**：在你的电脑上安装好 **Node.js**。
2.  **初始化项目**：在终端运行 `npx create-next-app@latest`。
3.  **开始开发**：打开 Cursor，粘贴上面的 Prompt。

