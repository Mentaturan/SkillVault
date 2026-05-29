import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { nanoid } from "nanoid";
import * as schema from "../db/schema";

const dbPath = process.env.SKILLVAULT_DB_PATH ?? "./data/skillvault.sqlite";
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

function createId() {
  return nanoid();
}

const now = Date.now();

async function seedDemo() {
  console.log("开始填充演示集合和项目数据...\n");

  const assets = await db.select({ id: schema.assets.id, title: schema.assets.title, type: schema.assets.type }).from(schema.assets);
  if (assets.length === 0) {
    console.log("没有找到资产数据，请先运行 npm run seed");
    process.exit(1);
  }

  const collections = [
    {
      name: "AI 编码规则",
      description: "用于 AI 辅助编码的规则和系统提示词集合",
      icon: "🤖",
      color: "#3b82f6",
      assetFilter: (a: { type: string }) => a.type === "system_rule" || a.type === "agent_skill",
    },
    {
      name: "提示词工具箱",
      description: "日常使用的聊天提示词和回复模板",
      icon: "💬",
      color: "#8b5cf6",
      assetFilter: (a: { type: string }) => a.type === "chat_prompt" || a.type === "reply_template",
    },
    {
      name: "流程与规范",
      description: "工作流、SOP 和检查清单",
      icon: "📋",
      color: "#10b981",
      assetFilter: (a: { type: string }) => a.type === "workflow" || a.type === "sop" || a.type === "checklist",
    },
  ];

  for (const col of collections) {
    const colId = createId();
    await db.insert(schema.collections).values({
      id: colId,
      name: col.name,
      description: col.description,
      icon: col.icon,
      color: col.color,
      createdAt: now,
      updatedAt: now,
    });

    const matchedAssets = assets.filter(col.assetFilter);
    for (let i = 0; i < matchedAssets.length; i++) {
      await db.insert(schema.collectionAssets).values({
        collectionId: colId,
        assetId: matchedAssets[i].id,
        orderIndex: i,
        createdAt: now,
      });
    }

    console.log(`✓ 集合: ${col.name} (${matchedAssets.length} 个资产)`);
  }

  const projects = [
    {
      name: "SkillVault 主项目",
      description: "SkillVault 应用本身的开发项目，包含编码规范和 AI 配置",
      path: "/Users/mentat/Library/Mobile Documents/com~apple~CloudDocs/skillvault",
      icon: "🏗️",
      color: "#f59e0b",
      assetFilter: (a: { type: string; title: string }) =>
        a.title.includes("编码规范") || a.title.includes("初始化") || a.title.includes("代码审查"),
    },
    {
      name: "API 文档项目",
      description: "API 文档生成和维护相关项目",
      path: null,
      icon: "📄",
      color: "#6366f1",
      assetFilter: (a: { type: string; title: string }) => a.type === "agent_skill" || a.title.includes("API"),
    },
    {
      name: "设计资源库",
      description: "UI 设计和图像生成相关资源",
      path: null,
      icon: "🎨",
      color: "#ec4899",
      assetFilter: (a: { type: string }) => a.type === "image_prompt",
    },
  ];

  for (const proj of projects) {
    const projId = createId();
    await db.insert(schema.projects).values({
      id: projId,
      name: proj.name,
      description: proj.description,
      path: proj.path,
      icon: proj.icon,
      color: proj.color,
      createdAt: now,
      updatedAt: now,
    });

    const matchedAssets = assets.filter(proj.assetFilter);
    for (let i = 0; i < matchedAssets.length; i++) {
      await db.insert(schema.projectAssets).values({
        projectId: projId,
        assetId: matchedAssets[i].id,
        orderIndex: i,
        createdAt: now,
      });
    }

    console.log(`✓ 项目: ${proj.name} (${matchedAssets.length} 个资产)`);
  }

  console.log("\n完成！演示数据已创建。");
}

seedDemo().catch((err) => {
  console.error("演示数据填充失败:", err);
  process.exit(1);
});
