import { describe, it, expect, beforeEach } from 'bun:test';
import {
  setCurrentInReplyTo,
  clearCurrentInReplyTo,
  outboundContentKey,
  recordOutboundContent,
  wasOutboundContentSent,
} from './current-batch.js';

const body = (text: string) => JSON.stringify({ text });

describe('turn-scoped outbound dedup', () => {
  beforeEach(() => clearCurrentInReplyTo());

  it('flags content already recorded this batch', () => {
    const key = outboundContentKey('telegram', '123', body('hi'));
    expect(wasOutboundContentSent(key)).toBe(false);
    recordOutboundContent(key);
    expect(wasOutboundContentSent(key)).toBe(true);
  });

  it('keys by channel+platform+content — same text to a different destination is not collapsed', () => {
    const a = outboundContentKey('telegram', '111', body('report'));
    const b = outboundContentKey('telegram', '222', body('report'));
    recordOutboundContent(a);
    expect(wasOutboundContentSent(a)).toBe(true);
    expect(wasOutboundContentSent(b)).toBe(false);
  });

  it('does not collapse different text to the same destination', () => {
    const a = outboundContentKey('telegram', '111', body('first'));
    const b = outboundContentKey('telegram', '111', body('second'));
    recordOutboundContent(a);
    expect(wasOutboundContentSent(b)).toBe(false);
  });

  it('resets scope on a new batch (setCurrentInReplyTo)', () => {
    const key = outboundContentKey('telegram', '123', body('hi'));
    recordOutboundContent(key);
    expect(wasOutboundContentSent(key)).toBe(true);
    setCurrentInReplyTo('next-batch');
    expect(wasOutboundContentSent(key)).toBe(false);
  });

  it('resets scope on clear', () => {
    const key = outboundContentKey('agent', 'grp', body('x'));
    setCurrentInReplyTo('batch-a');
    recordOutboundContent(key);
    expect(wasOutboundContentSent(key)).toBe(true);
    clearCurrentInReplyTo();
    expect(wasOutboundContentSent(key)).toBe(false);
  });
});
