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
});

export type AppRouter = typeof appRouter;
