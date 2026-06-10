/**
 * Chat SDK bridge — wraps a Chat SDK adapter + Chat instance
 * to conform to the NanoClaw ChannelAdapter interface.
 *
 * Used by Discord, Slack, and other Chat SDK-supported platforms.
 */
import http from 'http';

import {
  Chat,
  Card,
  CardText,
  Actions,
  Button,
  LinkButton,
  type CardChild,
  type Adapter,
  type ActionsElement,
  type ButtonElement,
  type LinkButtonElement,
  type SelectElement,
  type RadioSelectElement,
  type ConcurrencyStrategy,
  type Message as ChatMessage,
} from 'chat';
import { log } from '../log.js';
import { SqliteStateAdapter } from '../state-sqlite.js';
import { registerWebhookAdapter } from '../webhook-server.js';
import { getAskQuestionRender } from '../db/sessions.js';
import { normalizeOptions, type NormalizedOption } from './ask-question.js';
import type { ChannelAdapter, ChannelSetup, InboundMessage } from './adapter.js';

/** Adapter with optional gateway support (e.g., Discord). */
interface GatewayAdapter extends Adapter {
  startGatewayListener?(
    options: { waitUntil?: (task: Promise<unknown>) => void },
    durationMs?: number,
    abortSignal?: AbortSignal,
    webhookUrl?: string,
  ): Promise<Response>;
}

/** Reply context extracted from a platform's raw message. */
export interface ReplyContext {
  text: string;
  sender: string;
}

/** Extract reply context from a platform-specific raw message. Return null if no reply. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReplyContextExtractor = (raw: Record<string, any>) => ReplyContext | null;

export interface ChatSdkBridgeConfig {
  adapter: Adapter;
  concurrency?: ConcurrencyStrategy;
  /** Bot token for authenticating forwarded Gateway events (required for interaction handling). */
  botToken?: string;
  /** Platform-specific reply context extraction. */
  extractReplyContext?: ReplyContextExtractor;
  /**
   * Whether this platform uses threads as the primary conversation unit.
   * See `ChannelAdapter.supportsThreads`. Declared by the calling channel
   * skill, not inferred, because some platforms (Discord) can be used either
   * way and the default depends on installation style.
   */
  supportsThreads: boolean;
  /**
   * Optional transform applied to outbound text/markdown before it reaches the
   * adapter. Used by channels that need to sanitize for a platform-specific
   * quirk (e.g. Telegram's legacy Markdown parse mode).
   */
  transformOutboundText?: (text: string) => string;
  /**
   * Maximum text length the underlying adapter accepts in a single message.
   * When set, the bridge splits outbound text longer than this on paragraph
   * → line → hard-char boundaries and posts multiple messages. Without this,
   * adapters like Discord (2000) and Telegram (4096) silently truncate
   * mid-response. The returned id is the first chunk's id so subsequent edits
   * and reactions still target the head of the reply.
   */
  maxTextLength?: number;
  /**
   * If true, outbound text is sent to the adapter as `{ raw: text }` instead
   * of `{ markdown: text }`. Use this when the agent already emits strings in
   * the platform's native format and the adapter's Markdown → AST → platform
   * round-trip corrupts them. Concrete case: `@chat-adapter/discord` parses
   * `<https://…>` autolinks into link nodes and renders them back as
   * `[url](url)`, double-wrapping every suppress-embed link the agent writes.
   */
  sendAsRaw?: boolean;
  /**
   * Override for the channel-type / adapter name. When a second instance of an
   * existing channel type is needed (e.g. two Telegram bots on the same host),
   * the underlying chat-sdk adapter exposes a hardcoded `name` ('telegram'),
   * which would collide in the `activeAdapters` registry. Set this to a unique
   * identifier per registration (e.g. 'telegram-stokes') and it replaces both
   * `name` and `channelType` on the resulting ChannelAdapter.
   */
  channelType?: string;
}

/**
 * Split `text` into chunks no larger than `limit`, preferring paragraph
 * breaks, then line breaks, then a hard character cut as a last resort.
 * Preserves code fences only structurally — a fenced block that straddles a
 * chunk boundary will render as two independent blocks on the receiving
 * platform, which is the same behavior as manually re-opening a fence.
 */
/**
 * Decode the actual option value from a button callback. Buttons are encoded
 * with an integer index (to keep under Telegram's 64-byte callback_data cap),
 * and the real value is looked up via `getAskQuestionRender(questionId)`.
 * Falls back to treating the tail as a literal value so old in-flight cards
 * (encoded before this shortening landed) still resolve.
 */
function resolveSelectedOption(
  render: { options: NormalizedOption[] } | undefined,
  eventValue: string | undefined,
  tail: string | undefined,
): string {
  const candidate = eventValue ?? tail ?? '';
  if (render && /^\d+$/.test(candidate)) {
    const idx = Number(candidate);
    if (render.options[idx]) return render.options[idx].value;
  }
  return candidate;
}

/**
 * Layout the button list into one or more `Actions(...)` blocks. Telegram's
 * inline-keyboard adapter renders one `Actions(...)` block as a single row,
 * so multiple rows = multiple `Actions(...)` blocks.
 *
 * `auto` (default): vertical (one button per row) when there are 3+ buttons
 * or any label is longer than ~12 chars; otherwise horizontal (one row).
 * `vertical` / `horizontal` overrides force the layout. The threshold is
 * tuned for Telegram's narrow mobile button width — wider labels truncate
 * mid-word and Tomi can't read what he's clicking.
 */
type ButtonLike = ButtonElement | LinkButtonElement | SelectElement | RadioSelectElement;

function buildButtonRows(
  buttons: ButtonLike[],
  labels: string[],
  layout?: 'vertical' | 'horizontal' | 'auto',
): ActionsElement[] {
  if (buttons.length === 0) return [];
  const explicit = layout === 'vertical' || layout === 'horizontal' ? layout : undefined;
  const longest = labels.reduce((m, l) => Math.max(m, (l ?? '').length), 0);
  const useVertical = explicit === 'vertical' || (!explicit && (buttons.length >= 3 || longest > 12));
  if (useVertical) return buttons.map((btn) => Actions([btn]));
  return [Actions(buttons)];
}

export function splitForLimit(text: string, limit: number): string[] {
  if (text.length <= limit) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > limit) {
    let cut = remaining.lastIndexOf('\n\n', limit);
    if (cut <= 0) cut = remaining.lastIndexOf('\n', limit);
    if (cut <= 0) cut = remaining.lastIndexOf(' ', limit);
    if (cut <= 0) cut = limit;
    chunks.push(remaining.slice(0, cut).trimEnd());
    remaining = remaining.slice(cut).trimStart();
  }
  if (remaining.length > 0) chunks.push(remaining);
  return chunks;
}

export function createChatSdkBridge(config: ChatSdkBridgeConfig): ChannelAdapter {
  const { adapter } = config;
  const transformText = (t: string): string => (config.transformOutboundText ? config.transformOutboundText(t) : t);
  // When sendAsRaw is set, deliver text as `{ raw }` so the adapter skips its
  // Markdown → AST → platform round-trip (which corrupts `<url>` autolinks on
  // Discord). Otherwise deliver as `{ markdown }` as before.
  const textPayload = (t: string): { raw: string } | { markdown: string } =>
    config.sendAsRaw ? { raw: t } : { markdown: t };

  // Markdown delivery with a plain-text fallback. Some adapters (Telegram, via
  // @chat-adapter/telegram) apply parse_mode=Markdown whenever the payload
  // carries a `markdown` field, and reject the entire message when that
  // markdown is malformed — unbalanced `*`/`_`, an unterminated inline code
  // span, or a broken `[link](url)`. The downstream sanitizer balances most
  // delimiters but can't cover every legacy-parser edge case, so delivery.ts
  // then exhausts its 3 retries on the same payload and drops the message
  // permanently ("can't parse entities … giving up"). On a parse error, resend
  // the same body as `{ raw }`: the adapter emits no parse_mode for raw
  // payloads, so the text always lands. Formatting is lost only on the rare
  // malformed turn — strictly better than silent loss. Non-markdown payloads
  // (cards, files-only) and unrelated errors fall through to the original throw.
  const postMaybeRaw = async <T>(
    tid: string,
    payload: T & ({ markdown: string } | { raw: string } | Record<string, unknown>),
  ): Promise<{ id?: string } | undefined> => {
    try {
      return (await adapter.postMessage(tid, payload as never)) as { id?: string } | undefined;
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      if (
        payload &&
        typeof payload === 'object' &&
        'markdown' in payload &&
        /parse entities|parse_mode|can't find end of/i.test(reason)
      ) {
        const { markdown, ...rest } = payload as { markdown: string } & Record<string, unknown>;
        log.warn('Markdown delivery rejected by adapter, retrying as raw text', {
          adapter: adapter.name,
          reason,
        });
        return (await adapter.postMessage(tid, { ...rest, raw: markdown } as never)) as { id?: string } | undefined;
      }
      throw err;
    }
  };
  let chat: Chat;
  let state: SqliteStateAdapter;
  let setupConfig: ChannelSetup;
  let gatewayAbort: AbortController | null = null;

  async function messageToInbound(
    message: ChatMessage,
    isMention: boolean,
    isGroup?: boolean,
  ): Promise<InboundMessage> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serialized = message.toJSON() as Record<string, any>;

    // Download attachment data before serialization loses fetchData()
    if (message.attachments && message.attachments.length > 0) {
      const enriched = [];
      for (const att of message.attachments) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entry: Record<string, any> = {
          type: att.type,
          name: att.name,
          mimeType: att.mimeType,
          size: att.size,
          width: (att as unknown as Record<string, unknown>).width,
          height: (att as unknown as Record<string, unknown>).height,
        };
        if (att.fetchData) {
          try {
            const buffer = await att.fetchData();
            entry.data = buffer.toString('base64');
          } catch (err) {
            log.warn('Failed to download attachment', { type: att.type, err });
          }
        }
        enriched.push(entry);
      }
      serialized.attachments = enriched;
    }

    // Extract reply context via platform-specific hook
    if (config.extractReplyContext && message.raw) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const replyTo = config.extractReplyContext(message.raw as Record<string, any>);
      if (replyTo) serialized.replyTo = replyTo;
    }

    // Project chat-sdk's nested author into the flat sender fields the router
    // expects (see src/router.ts extractAndUpsertUser). Native adapters already
    // populate these directly; this brings chat-sdk adapters in line.
    const author = serialized.author as { userId?: string; fullName?: string; userName?: string } | undefined;
    if (author) {
      const name = author.fullName ?? author.userName;
      serialized.senderId = author.userId;
      serialized.sender = name;
      serialized.senderName = name;
    }

    // Drop raw to save DB space (can be very large)
    serialized.raw = undefined;

    return {
      id: message.id,
      kind: 'chat-sdk',
      content: serialized,
      timestamp: message.metadata.dateSent.toISOString(),
      isMention,
      isGroup,
    };
  }

  const effectiveChannelType = config.channelType ?? adapter.name;
  const bridge: ChannelAdapter = {
    name: effectiveChannelType,
    channelType: effectiveChannelType,
    supportsThreads: config.supportsThreads,

    async setup(hostConfig: ChannelSetup) {
      setupConfig = hostConfig;

      state = new SqliteStateAdapter();

      chat = new Chat({
        adapters: { [adapter.name]: adapter },
        userName: adapter.userName || 'NanoClaw',
        concurrency: config.concurrency ?? 'concurrent',
        state,
        logger: 'silent',
      });

      // Four SDK dispatch paths — bridge just forwards. All per-wiring
      // engage / accumulate / drop / subscribe decisions live in the host
      // router (src/router.ts routeInbound / evaluateEngage). The bridge
      // only resolves channel ids and sets the platform-confirmed isMention
      // flag that routeInbound evaluates; the router calls back into
      // bridge.subscribe(...) when a mention-sticky wiring engages.

      // Subscribed threads — every message in a thread we've previously
      // engaged. Carry the SDK's `message.isMention` through so mention-mode
      // wirings still fire on in-thread mentions.
      chat.onSubscribedMessage(async (thread, message) => {
        const channelId = adapter.channelIdFromThreadId(thread.id);
        await setupConfig.onInbound(
          channelId,
          thread.id,
          await messageToInbound(message, message.isMention === true, true),
        );
      });

      // @mention in an unsubscribed thread — SDK-confirmed bot mention.
      chat.onNewMention(async (thread, message) => {
        const channelId = adapter.channelIdFromThreadId(thread.id);
        await setupConfig.onInbound(channelId, thread.id, await messageToInbound(message, true, true));
      });

      // DMs — by definition addressed to the bot. Thread id flows through
      // so sub-thread context reaches delivery (Slack users can open threads
      // inside a DM). Router collapses DM sub-threads to one session via
      // is_group=0 short-circuit.
      chat.onDirectMessage(async (thread, message) => {
        const channelId = adapter.channelIdFromThreadId(thread.id);
        log.info('Inbound DM received', {
          adapter: adapter.name,
          channelId,
          sender: (message.author as any)?.fullName ?? (message.author as any)?.userId ?? 'unknown',
          threadId: thread.id,
        });
        await setupConfig.onInbound(channelId, thread.id, await messageToInbound(message, true, false));
      });

      // Plain messages in unsubscribed threads.
      //
      // Chat SDK dispatch (handling-events.mdx §"Handler dispatch order") is
      // exclusive: subscribed → onSubscribedMessage; unsubscribed+mention →
      // onNewMention; unsubscribed+pattern-match → onNewMessage. Registering
      // with `/[\s\S]*/` lets the router see every plain message (including
      // media-only messages with empty text) on every unsubscribed thread the
      // getMessagingGroupWithAgentCount (~1 DB read) for unwired channels,
      // so forwarding every one is cheap enough to not need a bridge-side
      // flood gate.
      chat.onNewMessage(/[\s\S]*/, async (thread, message) => {
        const channelId = adapter.channelIdFromThreadId(thread.id);
        await setupConfig.onInbound(channelId, thread.id, await messageToInbound(message, false, true));
      });

      // Handle button clicks (ask_user_question + send_card)
      chat.onAction(async (event) => {
        // ask_user_question: pending_questions row drives the response flow
        if (event.actionId.startsWith('ncq:')) {
          const parts = event.actionId.split(':');
          if (parts.length < 3) return;
          const questionId = parts[1];
          const tail = parts.slice(2).join(':');
          const userId = event.user?.userId || '';

          // Resolve render metadata BEFORE dispatching onAction (which deletes the row).
          const render = getAskQuestionRender(questionId);
          // New format: button id/value is an integer index into options (kept
          // short to fit Telegram's 64-byte callback_data cap). Old format:
          // the full value is embedded in actionId/value directly.
          const selectedOption = resolveSelectedOption(render, event.value, tail);
          const title = render?.title ?? '❓ Question';
          const matched = render?.options.find((o) => o.value === selectedOption);
          const selectedLabel = matched?.selectedLabel ?? selectedOption ?? '(clicked)';

          // Update the card to show the selected answer and remove buttons
          try {
            const tid = event.threadId;
            await adapter.editMessage(tid, event.messageId, {
              markdown: `${title}\n\n${selectedLabel}`,
            });
          } catch (err) {
            log.warn('Failed to update card after action', { err });
          }

          setupConfig.onAction(questionId, selectedOption, userId);
          return;
        }

        // send_card with `actions: [{label, value}]`: there is no pending
        // question state on the host side, so the click is routed back into
        // the session as a synthetic inbound text message. The agent that
        // emitted the card sees the value as the user's reply and can act on
        // it (the prior turn — including the card payload — is still in its
        // context window). Without this branch every nccard click was a
        // silent no-op.
        if (event.actionId.startsWith('nccard:')) {
          const tid = event.threadId;
          const userId = event.user?.userId || '';
          const buttonValue = event.value || '';
          if (!buttonValue) {
            log.warn('nccard click missing value', { actionId: event.actionId });
            return;
          }

          // Best-effort: replace card with an acknowledgement so the buttons
          // disappear and the user gets visual feedback their click landed.
          try {
            await adapter.editMessage(tid, event.messageId, {
              markdown: `_↳ ${buttonValue}_`,
            });
          } catch (err) {
            log.warn('Failed to update nccard after action', { err });
          }

          const channelId = adapter.channelIdFromThreadId(tid);
          const senderName = event.user?.fullName || event.user?.userName || userId;
          const synthId = `nccard-action-${Date.now()}`;
          const syntheticInbound: InboundMessage = {
            id: synthId,
            kind: 'chat-sdk',
            content: {
              id: synthId,
              text: buttonValue,
              senderId: userId,
              sender: senderName,
              senderName,
            },
            timestamp: new Date().toISOString(),
            isMention: true,
            isGroup: false,
          };
          try {
            await setupConfig.onInbound(channelId, tid, syntheticInbound);
          } catch (err) {
            log.error('Failed to route nccard click as inbound', { err });
          }
          return;
        }
      });

      await chat.initialize();

      // Start Gateway listener for adapters that support it (e.g., Discord)
      const gatewayAdapter = adapter as GatewayAdapter;
      if (gatewayAdapter.startGatewayListener) {
        gatewayAbort = new AbortController();

        // Start local HTTP server to receive forwarded Gateway events (including interactions)
        const webhookUrl = await startLocalWebhookServer(gatewayAdapter, setupConfig, config.botToken);

        // Exponential backoff capped at 1h. Without this, an unrecoverable
        // failure (e.g., TokenInvalid) restarts ~10×/sec and Discord's
        // Cloudflare layer issues a multi-hour IP block. A run that lasts
        // longer than 5 minutes counts as healthy and resets the counter.
        let consecutiveFailures = 0;
        const startGateway = () => {
          if (gatewayAbort?.signal.aborted) return;
          const startedAt = Date.now();
          // Capture the long-running listener promise via waitUntil
          let listenerPromise: Promise<unknown> | undefined;
          gatewayAdapter.startGatewayListener!(
            {
              waitUntil: (p: Promise<unknown>) => {
                listenerPromise = p;
              },
            },
            24 * 60 * 60 * 1000,
            gatewayAbort!.signal,
            webhookUrl,
          ).then(() => {
            // startGatewayListener resolves immediately with a Response;
            // the actual work is in the listenerPromise passed to waitUntil
            if (!listenerPromise) return;
            const reschedule = (err?: unknown) => {
              if (gatewayAbort?.signal.aborted) return;
              const ranForMs = Date.now() - startedAt;
              if (ranForMs > 5 * 60 * 1000) consecutiveFailures = 0;
              else consecutiveFailures++;
              const delayMs = Math.min(60 * 60 * 1000, 2 ** consecutiveFailures * 1000);
              if (err) {
                log.error('Gateway listener error, retrying', {
                  adapter: adapter.name,
                  err,
                  consecutiveFailures,
                  delayMs,
                });
              } else {
                log.info('Gateway listener expired, restarting', {
                  adapter: adapter.name,
                  consecutiveFailures,
                  delayMs,
                });
              }
              setTimeout(startGateway, delayMs);
            };
            listenerPromise.then(() => reschedule()).catch(reschedule);
          });
        };
        startGateway();
        log.info('Gateway listener started', { adapter: adapter.name });
      } else {
        // Non-gateway adapters (Slack, Teams, GitHub, etc.) — register on the shared webhook server
        registerWebhookAdapter(chat, adapter.name);
      }

      log.info('Chat SDK bridge initialized', { adapter: adapter.name });
    },

    async deliver(platformId: string, threadId: string | null, message): Promise<string | undefined> {
      // platformId is already in the adapter's encoded format (e.g. "telegram:6037840640",
      // "discord:guildId:channelId") — use it directly as the thread ID.
      // `||` (not `??`) on purpose: upstream rows can carry thread_id='' (empty
      // string) when a scheduling INSERT or poll-loop inheritance writes blanks
      // instead of NULL — nullish-coalescing would pass that empty through and
      // crash the platform adapter with "chat_id is empty".
      const tid = threadId || platformId;
      const content = message.content as Record<string, unknown>;

      if (content.operation === 'edit' && content.messageId) {
        await adapter.editMessage(
          tid,
          content.messageId as string,
          textPayload(transformText((content.text as string) || (content.markdown as string) || '')),
        );
        return;
      }

      if (content.operation === 'reaction' && content.messageId && content.emoji) {
        await adapter.addReaction(tid, content.messageId as string, content.emoji as string);
        return;
      }

      // Ask question card — render as Card with buttons
      if (content.type === 'ask_question' && content.questionId && content.options) {
        const questionId = content.questionId as string;
        const titleRaw = content.title as string;
        const questionRaw = content.question as string;
        if (!titleRaw) {
          log.error('ask_question missing required title — skipping delivery', { questionId });
          return;
        }
        const title = transformText(titleRaw);
        const question = transformText(questionRaw);
        const options: NormalizedOption[] = normalizeOptions(content.options as never);
        // Encode button id/value with the option index rather than the full
        // value. Telegram caps callback_data at 64 bytes, and long values
        // (e.g. ISO datetimes, URLs) push the JSON payload well past that.
        // The onAction handlers resolve the index back to the real value via
        // getAskQuestionRender(questionId).
        const askButtons = options.map((opt, idx) =>
          Button({ id: `ncq:${questionId}:${idx}`, label: opt.label, value: String(idx) }),
        );
        const askLayout = (content.layout as 'vertical' | 'horizontal' | 'auto' | undefined) ?? 'auto';
        const askRows = buildButtonRows(
          askButtons,
          options.map((o) => o.label),
          askLayout,
        );
        const card = Card({
          title,
          children: [CardText(question), ...askRows],
        });
        const result = await adapter.postMessage(tid, {
          card,
          fallbackText: `${title}\n\n${question}\nOptions: ${options.map((o) => o.label).join(', ')}`,
        });
        return result?.id;
      }

      // Display-only card (send_card tool — non-blocking, no buttons required).
      // Unlike ask_question there is no host-side pending state: `actions` with
      // a `value` render as callback buttons whose clicks are routed back into
      // the session as a synthetic inbound message (see the nccard: branches in
      // chat.onAction and handleForwardedEvent). `actions` with a `url` render
      // as link buttons.
      if (content.type === 'card' && content.card) {
        const cardData = content.card as Record<string, unknown>;
        const title = transformText((cardData.title as string) || '');
        const description = transformText((cardData.description as string) || '');
        const children: Array<ReturnType<typeof CardText | typeof Actions>> = [];
        if (description) children.push(CardText(description));

        // Render structured children (sections/text). The agent emits a
        // tree like: card.children = [{type:'section', title, children:[
        //   {type:'text', text:'...'}]}]. We flatten this to a sequence of
        // CardText elements: section title (bold, prefixed with ▸) + body.
        // Without this, complex multi-section cards arrive at Telegram as
        // just the top-level title+description and all the actual content
        // is dropped silently.
        const cardChildren = cardData.children as Array<Record<string, unknown>> | undefined;
        if (Array.isArray(cardChildren)) {
          // A render-output között automatikus üres sort szúrunk be a section-ök
          // közé, hogy mindig tagolt legyen — Tomi 3× kérte, az LLM CLAUDE.md
          // utasítást felülbírálta. Ez render-szintű biztosíték (a card-payload
          // tartalmától független).
          let firstNode = true;
          for (const node of cardChildren) {
            if (!node || typeof node !== 'object') continue;
            const t = node.type as string | undefined;
            // Üres sor a section-ök közé (de NEM az első előtt)
            if (!firstNode && t === 'section') {
              children.push(CardText(' ')); // non-breaking space → vizuális tagolás
            }
            if (t === 'text' && typeof node.text === 'string') {
              children.push(CardText(transformText(node.text)));
            } else if (t === 'section') {
              const secTitle = (node.title as string) || '';
              if (secTitle) children.push(CardText(transformText(`*${secTitle}*`)));
              const secChildren = node.children as Array<Record<string, unknown>> | undefined;
              if (Array.isArray(secChildren)) {
                for (const sub of secChildren) {
                  if (sub?.type === 'text' && typeof sub.text === 'string') {
                    children.push(CardText(transformText(sub.text)));
                  }
                }
              }
            }
            firstNode = false;
          }
        }

        const actionsData = cardData.actions as Array<Record<string, unknown>> | undefined;
        if (actionsData && actionsData.length > 0) {
          const cardButtons = actionsData.map((a, idx) =>
            Button({
              id: `nccard:${Date.now()}:${idx}`,
              label: (a.label as string) || `Option ${idx + 1}`,
              value: (a.value as string) || (a.label as string) || String(idx),
              ...(a.url ? { url: a.url as string } : {}),
            }),
          );
          const cardLayout = (cardData.layout as 'vertical' | 'horizontal' | 'auto' | undefined) ?? 'auto';
          const cardRows = buildButtonRows(
            cardButtons,
            actionsData.map((a) => (a.label as string) || ''),
            cardLayout,
          );
          children.push(...cardRows);
        }
        if (children.length === 0 && !title) {
          log.warn('send_card payload empty, skipping delivery');
          return;
        }
        const card = Card({ title: title || 'ℹ️ Info', children: children as never });
        const fallback =
          (content.fallbackText as string) || [title, description].filter(Boolean).join('\n\n') || 'Card';
        const result = await adapter.postMessage(tid, { card, fallbackText: fallback });
        return result?.id;
      }

      // Normal message
      const rawText = (content.markdown as string) || (content.text as string);
      const text = rawText ? transformText(rawText) : rawText;
      if (text) {
        // Attach files if present (FileUpload format: { data, filename })
        const fileUploads = message.files?.map((f: { data: Buffer; filename: string }) => ({
          data: f.data,
          filename: f.filename,
        }));
        // Split if over the adapter's max length. Files ride on the first
        // chunk so the head of the reply still carries them. Use textPayload
        // so sendAsRaw bypasses adapter Markdown round-trips for chunks too.
        const chunks =
          config.maxTextLength && text.length > config.maxTextLength
            ? splitForLimit(text, config.maxTextLength)
            : [text];
        let firstId: string | undefined;
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const attachFiles = i === 0 && fileUploads && fileUploads.length > 0;
          const result = await postMaybeRaw(
            tid,
            attachFiles ? { ...textPayload(chunk), files: fileUploads } : textPayload(chunk),
          );
          if (i === 0) firstId = result?.id;
        }
        return firstId;
      } else if (message.files && message.files.length > 0) {
        // Files only, no text
        const fileUploads = message.files.map((f: { data: Buffer; filename: string }) => ({
          data: f.data,
          filename: f.filename,
        }));
        const result = await adapter.postMessage(tid, { ...textPayload(''), files: fileUploads });
        return result?.id;
      }
    },

    async setTyping(platformId: string, threadId: string | null) {
      const tid = threadId ?? platformId;
      await adapter.startTyping(tid);
    },

    async teardown() {
      gatewayAbort?.abort();
      await chat.shutdown();
      log.info('Chat SDK bridge shut down', { adapter: adapter.name });
    },

    isConnected() {
      return true;
    },

    async subscribe(_platformId: string, threadId: string) {
      // Chat SDK's subscription state lives on the StateAdapter (not on the
      // Chat instance itself). SqliteStateAdapter.subscribe is idempotent —
      // a second call on an already-subscribed thread is a no-op. threadId
      // is the SDK's thread id, which is what the router already has from
      // the original inbound event.
      await state.subscribe(threadId);
    },
  };

  // Only expose openDM when the underlying Chat SDK adapter implements it.
  // Delegate straight to adapter.openDM rather than going through chat.openDM:
  // the latter dispatches via inferAdapterFromUserId, which only recognizes
  // Discord snowflakes, Slack U-ids, Teams 29:-ids, and gChat users/-ids, and
  // throws for everything else (Telegram numeric ids, iMessage, Matrix, …).
  // Calling adapter.openDM directly also preserves the adapter's native
  // platform_id encoding via channelIdFromThreadId (e.g. "telegram:<chatId>"),
  // which matches what onInbound stores in messaging_groups — avoiding a
  // duplicate-row / decode-error cascade at delivery time. See user-dm.ts for
  // the direct-addressable fallback when the adapter has no openDM at all.
  if (adapter.openDM) {
    bridge.openDM = async (userHandle: string): Promise<string> => {
      const threadId = await adapter.openDM!(userHandle);
      return adapter.channelIdFromThreadId(threadId);
    };
  }

  return bridge;
}

/**
 * Start a local HTTP server to receive forwarded Gateway events.
 * This is needed because the Gateway listener in webhook-forwarding mode
 * sends ALL raw events (including INTERACTION_CREATE for button clicks)
 * to the webhookUrl, which we handle here.
 */
function startLocalWebhookServer(
  adapter: GatewayAdapter,
  setupConfig: ChannelSetup,
  botToken?: string,
): Promise<string> {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        handleForwardedEvent(body, adapter, setupConfig, botToken)
          .then(() => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end('{"ok":true}');
          })
          .catch((err) => {
            log.error('Webhook server error', { err });
            res.writeHead(500);
            res.end('{"error":"internal"}');
          });
      });
    });

    server.listen(0, '127.0.0.1', () => {
      const addr = server.address() as { port: number };
      const url = `http://127.0.0.1:${addr.port}/webhook`;
      log.info('Local webhook server started', { port: addr.port });
      resolve(url);
    });
  });
}

async function handleForwardedEvent(
  body: string,
  adapter: GatewayAdapter,
  setupConfig: ChannelSetup,
  botToken?: string,
): Promise<void> {
  let event: { type: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return;
  }

  // Handle interaction events (button clicks) — not handled by adapter's handleForwardedGatewayEvent
  if (event.type === 'GATEWAY_INTERACTION_CREATE' && event.data) {
    const interaction = event.data;
    // type 3 = MessageComponent (button/select)
    if (interaction.type === 3) {
      const customId = (interaction.data as Record<string, unknown>)?.custom_id as string;
      // In guilds the clicker is at interaction.member.user; in DMs it's interaction.user directly.
      const user =
        ((interaction.member as Record<string, unknown>)?.user as Record<string, string> | undefined) ??
        (interaction.user as Record<string, string> | undefined);
      const interactionId = interaction.id as string;
      const interactionToken = interaction.token as string;

      // ask_user_question (ncq:*) — pending_questions row drives the response.
      // send_card (nccard:*) — no host state, click is routed back as synthetic
      //   inbound so the agent that emitted the card can act on the value.
      const isNcq = customId?.startsWith('ncq:');
      const isNccard = customId?.startsWith('nccard:');

      if (!isNcq && !isNccard) return;

      // Parse the selected option from custom_id (ncq path only — nccard's
      // value comes from interaction.data.values or the button label).
      let questionId: string | undefined;
      let tail: string | undefined;
      if (isNcq) {
        const colonIdx = customId.indexOf(':', 4); // after "ncq:"
        if (colonIdx !== -1) {
          questionId = customId.slice(4, colonIdx);
          tail = customId.slice(colonIdx + 1);
        }
      }

      // Update the card to show the selected answer and remove buttons
      const originalEmbeds =
        ((interaction.message as Record<string, unknown>)?.embeds as Array<Record<string, unknown>>) || [];
      const originalDescription = (originalEmbeds[0]?.description as string) || '';
      const render = questionId ? getAskQuestionRender(questionId) : undefined;
      // Discord custom_id mirrors the new index-based encoding (see Button
      // construction). Decode back to the real option value for downstream.
      const selectedOption = isNcq ? resolveSelectedOption(render, tail, tail) : undefined;
      const cardTitle = render?.title ?? ((originalEmbeds[0]?.title as string) || '❓ Question');
      const matchedOpt = render?.options.find((o) => o.value === selectedOption);
      // For nccard the click value comes from the button's `value` mapped to
      // interaction.data.custom_id tail (Discord stores the button's
      // `custom_id` directly without a separate value field — the bridge
      // encodes the index in the customId, so for now we fall back to the
      // raw custom_id tail as the value).
      const nccardValue = isNccard ? customId.split(':').slice(2).join(':') : '';
      const selectedLabel = matchedOpt?.selectedLabel ?? selectedOption ?? nccardValue ?? customId;
      try {
        await fetch(`https://discord.com/api/v10/interactions/${interactionId}/${interactionToken}/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 7, // UPDATE_MESSAGE — acknowledge + update in one call
            data: {
              embeds: [
                {
                  title: cardTitle,
                  description: `${originalDescription}\n\n${selectedLabel}`,
                },
              ],
              components: [], // remove buttons
            },
          }),
        });
      } catch (err) {
        log.error('Failed to update interaction', { err });
      }

      // Dispatch to host
      if (isNcq && questionId && selectedOption) {
        setupConfig.onAction(questionId, selectedOption, user?.id || '');
      } else if (isNccard && nccardValue) {
        // Route the button click as a synthetic inbound text message — same
        // pattern as the Telegram chat.onAction nccard branch above.
        const channelId = (interaction.channel_id as string) || '';
        const userId = user?.id || '';
        const senderName = (user?.global_name as string) || (user?.username as string) || userId;
        const synthId = `nccard-action-${Date.now()}`;
        const syntheticInbound: InboundMessage = {
          id: synthId,
          kind: 'chat-sdk',
          content: {
            id: synthId,
            text: nccardValue,
            senderId: userId,
            sender: senderName,
            senderName,
          },
          timestamp: new Date().toISOString(),
          isMention: true,
          isGroup: false,
        };
        try {
          await setupConfig.onInbound(channelId, channelId, syntheticInbound);
        } catch (err) {
          log.error('Failed to route Discord nccard click as inbound', { err });
        }
      }
      return;
    }
  }

  // Forward other events to the adapter's webhook handler for normal processing
  const fakeRequest = new Request('http://localhost/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-discord-gateway-token': botToken || '',
    },
    body,
  });
  await adapter.handleWebhook(fakeRequest, {});
}
