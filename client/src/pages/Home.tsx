import { AIChatBox, type Message as ChatMessage } from "@/components/AIChatBox";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, ChevronDown, CircleHelp, Clock3, Copy, Database, FileText, Globe2, LogOut, Menu, MoreHorizontal, Plus, Search, Settings2, ShieldCheck, Sparkles, Trash2, UserRound, X, Zap } from "lucide-react";
import { toast } from "sonner";

const suggestedPrompts = [
  "لخّص لي فكرة مشروعي في خطة عملية من خمس خطوات",
  "اكتب لي صفحة هبوط عربية بأسلوب احترافي",
  "اشرح لي الفرق بين قاعدة البيانات العلائقية وغير العلائقية",
];

type ProviderId = "orbit-auto" | "openai" | "claude" | "gemini";

const providerMeta: Record<string, { name: string; short: string; icon: string; tone: string }> = {
  "orbit-auto": { name: "مدار تلقائي", short: "AUTO", icon: "✦", tone: "teal" },
  openai: { name: "OpenAI", short: "GPT", icon: "◌", tone: "mint" },
  claude: { name: "Claude", short: "CL", icon: "◈", tone: "amber" },
  gemini: { name: "Gemini", short: "GE", icon: "✧", tone: "violet" },
};

function Brand() {
  return <div className="app-brand"><div className="brand-mark"><Sparkles size={18} strokeWidth={2.4} /></div><div><strong>مدار</strong><span>AI ORBIT</span></div></div>;
}

function UserBadge({ name }: { name?: string | null }) {
  const letters = (name || "زائر").split(" ").slice(0, 2).map((part) => part[0]).join("");
  return <div className="user-badge"><span>{letters || "ز"}</span><div><b>{name || "زائر"}</b><small>{name ? "الحساب الشخصي" : "سجّل للبدء"}</small></div></div>;
}

export default function Home() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const utils = trpc.useUtils();
  const providersQuery = trpc.ai.providers.useQuery();
  const conversationsQuery = trpc.ai.conversations.useQuery(undefined, { enabled: isAuthenticated, refetchOnWindowFocus: false });
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>("orbit-auto");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [showProviders, setShowProviders] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [search, setSearch] = useState("");
  const createdRef = useRef(false);

  const conversations = conversationsQuery.data ?? [];
  const selectedConversation = conversations.find((item) => item.id === selectedId) ?? null;
  const conversationQuery = trpc.ai.conversation.useQuery({ id: selectedId ?? 0 }, { enabled: Boolean(selectedId), refetchOnWindowFocus: false });
  const createMutation = trpc.ai.create.useMutation();
  const sendMutation = trpc.ai.send.useMutation();
  const removeMutation = trpc.ai.remove.useMutation();

  useEffect(() => {
    if (!selectedId && conversations.length > 0) setSelectedId(conversations[0].id);
  }, [conversations, selectedId]);

  useEffect(() => {
    if (conversationQuery.data?.messages) {
      setLocalMessages(conversationQuery.data.messages.filter((message) => message.role !== "system").map((message) => ({ role: message.role as "user" | "assistant", content: message.content })));
    }
  }, [conversationQuery.data]);

  useEffect(() => {
    if (isAuthenticated && !authLoading && conversationsQuery.isFetched && conversations.length === 0 && !createdRef.current) {
      createdRef.current = true;
      createMutation.mutate({ provider: selectedProvider }, { onSuccess: (result) => setSelectedId(result.id) });
    }
  }, [authLoading, conversations.length, conversationsQuery.isFetched, createMutation, isAuthenticated, selectedProvider]);

  const activeProvider = { ...(providerMeta[selectedProvider] ?? providerMeta["orbit-auto"]), model: providersQuery.data?.find((provider) => provider.id === selectedProvider)?.model ?? "نموذج مدار سريع" };
  const filteredConversations = useMemo(() => conversations.filter((item) => item.title.toLowerCase().includes(search.toLowerCase())), [conversations, search]);
  const canChat = isAuthenticated && Boolean(selectedId);

  const selectConversation = (id: number) => {
    setSelectedId(id);
    setLocalMessages([]);
    setShowSidebar(false);
  };

  const newConversation = async () => {
    if (!isAuthenticated) return startLogin();
    const result = await createMutation.mutateAsync({ provider: selectedProvider });
    setSelectedId(result.id);
    setLocalMessages([]);
    await utils.ai.conversations.invalidate();
    setShowSidebar(false);
  };

  const sendMessage = async (content: string) => {
    if (!isAuthenticated) {
      toast.info("سجّل الدخول أولًا لحفظ محادثاتك واستخدام المدار");
      return startLogin();
    }
    let conversationId = selectedId;
    if (!conversationId) {
      const created = await createMutation.mutateAsync({ provider: selectedProvider });
      conversationId = created.id;
      setSelectedId(conversationId);
    }
    setLocalMessages((previous) => [...previous, { role: "user", content }]);
    try {
      const result = await sendMutation.mutateAsync({ conversationId, content, provider: selectedProvider });
      setLocalMessages((previous) => [...previous, { role: "assistant", content: result.content }]);
      await utils.ai.conversations.invalidate();
      await utils.ai.conversation.invalidate({ id: conversationId });
    } catch (error) {
      setLocalMessages((previous) => [...previous, { role: "assistant", content: `تعذّر إكمال الطلب. ${error instanceof Error ? error.message : "تحقق من إعدادات المزود."}` }]);
    }
  };

  const deleteCurrent = async () => {
    if (!selectedId) return;
    await removeMutation.mutateAsync({ id: selectedId });
    setSelectedId(null);
    setLocalMessages([]);
    await utils.ai.conversations.invalidate();
  };

  return (
    <div className="orbit-app" dir="rtl">
      <aside className={cn("orbit-sidebar", showSidebar && "is-open")}>
        <div className="sidebar-head"><Brand /><button className="icon-btn mobile-only" onClick={() => setShowSidebar(false)} aria-label="إغلاق القائمة"><X size={18} /></button></div>
        <button className="new-chat-btn" onClick={newConversation}><Plus size={17} /><span>محادثة جديدة</span><kbd>N</kbd></button>
        <div className="sidebar-section"><div className="section-label"><span>محادثاتك</span><button className="tiny-btn"><MoreHorizontal size={15} /></button></div><div className="search-box"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث في المحادثات" /></div></div>
        <div className="conversation-list">{filteredConversations.length === 0 ? <div className="empty-conversations"><Clock3 size={17} /><span>لا توجد محادثات محفوظة بعد</span></div> : filteredConversations.map((conversation) => <button key={conversation.id} onClick={() => selectConversation(conversation.id)} className={cn("conversation-item", conversation.id === selectedId && "active")}><span className="conversation-dot" /><span className="conversation-title">{conversation.title}</span><small>{conversation.model === "orbit-auto" ? "مدار" : conversation.model}</small></button>)}</div>
        <div className="sidebar-bottom"><button className={cn("sidebar-link", showSettings && "selected")} onClick={() => setShowSettings((value) => !value)}><Settings2 size={17} /><span>إعدادات المزود</span></button><button className="sidebar-link"><CircleHelp size={17} /><span>كيف يعمل مدار؟</span></button><div className="profile-row"><UserBadge name={user?.name} /><button className="logout-btn" onClick={() => isAuthenticated ? logout() : startLogin()} aria-label={isAuthenticated ? "تسجيل الخروج" : "تسجيل الدخول"}>{isAuthenticated ? <LogOut size={16} /> : <UserRound size={16} />}</button></div></div>
      </aside>

      <section className="orbit-main">
        <header className="main-header"><div className="mobile-head"><button className="icon-btn" onClick={() => setShowSidebar(true)} aria-label="فتح القائمة"><Menu size={20} /></button><Brand /></div><div className="breadcrumb"><span>مساحتك</span><i>/</i><b>{selectedConversation?.title || "محادثة جديدة"}</b></div><div className="header-actions"><div className="status-pill"><span className="status-dot" /> النظام يعمل</div><button className="avatar-mini"><span>{(user?.name || "ز").slice(0, 1)}</span></button></div></header>
        <div className="workspace">
          <div className="workspace-top"><div><div className="overline"><span className="overline-line" /> مساحة المحادثة</div><h1>{selectedConversation?.title || "ابدأ بسؤالٍ واضح"}</h1><p>فكّر بصوت عالٍ. مدار يرتّب الفكرة معك.</p></div><div className="top-controls"><button className="outline-btn" onClick={deleteCurrent} disabled={!selectedId || removeMutation.isPending}><Trash2 size={15} /> حذف</button><button className="model-select" onClick={() => setShowProviders((value) => !value)}><span className={`provider-dot ${activeProvider.tone}`}>{activeProvider.icon}</span><span>{activeProvider.name}</span><ChevronDown size={15} /></button></div></div>
          {showProviders && <div className="provider-popover">{(providersQuery.data ?? []).map((provider) => { const meta = providerMeta[provider.id] ?? providerMeta["orbit-auto"]; return <button key={provider.id} className={cn("provider-option", selectedProvider === provider.id && "active")} onClick={() => { setSelectedProvider(provider.id); setShowProviders(false); }}><span className={`provider-dot ${meta.tone}`}>{meta.icon}</span><div><b>{meta.name}</b><small>{provider.description}</small></div>{provider.id === "orbit-auto" && <em>جاهز</em>}</button>; })}</div>}
          <div className="chat-frame"><div className="chat-head"><div className="chat-context"><div className={`provider-dot large ${activeProvider.tone}`}>{activeProvider.icon}</div><div><b>{activeProvider.name}</b><span>{activeProvider.model || "نموذج سريع للمحادثة"}</span></div></div><div className="chat-head-note"><ShieldCheck size={14} /> محادثة خاصة</div></div>{!canChat && !authLoading ? <div className="auth-callout"><div className="auth-orbit"><Sparkles size={23} /></div><h2>مساعدك الذكي، في مدارك</h2><p>سجّل الدخول لحفظ محادثاتك، التبديل بين النماذج، واستكمال أفكارك من أي جهاز.</p><button className="primary-btn" onClick={startLogin}>تسجيل الدخول والمتابعة <span>←</span></button><div className="auth-features"><span><Database size={14} /> سجل محادثات دائم</span><span><Globe2 size={14} /> نماذج متعددة</span><span><ShieldCheck size={14} /> مفاتيحك تبقى سرية</span></div></div> : <AIChatBox messages={localMessages} onSendMessage={sendMessage} isLoading={sendMutation.isPending || createMutation.isPending} height="100%" emptyStateMessage="ما الذي تريد أن نبنيه اليوم؟" suggestedPrompts={suggestedPrompts} placeholder="اكتب رسالتك إلى مدار..." />}</div>
          <div className="workspace-footer"><span><Zap size={14} /> إجابات مدعومة بنماذج حديثة</span><span>Enter للإرسال · Shift + Enter لسطر جديد</span></div>
        </div>
      </section>

      {showSettings && <div className="settings-drawer"><div className="drawer-head"><div><div className="overline"><span className="overline-line" /> الإعدادات</div><h2>مزودو الذكاء الاصطناعي</h2></div><button className="icon-btn" onClick={() => setShowSettings(false)}><X size={18} /></button></div><p className="drawer-intro">يعمل «مدار تلقائي» مباشرة داخل المعاينة. عند الاستضافة، أضف مفاتيحك كمتغيرات سرية لتفعيل المزودين الرسميين.</p><div className="key-status"><div><span className="status-dot" /><b>المدار المدمج</b><small>متصل الآن</small></div><ShieldCheck size={19} /></div>{["openai", "claude", "gemini"].map((id) => { const meta = providerMeta[id]; return <div className="key-row" key={id}><div className={`provider-dot ${meta.tone}`}>{meta.icon}</div><div><b>{meta.name}</b><small>{id === "openai" ? "OPENAI_API_KEY" : id === "claude" ? "ANTHROPIC_API_KEY" : "GEMINI_API_KEY"}</small></div><span className="not-configured">غير مهيأ</span></div>; })}<div className="drawer-note"><FileText size={16} /><span>لا تضع المفتاح داخل الواجهة أو GitHub. أضفه من Secrets في لوحة الاستضافة.</span></div></div>}
      {showSidebar && <button className="sidebar-scrim" onClick={() => setShowSidebar(false)} aria-label="إغلاق القائمة" />}
    </div>
  );
}
