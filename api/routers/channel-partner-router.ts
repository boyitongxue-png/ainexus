import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { channelPartners, customPricingRules } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export const channelPartnerRouter = createRouter({
  // === Channel Partner CRUD ===
  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(channelPartners).orderBy(desc(channelPartners.createdAt));
  }),

  getById: adminQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(channelPartners).where(eq(channelPartners.id, input.id));
      return result[0] ?? null;
    }),

  create: adminQuery
    .input(z.object({
      userId: z.number(),
      companyName: z.string().optional(),
      contactName: z.string().optional(),
      contactPhone: z.string().optional(),
      markupType: z.enum(["fixed_amount", "percentage", "custom"]).default("percentage"),
      markupValue: z.string().default("20.0000"),
      creditLimit: z.string().default("0"),
      status: z.enum(["active", "inactive", "suspended"]).default("active"),
      remarks: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(channelPartners).values(input);
      return { id: Number(result[0].insertId) };
    }),

  update: adminQuery
    .input(z.object({
      id: z.number(),
      companyName: z.string().optional(),
      contactName: z.string().optional(),
      contactPhone: z.string().optional(),
      markupType: z.enum(["fixed_amount", "percentage", "custom"]).optional(),
      markupValue: z.string().optional(),
      creditLimit: z.string().optional(),
      status: z.enum(["active", "inactive", "suspended"]).optional(),
      remarks: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(channelPartners).set(data).where(eq(channelPartners.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(channelPartners).where(eq(channelPartners.id, input.id));
      return { success: true };
    }),

  // === Custom Pricing Rules ===
  listPricingRules: adminQuery
    .input(z.object({ channelPartnerId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(customPricingRules)
        .where(eq(customPricingRules.channelPartnerId, input.channelPartnerId))
        .orderBy(desc(customPricingRules.createdAt));
    }),

  setPricingRule: adminQuery
    .input(z.object({
      channelPartnerId: z.number(),
      modelId: z.number(),
      customInputPrice: z.string().optional(),
      customOutputPrice: z.string().optional(),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { channelPartnerId, modelId, ...data } = input;

      // Check if rule already exists
      const existing = await db.select().from(customPricingRules)
        .where(and(
          eq(customPricingRules.channelPartnerId, channelPartnerId),
          eq(customPricingRules.modelId, modelId)
        ));

      if (existing.length > 0) {
        // Update existing
        await db.update(customPricingRules)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(customPricingRules.id, existing[0].id));
        return { id: existing[0].id, action: "updated" };
      } else {
        // Create new
        const result = await db.insert(customPricingRules).values(input);
        return { id: Number(result[0].insertId), action: "created" };
      }
    }),

  deletePricingRule: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(customPricingRules).where(eq(customPricingRules.id, input.id));
      return { success: true };
    }),
});
