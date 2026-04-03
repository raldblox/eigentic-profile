import { v } from "convex/values"

import { mutation, query } from "./_generated/server"

export const create = mutation({
  args: {
    ownerWallet: v.string(),
    ownerLabel: v.optional(v.string()),
    displayName: v.string(),
    headline: v.optional(v.any()),
    prompt: v.optional(v.any()),
    qualificationGoal: v.optional(v.any()),
    intent: v.optional(v.any()),
    context: v.optional(v.any()),
    criteria: v.optional(v.array(v.string())),
    gatedAssets: v.optional(v.any()),
    accessRules: v.optional(v.any()),
    structuredData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const id = await ctx.db.insert("profiles", {
      ownerWallet: args.ownerWallet,
      ownerLabel: args.ownerLabel,
      displayName: args.displayName,
      headline: args.headline ? String(args.headline) : undefined,
      prompt: args.prompt ? String(args.prompt) : undefined,
      qualificationGoal: args.qualificationGoal
        ? String(args.qualificationGoal)
        : undefined,
      intent: args.intent ? String(args.intent) : undefined,
      context: args.context ? String(args.context) : undefined,
      criteria: args.criteria,
      gatedAssets: args.gatedAssets,
      accessRules: args.accessRules,
      structuredData: args.structuredData,
      status: "created",
      createdAt: now,
      updatedAt: now,
    })

    return id
  },
})

export const get = query({
  args: {
    id: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})
