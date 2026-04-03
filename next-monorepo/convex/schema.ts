import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  profiles: defineTable({
    ownerWallet: v.string(),
    ownerLabel: v.optional(v.string()),
    displayName: v.string(),
    headline: v.optional(v.string()),
    prompt: v.optional(v.string()),
    qualificationGoal: v.optional(v.string()),
    intent: v.optional(v.string()),
    context: v.optional(v.string()),
    criteria: v.optional(v.array(v.string())),
    gatedAssets: v.optional(v.any()),
    accessRules: v.optional(v.any()),
    structuredData: v.optional(v.any()),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_owner", ["ownerWallet"]),
})
