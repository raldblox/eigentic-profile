import { v } from "convex/values"

import { mutation, query } from "./_generated/server"

export const create = mutation({
  args: {
    ownerWallet: v.string(),
    displayName: v.string(),
    headline: v.optional(v.any()),
    prompt: v.optional(v.any()),
    intent: v.optional(v.any()),
    context: v.optional(v.any()),
    accessRules: v.optional(v.any()),
    structuredData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const id = await ctx.db.insert("profiles", {
      ownerWallet: args.ownerWallet,
      displayName: args.displayName,
      headline: args.headline ? String(args.headline) : undefined,
      prompt: args.prompt ? String(args.prompt) : undefined,
      intent: args.intent ? String(args.intent) : undefined,
      context: args.context ? String(args.context) : undefined,
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
