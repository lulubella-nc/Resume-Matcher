import type { Locale } from '@/i18n/config';
import { getMessages } from './messages';
import { applyParams, getNestedValue } from './utils';

/**
 * Locale-pinned translator, usable on the server and in client components.
 *
 * `useTranslations().t` follows the **UI** language, which is the right source for
 * buttons and panels. Strings that are printed *into the document* (section headings,
 * the contact block, the caption of an additional section) must follow the **content**
 * language instead: a user who reads the app in English but writes resumes in Chinese
 * expects the PDF in Chinese. Those call sites use `makeTranslator(contentLanguage)`.
 */
export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const messages = getMessages(locale);
  const translation = getNestedValue(messages as unknown as Record<string, unknown>, key);
  return applyParams(translation, params);
}

/** Bind `translate` to one locale: `t('resume.sections.summary')`. */
export function makeTranslator(locale: Locale) {
  return (key: string, params?: Record<string, string | number>) =>
    translate(locale, key, params);
}
