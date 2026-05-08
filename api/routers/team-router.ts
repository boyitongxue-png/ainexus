import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { teamMembers } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const teamRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(teamMembers).orderBy(desc(teamMembers.joinedAt));
  }),

  create: authedQuery
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      role: z.enum(["owner", "admin", "developer", "viewer"]).default("developer"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const result = await db.insert(teamMembers).values({
        ...input,
        invitedBy: ctx.user.id,
      });
      return { id: Number(result[0].insertId) };
    }),

  update: authedQuery
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      role: z.enum(["owner", "admin", "developer", "viewer"]).optional(),
      status: z.enum(["active", "inactive"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(teamMembers).set(data).where(eq(teamMembers.id, id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(teamMembers).where(eq(teamMembers.id, input.id));
      return { success: true };
    }),
});
