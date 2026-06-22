import * as React from "react";
import type {
  AssistantActionExecutionResponse,
  AssistantChatResponse,
  AssistantEscalationResponse,
  AssistantProposedAction,
  AssistantSuggestedLink,
  EcosystemAppSlug,
  Metadata,
} from "@xflow-ecosystem/ecosystem-assistant";

export {
  AppShell,
  CollapseToggle,
  MobileHeader,
  MobileNavDrawer,
  NavItem,
  NavSection,
  NavigationShellStyles,
  PrimaryActionButton,
  QuickActionCard,
  SidebarAccountFooter,
  SidebarNav,
  SidebarUserCard,
  getNavigationCollapseStorageKey,
  isNavigationItemActive,
  isNavigationItemVisible,
  isNavigationSectionVisible,
  normalizeNavigationSections,
} from "./navigation-shell.js";
export type {
  NavItemConfig,
  NavSectionConfig,
  NavigationBrandConfig,
  NavigationRenderLinkProps,
  NavigationShellConfig,
  NavigationShellState,
  NavigationUserContext,
} from "./navigation-shell.js";

export type EcosystemAssistantUiMessage = {
  id: string;
  assistantMessageId?: string | null;
  role: "assistant" | "user" | "system";
  content: string;
  suggestedLinks?: AssistantSuggestedLink[];
  proposedActions?: AssistantProposedAction[];
};

export type EcosystemAssistantFeedbackInput = {
  conversationId: string;
  assistantMessageId?: string | null;
  conversationMessageId?: string | null;
  workspaceId?: string | number | null;
  appSlug: EcosystemAppSlug;
  rating: "helpful" | "not_helpful" | "neutral";
  resolved?: boolean | null;
  acceptedRecommendedAction?: boolean | null;
  dismissedRecommendedAction?: boolean | null;
  userFeedbackText?: string | null;
};

export type EcosystemAssistantBubbleTheme = {
  accent: string;
  accentText: string;
  panel: string;
  panelAlt: string;
  border: string;
  text: string;
  muted: string;
};

export type EcosystemAssistantContextSeed = {
  appSlug: EcosystemAppSlug;
  appName: string;
  route?: string | null;
  pageTitle?: string | null;
  toolId?: string | null;
  toolStatus?: string | null;
  chronicleTab?: string | null;
  promptSeed?: string | null;
};

export type EcosystemAssistantPromptPack = {
  appSlug: EcosystemAppSlug;
  appName: string;
  assistantName: string;
  subtitle: string;
  welcomeMessage: string;
  suggestedPrompts: string[];
  supportPrompts: string[];
  setupPrompts?: string[];
  troubleshootingPrompts?: string[];
  billingAccessPrompts?: string[];
  routePromptSeeds?: Record<string, string>;
  footerText: string;
};

export const ECOSYSTEM_ASSISTANT_STATE_COPY = {
  loading: "Checking the right ecosystem context...",
  unavailable: "I couldn't reach the assistant right now. Try again, or contact support.",
  needsConversationForSupport: "Ask a quick question first so support can receive the conversation context.",
  supportTitle: "Contact support",
  supportSubjectPlaceholder: "What do you need help with?",
  inputPlaceholder: "Ask about this app, setup, access, or support",
} as const;

export const ECOSYSTEM_ASSISTANT_PROMPT_PACKS: Record<EcosystemAppSlug, EcosystemAssistantPromptPack> = {
  xflow: {
    appSlug: "xflow",
    appName: "XFlow",
    assistantName: "XFlow Ecosystem Assistant",
    subtitle: "Ecosystem help",
    welcomeMessage: "Ask me about XFlow tools, connected apps, Chronicle, setup, integrations, pricing, access, or support.",
    suggestedPrompts: [
      "What can XFlow do?",
      "What should I set up first?",
      "Show me my tools",
      "Explain Chronicle",
      "What apps are connected?",
      "Help me troubleshoot an integration",
    ],
    supportPrompts: ["Contact support"],
    setupPrompts: ["What should I set up first?", "What apps are connected?"],
    troubleshootingPrompts: ["Help me troubleshoot an integration"],
    routePromptSeeds: {
      "/tools/chronicle": "Explain Chronicle and what it can show today.",
      "/tools": "Help me understand this XFlow tool.",
    },
    footerText: "Uses XFlow ecosystem context through the secure assistant route.",
  },
  verixet: {
    appSlug: "verixet",
    appName: "Verixet",
    assistantName: "Verixet Assistant",
    subtitle: "Billing, access, and ecosystem help",
    welcomeMessage: "Ask me about Verixet billing, entitlements, access, governance, XFlow, or support.",
    suggestedPrompts: [
      "Explain my billing and access",
      "What plan should I use?",
      "Why is this entitlement blocked?",
      "Help me understand pricing",
      "Show me what is included in my plan",
      "What needs setup before billing goes live?",
    ],
    supportPrompts: ["Contact support"],
    setupPrompts: ["What needs setup before billing goes live?"],
    troubleshootingPrompts: ["Why is this entitlement blocked?"],
    billingAccessPrompts: [
      "Explain my billing and access",
      "What plan should I use?",
      "Show me what is included in my plan",
    ],
    footerText: "Uses Verixet context through the secure XFlow assistant proxy.",
  },
  audaix: {
    appSlug: "audaix",
    appName: "AudAiX",
    assistantName: "AudAiX Assistant",
    subtitle: "Audit and ecosystem help",
    welcomeMessage: "Ask me about AudAiX audits, findings, diagnostics, setup, XFlow, or support.",
    suggestedPrompts: [
      "Why did this audit fail?",
      "Explain this finding",
      "What should I fix first?",
      "How do I connect this app?",
      "Summarize my latest audit",
      "What issues are highest priority?",
    ],
    supportPrompts: ["Contact support"],
    setupPrompts: ["How do I connect this app?"],
    troubleshootingPrompts: ["Why did this audit fail?", "What issues are highest priority?"],
    footerText: "Uses AudAiX route context through the secure XFlow assistant proxy.",
  },
  rataify: {
    appSlug: "rataify",
    appName: "Rataify",
    assistantName: "Rataify Assistant",
    subtitle: "Reputation, verification, and ecosystem help",
    welcomeMessage: "Ask me about Rataify trust scores, verification, profile setup, XFlow, Verixet, access, or support.",
    suggestedPrompts: [
      "Explain my trust score",
      "What verification is missing?",
      "How do I improve this profile?",
      "What does this badge mean?",
      "What should I complete next?",
      "Help me troubleshoot verification",
    ],
    supportPrompts: ["Contact support"],
    setupPrompts: ["What should I complete next?", "What verification is missing?"],
    troubleshootingPrompts: ["Help me troubleshoot verification"],
    footerText: "Uses Rataify context through the secure XFlow assistant proxy.",
  },
  wordgeni: {
    appSlug: "wordgeni",
    appName: "WordGeni",
    assistantName: "WordGeni Assistant",
    subtitle: "Writing and ecosystem help",
    welcomeMessage: "Ask me about WordGeni writing, drafts, workspace setup, source provenance, XFlow, or support.",
    suggestedPrompts: [
      "Help me write this",
      "Improve this draft",
      "Explain my workspace",
      "Show useful writing tools",
      "Turn this into a better version",
      "Help me organize my ideas",
    ],
    supportPrompts: ["Contact support"],
    setupPrompts: ["Explain my workspace", "Show useful writing tools"],
    troubleshootingPrompts: ["Help me organize my ideas"],
    footerText: "Uses WordGeni route context through the secure XFlow assistant proxy.",
  },
  crevux: {
    appSlug: "crevux",
    appName: "Crevux",
    assistantName: "Crevux Assistant",
    subtitle: "AI media and ecosystem help",
    welcomeMessage: "Ask me about Crevux image generation, prompts, credits, access, XFlow, Verixet, or support.",
    suggestedPrompts: [
      "Help me generate better images",
      "Improve this prompt",
      "Explain credits and access",
      "What style should I use?",
      "Help me troubleshoot generation",
      "Make this output more professional",
    ],
    supportPrompts: ["Contact support"],
    setupPrompts: ["Explain credits and access"],
    troubleshootingPrompts: ["Help me troubleshoot generation"],
    billingAccessPrompts: ["Explain credits and access"],
    footerText: "Uses Crevux route context through the secure XFlow assistant proxy.",
  },
};

export function getEcosystemAssistantPromptPack(appSlug: EcosystemAppSlug): EcosystemAssistantPromptPack {
  return ECOSYSTEM_ASSISTANT_PROMPT_PACKS[appSlug];
}

export type EcosystemAssistantBubbleProps = {
  appSlug: EcosystemAppSlug;
  appName: string;
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  statusLabel?: string;
  workspaceLabel?: string | null;
  footerText?: string;
  welcomeMessage?: string;
  quickPrompts?: string[];
  promptPack?: EcosystemAssistantPromptPack;
  assistantContext?: EcosystemAssistantContextSeed;
  loadingText?: string;
  errorText?: string;
  inputPlaceholder?: string;
  storageKey: string;
  currentPath?: string | null;
  metadata?: Metadata;
  theme?: Partial<EcosystemAssistantBubbleTheme>;
  sendChat: (input: {
    message: string;
    visitorSessionId: string;
    conversationId?: string | null;
    currentPath?: string | null;
    metadata?: Metadata;
  }) => Promise<AssistantChatResponse>;
  escalate: (input: {
    conversationId: string;
    visitorSessionId: string;
    email?: string | null;
    subject?: string | null;
    message?: string | null;
    metadata?: Metadata;
  }) => Promise<AssistantEscalationResponse>;
  submitFeedback?: (input: EcosystemAssistantFeedbackInput) => Promise<void>;
  executeAction?: (input: {
    actionId: string;
    appSlug: EcosystemAppSlug;
    conversationId: string;
    assistantMessageId?: string | null;
    workspaceId?: string | number | null;
    confirmed?: boolean;
    inputs?: Metadata;
  }) => Promise<AssistantActionExecutionResponse>;
};

type SupportStep = "idle" | "email" | "subject" | "sending" | "done";

const DEFAULT_WELCOME =
  "Ask me about XFlow, Verixet, Rataify, AudAiX, WordGeni, Crevux, pricing, access, or support.";

const DEFAULT_PROMPTS = [
  "What does this app do?",
  "What app should I start with?",
  "How does Verixet handle billing and access?",
  "What plan should I choose?",
  "I need support",
];

const DEFAULT_THEME: EcosystemAssistantBubbleTheme = {
  accent: "#22d3ee",
  accentText: "#06111f",
  panel: "#07111f",
  panelAlt: "#0d1728",
  border: "rgba(103, 232, 249, 0.28)",
  text: "#f8fafc",
  muted: "#a9b7c9",
};

function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function readVisitorSessionId(storageKey: string): string {
  try {
    const existing = window.localStorage.getItem(storageKey);
    if (existing) return existing;
    const created = createId("visitor");
    window.localStorage.setItem(storageKey, created);
    return created;
  } catch {
    return createId("visitor");
  }
}

function isSupportPrompt(value: string): boolean {
  return /^(i need support|contact support|support)$/i.test(value.trim());
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return ECOSYSTEM_ASSISTANT_STATE_COPY.unavailable;
}

export function EcosystemAssistantBubble(props: EcosystemAssistantBubbleProps): React.ReactElement {
  const theme = { ...DEFAULT_THEME, ...props.theme };
  const promptPack = props.promptPack ?? ECOSYSTEM_ASSISTANT_PROMPT_PACKS[props.appSlug];
  const contextSeed = props.assistantContext;
  const quickPrompts = props.quickPrompts ?? promptPack?.suggestedPrompts ?? DEFAULT_PROMPTS;
  const statusLabel = props.statusLabel ?? "Connected";
  const footerText = props.footerText ?? promptPack?.footerText ?? "Uses ecosystem context through the app's secure assistant route.";
  const loadingText = props.loadingText ?? ECOSYSTEM_ASSISTANT_STATE_COPY.loading;
  const inputPlaceholder = props.inputPlaceholder ?? ECOSYSTEM_ASSISTANT_STATE_COPY.inputPlaceholder;
  const [open, setOpen] = React.useState(false);
  const [visitorSessionId, setVisitorSessionId] = React.useState<string | null>(null);
  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [feedbackWorkspaceId, setFeedbackWorkspaceId] = React.useState<string | number | null>(null);
  const [messages, setMessages] = React.useState<EcosystemAssistantUiMessage[]>([
    { id: "welcome", role: "assistant", content: props.welcomeMessage ?? promptPack?.welcomeMessage ?? DEFAULT_WELCOME },
  ]);
  const [draft, setDraft] = React.useState(contextSeed?.promptSeed ?? "");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = React.useState<string | null>(null);
  const [supportStep, setSupportStep] = React.useState<SupportStep>("idle");
  const [supportEmail, setSupportEmail] = React.useState("");
  const [supportSubject, setSupportSubject] = React.useState("");
  const [feedbackDrafts, setFeedbackDrafts] = React.useState<Record<string, string>>({});
  const [feedbackStatus, setFeedbackStatus] = React.useState<Record<string, "idle" | "sending" | "sent" | "error">>({});
  const [pendingActionId, setPendingActionId] = React.useState<string | null>(null);
  const [actionStatus, setActionStatus] = React.useState<Record<string, "idle" | "running" | "done" | "error">>({});
  const transcriptRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    setVisitorSessionId(readVisitorSessionId(props.storageKey));
  }, [props.storageKey]);

  React.useEffect(() => {
    if (draft.trim() || !contextSeed?.promptSeed) return;
    setDraft(contextSeed.promptSeed);
  }, [contextSeed?.promptSeed, draft]);

  React.useEffect(() => {
    if (!open) return;
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight });
    inputRef.current?.focus();
  }, [open, messages.length, loading, supportStep]);

  async function sendMessage(prompt: string): Promise<void> {
    const text = prompt.trim();
    if (!text || !visitorSessionId || loading) return;
    if (isSupportPrompt(text)) {
      startSupportFlow();
      return;
    }

    setOpen(true);
    setDraft("");
    setError(null);
    setLastPrompt(text);
    setMessages((previous) => [...previous, { id: createId("user"), role: "user", content: text }]);
    setLoading(true);
    try {
      const response = await props.sendChat({
        message: text,
        visitorSessionId,
        conversationId,
        currentPath: props.currentPath ?? null,
        metadata: {
          source: "ecosystem_assistant_bubble",
          appSlug: props.appSlug,
          assistantContext: contextSeed,
          ...props.metadata,
        },
      });
      setConversationId(response.conversationId);
      setFeedbackWorkspaceId(response.workspaceId ?? (props.metadata?.workspaceId as string | number | null | undefined) ?? null);
      setMessages((previous) => [
        ...previous,
        {
          id: response.assistantMessageId ?? createId("assistant"),
          assistantMessageId: response.assistantMessageId ?? null,
          role: "assistant",
          content: response.answer,
          suggestedLinks: response.suggestedLinks,
          proposedActions: response.proposedActions,
        },
      ]);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  async function executeMessageAction(message: EcosystemAssistantUiMessage, action: AssistantProposedAction, confirmed: boolean): Promise<void> {
    if (!props.executeAction || !conversationId || !message.assistantMessageId || actionStatus[action.actionId] === "running") return;
    const workspaceId = feedbackWorkspaceId ?? (props.metadata?.workspaceId as string | number | null | undefined) ?? null;
    if (!workspaceId) {
      setMessages((previous) => [
        ...previous,
        { id: createId("system"), role: "system", content: "Sign in and select a workspace before running assistant actions." },
      ]);
      return;
    }

    setActionStatus((previous) => ({ ...previous, [action.actionId]: "running" }));
    try {
      const result = await props.executeAction({
        actionId: action.actionId,
        appSlug: action.appSlug,
        conversationId,
        assistantMessageId: message.assistantMessageId,
        workspaceId,
        confirmed,
        inputs: action.inputs ?? {},
      });
      setActionStatus((previous) => ({ ...previous, [action.actionId]: result.status === "succeeded" ? "done" : "error" }));
      setPendingActionId(null);
      setMessages((previous) => [
        ...previous,
        { id: createId("system"), role: "system", content: result.resultSummary },
      ]);
    } catch (caught) {
      setActionStatus((previous) => ({ ...previous, [action.actionId]: "error" }));
      setMessages((previous) => [
        ...previous,
        { id: createId("system"), role: "system", content: errorMessage(caught) },
      ]);
    }
  }

  async function submitMessageFeedback(
    message: EcosystemAssistantUiMessage,
    patch: Pick<EcosystemAssistantFeedbackInput, "rating" | "resolved" | "acceptedRecommendedAction" | "dismissedRecommendedAction">
  ): Promise<void> {
    if (!props.submitFeedback || !conversationId || !message.assistantMessageId || feedbackStatus[message.id] === "sending") return;
    const text = feedbackDrafts[message.id]?.trim() || null;
    setFeedbackStatus((previous) => ({ ...previous, [message.id]: "sending" }));
    try {
      await props.submitFeedback({
        conversationId,
        assistantMessageId: message.assistantMessageId,
        workspaceId: feedbackWorkspaceId ?? (props.metadata?.workspaceId as string | number | null | undefined) ?? null,
        appSlug: props.appSlug,
        userFeedbackText: text,
        ...patch,
      });
      setFeedbackStatus((previous) => ({ ...previous, [message.id]: "sent" }));
    } catch {
      setFeedbackStatus((previous) => ({ ...previous, [message.id]: "error" }));
    }
  }

  function startSupportFlow(): void {
    setOpen(true);
    setError(null);
    if (!conversationId) {
      setMessages((previous) => [
        ...previous,
        {
          id: createId("system"),
          role: "system",
          content: ECOSYSTEM_ASSISTANT_STATE_COPY.needsConversationForSupport,
        },
      ]);
      return;
    }
    setSupportStep("email");
  }

  async function submitSupport(): Promise<void> {
    if (!visitorSessionId || !conversationId || loading) return;
    if (!supportEmail.trim()) {
      setSupportStep("email");
      return;
    }
    if (!supportSubject.trim()) {
      setSupportStep("subject");
      return;
    }

    setSupportStep("sending");
    setLoading(true);
    setError(null);
    try {
      const response = await props.escalate({
        conversationId,
        visitorSessionId,
        email: supportEmail.trim(),
        subject: supportSubject.trim(),
        message: `Support requested from the ${props.appName} public assistant bubble.`,
        metadata: {
          source: "ecosystem_assistant_bubble",
          appSlug: props.appSlug,
          assistantContext: contextSeed,
          ...props.metadata,
        },
      });
      setSupportStep("done");
      setMessages((previous) => [
        ...previous,
        {
          id: createId("system"),
          role: "system",
          content: `Support has the conversation context. Support conversation ID: ${response.supportConversationId}`,
        },
      ]);
    } catch (caught) {
      setSupportStep("subject");
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(draft);
    }
  }

  const styles = createStyles(theme);

  return (
    <div style={styles.root}>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} style={styles.launcher} aria-label={`Open ${props.appName} ecosystem assistant`}>
          <span style={styles.launcherIcon}>{props.logo ?? props.appName.slice(0, 2).toUpperCase()}</span>
          <span style={styles.launcherLabel}>Ask {promptPack?.appName ?? props.appName}</span>
        </button>
      ) : (
        <section style={styles.panel} aria-label={`${props.appName} ecosystem assistant`}>
          <header style={styles.header}>
            <div style={styles.headerBrand}>
              <div style={styles.avatar}>{props.logo ?? props.appName.slice(0, 2).toUpperCase()}</div>
              <div>
                <p style={styles.eyebrow}>{props.title ?? promptPack?.assistantName ?? `${props.appName} Assistant`}</p>
                <h2 style={styles.heading}>{props.subtitle ?? promptPack?.subtitle ?? "Ecosystem help"}</h2>
                <div style={styles.contextRow}>
                  <span style={styles.statusDot} aria-hidden />
                  <span>{contextSeed?.appName ?? promptPack?.appName ?? props.appName}</span>
                  {props.workspaceLabel ? <span>| {props.workspaceLabel}</span> : null}
                  {contextSeed?.pageTitle ? <span>| {contextSeed.pageTitle}</span> : null}
                  {contextSeed?.toolStatus ? <span>| {contextSeed.toolStatus}</span> : null}
                  <span>| {statusLabel}</span>
                </div>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} style={styles.iconButton} aria-label="Close assistant">
              ×
            </button>
          </header>

          <div ref={transcriptRef} style={styles.transcript}>
            {messages.map((message) => (
              <article
                key={message.id}
                style={
                  message.role === "user"
                    ? styles.userMessage
                    : message.role === "system"
                      ? styles.systemMessage
                      : styles.assistantMessage
                }
              >
                <p style={styles.messageText}>{message.content}</p>
                {message.suggestedLinks?.length ? (
                  <div style={styles.linkRow}>
                    {message.suggestedLinks.slice(0, 4).map((link) => (
                      <a key={`${link.label}-${link.href}`} href={link.href} style={styles.suggestedLink}>
                        {link.label} →
                      </a>
                    ))}
                  </div>
                ) : null}
                {props.executeAction && message.role === "assistant" && message.assistantMessageId && conversationId && message.proposedActions?.length ? (
                  <div style={styles.actionBox}>
                    {message.proposedActions.slice(0, 3).map((action) => {
                      const isPending = pendingActionId === action.actionId;
                      const status = actionStatus[action.actionId];
                      return (
                        <div key={action.actionId} style={styles.actionCard}>
                          <strong style={styles.actionTitle}>{action.label}</strong>
                          <span style={styles.actionDescription}>{action.description}</span>
                          <span style={styles.actionMeta}>
                            {action.riskLevel} risk | {action.requiredRole}+ role
                          </span>
                          {action.requiresConfirmation && !isPending ? (
                            <button type="button" onClick={() => setPendingActionId(action.actionId)} style={styles.actionButton}>
                              Review
                            </button>
                          ) : action.requiresConfirmation && isPending ? (
                            <div style={styles.actionControls}>
                              <button type="button" onClick={() => void executeMessageAction(message, action, true)} disabled={status === "running"} style={styles.actionButton}>
                                Confirm
                              </button>
                              <button type="button" onClick={() => setPendingActionId(null)} style={styles.secondaryActionButton}>
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => void executeMessageAction(message, action, false)} disabled={status === "running"} style={styles.actionButton}>
                              {status === "running" ? "Running" : "Run"}
                            </button>
                          )}
                          {status === "done" ? <span style={styles.feedbackStatus}>Action complete</span> : null}
                          {status === "error" ? <span style={styles.feedbackError}>Action did not run</span> : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                {props.submitFeedback && message.role === "assistant" && message.assistantMessageId && conversationId ? (
                  <div style={styles.feedbackBox}>
                    <div style={styles.feedbackControls}>
                      <button type="button" onClick={() => void submitMessageFeedback(message, { rating: "helpful", resolved: null, acceptedRecommendedAction: null, dismissedRecommendedAction: null })} style={styles.feedbackButton} aria-label="Mark assistant answer helpful">
                        Thumbs up
                      </button>
                      <button type="button" onClick={() => void submitMessageFeedback(message, { rating: "not_helpful", resolved: null, acceptedRecommendedAction: null, dismissedRecommendedAction: null })} style={styles.feedbackButton} aria-label="Mark assistant answer not helpful">
                        Thumbs down
                      </button>
                      <button type="button" onClick={() => void submitMessageFeedback(message, { rating: "helpful", resolved: true, acceptedRecommendedAction: true, dismissedRecommendedAction: null })} style={styles.feedbackButton} aria-label="Mark assistant answer solved">
                        Solved
                      </button>
                      <button type="button" onClick={() => void submitMessageFeedback(message, { rating: "not_helpful", resolved: false, acceptedRecommendedAction: null, dismissedRecommendedAction: true })} style={styles.feedbackButton} aria-label="Mark assistant answer not solved">
                        Not solved
                      </button>
                    </div>
                    <input
                      value={feedbackDrafts[message.id] ?? ""}
                      onChange={(event) => setFeedbackDrafts((previous) => ({ ...previous, [message.id]: event.target.value }))}
                      maxLength={500}
                      placeholder="Optional note"
                      style={styles.feedbackInput}
                    />
                    {feedbackStatus[message.id] === "sent" ? <span style={styles.feedbackStatus}>Feedback saved</span> : null}
                    {feedbackStatus[message.id] === "error" ? <span style={styles.feedbackError}>Feedback was not saved</span> : null}
                  </div>
                ) : null}
              </article>
            ))}
            {loading ? <div style={styles.assistantMessage}>{loadingText}</div> : null}
          </div>

          <div style={styles.composer}>
            <div style={styles.promptRow}>
              {quickPrompts.map((prompt) => (
                <button key={prompt} type="button" onClick={() => void sendMessage(prompt)} style={styles.promptChip}>
                  {prompt}
                </button>
              ))}
              <button type="button" onClick={startSupportFlow} style={styles.supportChip}>
                Contact support
              </button>
            </div>

            {supportStep !== "idle" && supportStep !== "done" ? (
              <div style={styles.supportBox}>
                <strong style={styles.supportTitle}>Contact support</strong>
                <label style={styles.label}>
                  Email
                  <input value={supportEmail} onChange={(event) => setSupportEmail(event.target.value)} style={styles.input} placeholder="you@example.com" type="email" />
                </label>
                <label style={styles.label}>
                  Subject
                  <input value={supportSubject} onChange={(event) => setSupportSubject(event.target.value)} style={styles.input} placeholder={ECOSYSTEM_ASSISTANT_STATE_COPY.supportSubjectPlaceholder} />
                </label>
                <button type="button" onClick={() => void submitSupport()} disabled={loading} style={styles.primaryButton}>
                  Send to support
                </button>
              </div>
            ) : null}

            {error ? (
              <div style={styles.errorBox}>
                <p style={styles.messageText}>{props.errorText ?? error}</p>
                {lastPrompt ? (
                  <button type="button" onClick={() => void sendMessage(lastPrompt)} style={styles.retryButton}>
                    Retry
                  </button>
                ) : null}
              </div>
            ) : null}

            <div style={styles.inputRow}>
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onInputKeyDown}
                rows={2}
                placeholder={inputPlaceholder}
                style={styles.textarea}
              />
              <button type="button" onClick={() => void sendMessage(draft)} disabled={loading || !draft.trim()} style={styles.sendButton} aria-label="Send message">
                →
              </button>
            </div>
            <p style={styles.footerText}>{footerText}</p>
          </div>
        </section>
      )}
    </div>
  );
}

function createStyles(theme: EcosystemAssistantBubbleTheme): Record<string, React.CSSProperties> {
  return {
    root: {
      position: "fixed",
      right: "20px",
      bottom: "20px",
      zIndex: 50,
      fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    launcher: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      border: `1px solid ${theme.border}`,
      background: `${theme.panel}f2`,
      color: theme.text,
      borderRadius: "999px",
      padding: "10px 14px",
      boxShadow: "0 20px 55px rgba(0, 0, 0, 0.42)",
      cursor: "pointer",
      fontWeight: 700,
    },
    launcherIcon: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "36px",
      height: "36px",
      borderRadius: "999px",
      overflow: "hidden",
      background: theme.accent,
      color: theme.accentText,
      padding: "6px",
      fontSize: "12px",
      fontWeight: 900,
      boxSizing: "border-box",
    },
    launcherLabel: { fontSize: "14px" },
    panel: {
      width: "min(390px, calc(100vw - 24px))",
      maxHeight: "82vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      border: `1px solid ${theme.border}`,
      borderRadius: "22px",
      background: theme.panel,
      color: theme.text,
      boxShadow: "0 24px 70px rgba(0, 0, 0, 0.56)",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "12px",
      padding: "16px",
      borderBottom: `1px solid ${theme.border}`,
      background: `linear-gradient(135deg, ${theme.panel}, ${theme.panelAlt})`,
    },
    headerBrand: { display: "flex", alignItems: "center", gap: "12px" },
    avatar: {
      width: "40px",
      height: "40px",
      borderRadius: "14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      border: `1px solid ${theme.border}`,
      background: `${theme.accent}26`,
      color: theme.accent,
      padding: "7px",
      fontWeight: 900,
      fontSize: "12px",
      boxSizing: "border-box",
    },
    eyebrow: {
      margin: 0,
      color: theme.accent,
      fontSize: "11px",
      fontWeight: 800,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
    },
    heading: { margin: "3px 0 0", color: theme.text, fontSize: "16px", lineHeight: 1.2 },
    contextRow: {
      marginTop: "6px",
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "6px",
      color: theme.muted,
      fontSize: "11px",
      lineHeight: 1.3,
    },
    statusDot: {
      width: "7px",
      height: "7px",
      borderRadius: "999px",
      background: theme.accent,
      boxShadow: `0 0 0 3px ${theme.accent}22`,
    },
    iconButton: {
      border: 0,
      background: "rgba(255,255,255,0.08)",
      color: theme.text,
      width: "32px",
      height: "32px",
      borderRadius: "999px",
      cursor: "pointer",
      fontSize: "22px",
      lineHeight: "26px",
    },
    transcript: {
      maxHeight: "430px",
      minHeight: "180px",
      overflowY: "auto",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    assistantMessage: {
      marginRight: "28px",
      border: "1px solid rgba(255,255,255,0.1)",
      background: theme.panelAlt,
      borderRadius: "18px 18px 18px 6px",
      padding: "12px 14px",
      color: theme.text,
      fontSize: "13px",
      lineHeight: 1.55,
    },
    userMessage: {
      marginLeft: "28px",
      background: theme.accent,
      color: theme.accentText,
      borderRadius: "18px 18px 6px 18px",
      padding: "12px 14px",
      fontSize: "13px",
      lineHeight: 1.45,
    },
    systemMessage: {
      border: "1px solid rgba(52, 211, 153, 0.35)",
      background: "rgba(52, 211, 153, 0.10)",
      color: "#d1fae5",
      borderRadius: "14px",
      padding: "12px 14px",
      fontSize: "13px",
      lineHeight: 1.45,
    },
    messageText: { margin: 0, whiteSpace: "pre-wrap" },
    linkRow: { display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" },
    suggestedLink: {
      border: `1px solid ${theme.border}`,
      borderRadius: "999px",
      color: theme.text,
      padding: "5px 8px",
      textDecoration: "none",
      fontSize: "12px",
    },
    actionBox: { marginTop: "10px", display: "grid", gap: "8px" },
    actionCard: {
      border: `1px solid ${theme.border}`,
      borderRadius: "12px",
      background: "rgba(255,255,255,0.035)",
      padding: "9px",
      display: "grid",
      gap: "5px",
    },
    actionTitle: { fontSize: "12px", color: theme.text },
    actionDescription: { fontSize: "11px", color: theme.muted, lineHeight: 1.35 },
    actionMeta: { fontSize: "10px", color: theme.muted, textTransform: "uppercase" },
    actionControls: { display: "flex", gap: "6px", flexWrap: "wrap" },
    actionButton: {
      border: 0,
      borderRadius: "8px",
      background: theme.accent,
      color: theme.accentText,
      padding: "6px 9px",
      fontSize: "11px",
      fontWeight: 800,
      cursor: "pointer",
    },
    secondaryActionButton: {
      border: `1px solid ${theme.border}`,
      borderRadius: "8px",
      background: "transparent",
      color: theme.text,
      padding: "6px 9px",
      fontSize: "11px",
      fontWeight: 700,
      cursor: "pointer",
    },
    feedbackBox: { marginTop: "10px", display: "grid", gap: "7px" },
    feedbackControls: { display: "flex", flexWrap: "wrap", gap: "6px" },
    feedbackButton: {
      border: `1px solid ${theme.border}`,
      borderRadius: "999px",
      background: "rgba(255,255,255,0.04)",
      color: theme.muted,
      padding: "4px 7px",
      fontSize: "11px",
      cursor: "pointer",
    },
    feedbackInput: {
      width: "100%",
      boxSizing: "border-box",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "8px",
      background: theme.panel,
      color: theme.text,
      padding: "7px 8px",
      fontSize: "12px",
    },
    feedbackStatus: { color: "#bbf7d0", fontSize: "11px" },
    feedbackError: { color: "#fecaca", fontSize: "11px" },
    composer: { borderTop: `1px solid ${theme.border}`, padding: "14px" },
    promptRow: { display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" },
    promptChip: {
      border: "1px solid rgba(255,255,255,0.12)",
      background: theme.panelAlt,
      color: theme.text,
      borderRadius: "999px",
      padding: "7px 10px",
      fontSize: "12px",
      cursor: "pointer",
    },
    supportChip: {
      border: `1px solid ${theme.border}`,
      background: `${theme.accent}18`,
      color: theme.text,
      borderRadius: "999px",
      padding: "7px 10px",
      fontSize: "12px",
      fontWeight: 700,
      cursor: "pointer",
    },
    supportBox: {
      border: `1px solid ${theme.border}`,
      background: `${theme.accent}14`,
      borderRadius: "14px",
      padding: "12px",
      marginBottom: "12px",
    },
    supportTitle: { display: "block", marginBottom: "8px", fontSize: "13px" },
    label: { display: "block", color: theme.muted, fontSize: "12px", marginTop: "8px" },
    input: {
      display: "block",
      width: "100%",
      boxSizing: "border-box",
      marginTop: "5px",
      border: "1px solid rgba(255,255,255,0.14)",
      borderRadius: "9px",
      background: theme.panel,
      color: theme.text,
      padding: "9px 10px",
    },
    primaryButton: {
      width: "100%",
      marginTop: "10px",
      border: 0,
      borderRadius: "9px",
      background: theme.accent,
      color: theme.accentText,
      padding: "10px",
      fontWeight: 800,
      cursor: "pointer",
    },
    errorBox: {
      border: "1px solid rgba(248,113,113,0.45)",
      background: "rgba(248,113,113,0.12)",
      color: "#fee2e2",
      borderRadius: "12px",
      padding: "10px",
      marginBottom: "12px",
      fontSize: "13px",
    },
    retryButton: {
      marginTop: "8px",
      border: 0,
      background: "transparent",
      color: "#fee2e2",
      textDecoration: "underline",
      fontWeight: 700,
      cursor: "pointer",
    },
    inputRow: { display: "flex", alignItems: "flex-end", gap: "8px" },
    textarea: {
      minHeight: "48px",
      flex: 1,
      resize: "none",
      border: "1px solid rgba(255,255,255,0.14)",
      borderRadius: "14px",
      background: theme.panelAlt,
      color: theme.text,
      padding: "10px 11px",
      fontSize: "13px",
      outline: "none",
    },
    sendButton: {
      flex: "0 0 auto",
      width: "44px",
      height: "44px",
      border: 0,
      borderRadius: "14px",
      background: theme.accent,
      color: theme.accentText,
      cursor: "pointer",
      fontSize: "22px",
      fontWeight: 900,
    },
    footerText: {
      margin: "9px 0 0",
      color: theme.muted,
      fontSize: "11px",
      lineHeight: 1.35,
    },
  };
}
