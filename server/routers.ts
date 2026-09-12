import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { completeChat, providerCatalog, type Provider } from "./ai";
import {
  addMessage,
  createConversation,
  deleteConversation,
  getConversation,
  getConversationMessages,
  listConversations,
  updateConversation,
  createPlayerPost,
  createPlayerProfile,
  getPlayerByUserId,
  getPlayerProfile,
  listPlayerPosts,
  listVerifiedPlayers,
  reviewPlayerProfile,
} from "./db";

const providerSchema = z.enum(["orbit-auto", "openai", "claude", "gemini"]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  ai: router({
    providers: publicProcedure.query(() => providerCatalog),
    conversations: protectedProcedure.query(({ ctx }) => listConversations(ctx.user.id)),
    conversation: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const conversation = await getConversation(ctx.user.id, input.id);
        if (!conversation) throw new TRPCError({ code: "NOT_FOUND", message: "المحادثة غير موجودة" });
        const items = await getConversationMessages(input.id);
        return { conversation, messages: items };
      }),
    create: protectedProcedure
      .input(z.object({ title: z.string().trim().min(1).max(180).optional(), provider: providerSchema.optional() }))
      .mutation(async ({ ctx, input }) => {
        const id = await createConversation(ctx.user.id, input.title ?? "محادثة جديدة", input.provider ?? "orbit-auto");
        if (!id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير مهيأة بعد" });
        return { id };
      }),
    remove: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await deleteConversation(ctx.user.id, input.id);
        return { success: true } as const;
      }),
    send: protectedProcedure
      .input(z.object({ conversationId: z.number().int().positive(), content: z.string().trim().min(1).max(12000), provider: providerSchema }))
      .mutation(async ({ ctx, input }) => {
        const conversation = await getConversation(ctx.user.id, input.conversationId);
        if (!conversation) throw new TRPCError({ code: "NOT_FOUND", message: "المحادثة غير موجودة" });
        const history = await getConversationMessages(input.conversationId);
        await addMessage(input.conversationId, "user", input.content, input.provider);
        const systemPrompt = "أنت مدار AI، مساعد عربي موثوق ومفيد. أجب بلغة المستخدم، كن واضحًا وعمليًا، وصرّح عندما لا تعرف بدل اختلاق المعلومات. استخدم Markdown عند الحاجة.";
        const completionMessages = [
          { role: "system" as const, content: systemPrompt },
          ...history.map((item) => ({ role: item.role as "user" | "assistant" | "system", content: item.content })),
          { role: "user" as const, content: input.content },
        ];
        try {
          const result = await completeChat(input.provider as Provider, completionMessages);
          await addMessage(input.conversationId, "assistant", result.text, result.model);
          const nextTitle = conversation.title === "محادثة جديدة" ? input.content.slice(0, 54) : conversation.title;
          await updateConversation(input.conversationId, { title: nextTitle, model: input.provider });
          return { content: result.text, model: result.model };
        } catch (error) {
          console.error("[AI] completion failed", error);
          throw new TRPCError({ code: "BAD_GATEWAY", message: error instanceof Error ? error.message : "تعذر الاتصال بنموذج الذكاء الاصطناعي" });
        }
      }),
  }),
  players: router({
    verified: publicProcedure.query(() => listVerifiedPlayers()),
    profile: publicProcedure.input(z.object({ slug: z.string().min(1).max(120) })).query(async ({ input }) => {
      const profile = await getPlayerProfile(input.slug);
      if (!profile || profile.status !== "verified") throw new TRPCError({ code: "NOT_FOUND", message: "ملف اللاعب غير متاح" });
      return { profile, posts: await listPlayerPosts(profile.id) };
    }),
    myProfile: protectedProcedure.query(({ ctx }) => getPlayerByUserId(ctx.user.id)),
    register: protectedProcedure.input(z.object({ displayName: z.string().trim().min(2).max(160), nameEn: z.string().trim().max(160).optional(), country: z.string().trim().min(2).max(100), club: z.string().trim().max(160).optional(), position: z.string().trim().max(60).optional(), jerseyNumber: z.number().int().min(0).max(99).optional(), imageUrl: z.string().url().max(1000).optional(), bio: z.string().trim().max(1000).optional() })).mutation(async ({ ctx, input }) => {
      const existing = await getPlayerByUserId(ctx.user.id);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "لديك طلب لاعب موجود بالفعل" });
      const slug = `${input.displayName.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, "-").replace(/^-|-$/g, "")}-${ctx.user.id}`;
      const id = await createPlayerProfile({ ...input, userId: ctx.user.id, slug, status: "pending" });
      if (!id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير مهيأة" });
      return { id, status: "pending" as const };
    }),
    post: protectedProcedure.input(z.object({ body: z.string().trim().min(1).max(5000) })).mutation(async ({ ctx, input }) => {
      const profile = await getPlayerByUserId(ctx.user.id);
      if (!profile || profile.status !== "verified") throw new TRPCError({ code: "FORBIDDEN", message: "الكتابة متاحة للاعب الموثق فقط" });
      const id = await createPlayerPost(profile.id, input.body);
      return { id };
    }),
    review: protectedProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["verified", "rejected"]) })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "المراجعة للإدارة فقط" });
      await reviewPlayerProfile(input.id, input.status);
      return { success: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
