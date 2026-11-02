import Resume, { ResumeData } from '@/components/dashboard/resume-component';
import {
  type TemplateType,
  type PageSize,
  type TemplateSettings,
  type SpacingLevel,
  type HeaderFontFamily,
  type BodyFontFamily,
  type AccentColor,
  type PhotoShape,
  type PhotoSizeLevel,
  ACCENT_COLOR_MAP,
  DEFAULT_TEMPLATE_SETTINGS,
  TEMPLATE_OPTIONS,
} from '@/lib/types/template-settings';
import { API_BASE } from '@/lib/api/client';
import { translate } from '@/lib/i18n/server';
import {
  documentAdditionalLabels,
  documentFallbackLabels,
  documentSectionHeadings,
} from '@/lib/i18n/document-labels';
import { resolveLocale } from '@/lib/i18n/locale';
import { withLocalizedDefaultSections } from '@/lib/utils/section-helpers';
import { runningHeaderCss } from '@/lib/print/running-header';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    template?: string;
    pageSize?: string;
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
    sectionSpacing?: string;
    itemSpacing?: string;
    lineHeight?: string;
    fontSize?: string;
    headerScale?: string;
    headerFont?: string;
    bodyFont?: string;
    compactMode?: string;
    showContactIcons?: string;
    accentColor?: string;
    showPhoto?: string;
    photoShape?: string;
    photoSize?: string;
    lang?: string;
    draft?: string;
  }>;
};

/**
 * Parse header font family
 */
function parseHeaderFont(value: string | undefined): HeaderFontFamily {
  if (value === 'serif' || value === 'sans-serif' || value === 'mono') {
    return value;
  }
  return DEFAULT_TEMPLATE_SETTINGS.fontSize.headerFont;
}

/**
 * Parse body font family
 */
function parseBodyFont(value: string | undefined): BodyFontFamily {
  if (value === 'serif' || value === 'sans-serif' || value === 'mono') {
    return value;
  }
  return DEFAULT_TEMPLATE_SETTINGS.fontSize.bodyFont;
}

/**
 * Parse accent color
 *
 * Membership is read from ACCENT_COLOR_MAP rather than a hand-written chain, so a new
 * swatch can never be accepted by the picker and then silently dropped by the PDF route.
 */
function parseAccentColor(value: string | undefined): AccentColor {
  if (value && Object.prototype.hasOwnProperty.call(ACCENT_COLOR_MAP, value)) {
    return value as AccentColor;
  }
  return DEFAULT_TEMPLATE_SETTINGS.accentColor;
}

/**
 * Parse photo shape
 */
function parsePhotoShape(value: string | undefined): PhotoShape {
  if (value === 'circle' || value === 'square') {
    return value;
  }
  return DEFAULT_TEMPLATE_SETTINGS.photoShape;
}

/**
 * Parse photo size level (1-3)
 */
function parsePhotoSize(value: string | undefined): PhotoSizeLevel {
  const parsed = parseInt(value ?? '', 10);
  if (parsed === 1 || parsed === 2 || parsed === 3) return parsed;
  return DEFAULT_TEMPLATE_SETTINGS.photoSize;
}

/**
 * Parse boolean from string
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return defaultValue;
}

async function fetchResumeData(id: string, draftToken?: string): Promise<ResumeData> {
  const url =
    draftToken && /^[a-f0-9]{32}$/.test(draftToken)
      ? `${API_BASE}/resumes/render-drafts/${draftToken}`
      : `${API_BASE}/resumes?resume_id=${encodeURIComponent(id)}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load resume (status ${res.status}).`);
  }
  const payload = (await res.json()) as {
    data: { processed_resume?: ResumeData; raw_resume?: { content?: string } };
  };
  if (payload.data.processed_resume) {
    return payload.data.processed_resume;
  }
  if (payload.data.raw_resume?.content) {
    try {
      return JSON.parse(payload.data.raw_resume.content) as ResumeData;
    } catch (error) {
      // Log error for debugging instead of silently failing
      // Note: Avoid logging content preview to prevent PII exposure
      console.error('Failed to parse resume JSON:', {
        resumeId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        contentLength: payload.data.raw_resume.content.length,
      });
      throw new Error('Failed to parse resume data. The resume content may be corrupted.');
    }
  }
  return {} as ResumeData;
}

/**
 * Parse spacing level from string, clamped to valid range 1-5
 */
function parseSpacingLevel(value: string | undefined, defaultValue: SpacingLevel): SpacingLevel {
  if (!value) return defaultValue;
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 1 || num > 5) return defaultValue;
  return num as SpacingLevel;
}

/**
 * Parse margin value from string, clamped to valid range 5-25
 */
function parseMargin(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const num = parseInt(value, 10);
  if (isNaN(num)) return defaultValue;
  return Math.max(5, Math.min(25, num));
}

/**
 * Validate template type
 */
const TEMPLATE_IDS: ReadonlySet<string> = new Set(
  TEMPLATE_OPTIONS.map((option) => option.id as string)
);

function parseTemplate(value: string | undefined): TemplateType {
  // Derived from TEMPLATE_OPTIONS so a newly registered template can never be
  // silently rejected here and fall back to swiss-single in the PDF.
  if (value && TEMPLATE_IDS.has(value)) return value as TemplateType;
  return 'swiss-single';
}

/**
 * Validate page size
 */
function parsePageSize(value: string | undefined): PageSize {
  if (value === 'A4' || value === 'LETTER') {
    return value;
  }
  return 'A4';
}

export default async function PrintResumePage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const draftToken = resolvedSearchParams?.draft;
  let resumeData: ResumeData;
  try {
    resumeData = await fetchResumeData(resolvedParams.id, draftToken);
  } catch (error) {
    // Render a marker the PDF renderer waits for, so a resume that cannot load
    // (an expired page-fit draft, an unreachable backend) fails fast instead
    // of timing out.
    console.error(draftToken ? 'Failed to load page-fit draft:' : 'Failed to load resume:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return draftToken ? (
      <div data-print-error="draft-unavailable">Draft unavailable</div>
    ) : (
      <div data-print-error="resume-unavailable">Resume unavailable</div>
    );
  }
  const locale = resolveLocale(resolvedSearchParams?.lang);
  const t = (key: string, params?: Record<string, string | number>) =>
    translate(locale, key, params);
  const localizedResumeData = withLocalizedDefaultSections(resumeData, t);
  const additionalSectionLabels = documentAdditionalLabels(t);
  const sectionHeadings = documentSectionHeadings(t);
  const fallbackLabels = documentFallbackLabels(t);

  // Parse template settings from query params
  const settings: TemplateSettings = {
    template: parseTemplate(resolvedSearchParams?.template),
    pageSize: parsePageSize(resolvedSearchParams?.pageSize),
    margins: {
      top: parseMargin(resolvedSearchParams?.marginTop, DEFAULT_TEMPLATE_SETTINGS.margins.top),
      bottom: parseMargin(
        resolvedSearchParams?.marginBottom,
        DEFAULT_TEMPLATE_SETTINGS.margins.bottom
      ),
      left: parseMargin(resolvedSearchParams?.marginLeft, DEFAULT_TEMPLATE_SETTINGS.margins.left),
      right: parseMargin(
        resolvedSearchParams?.marginRight,
        DEFAULT_TEMPLATE_SETTINGS.margins.right
      ),
    },
    spacing: {
      section: parseSpacingLevel(
        resolvedSearchParams?.sectionSpacing,
        DEFAULT_TEMPLATE_SETTINGS.spacing.section
      ),
      item: parseSpacingLevel(
        resolvedSearchParams?.itemSpacing,
        DEFAULT_TEMPLATE_SETTINGS.spacing.item
      ),
      lineHeight: parseSpacingLevel(
        resolvedSearchParams?.lineHeight,
        DEFAULT_TEMPLATE_SETTINGS.spacing.lineHeight
      ),
    },
    fontSize: {
      base: parseSpacingLevel(
        resolvedSearchParams?.fontSize,
        DEFAULT_TEMPLATE_SETTINGS.fontSize.base
      ),
      headerScale: parseSpacingLevel(
        resolvedSearchParams?.headerScale,
        DEFAULT_TEMPLATE_SETTINGS.fontSize.headerScale
      ),
      headerFont: parseHeaderFont(resolvedSearchParams?.headerFont),
      bodyFont: parseBodyFont(resolvedSearchParams?.bodyFont),
    },
    compactMode: parseBoolean(
      resolvedSearchParams?.compactMode,
      DEFAULT_TEMPLATE_SETTINGS.compactMode
    ),
    showContactIcons: parseBoolean(
      resolvedSearchParams?.showContactIcons,
      DEFAULT_TEMPLATE_SETTINGS.showContactIcons
    ),
    accentColor: parseAccentColor(resolvedSearchParams?.accentColor),
    showPhoto: parseBoolean(resolvedSearchParams?.showPhoto, DEFAULT_TEMPLATE_SETTINGS.showPhoto),
    photoShape: parsePhotoShape(resolvedSearchParams?.photoShape),
    photoSize: parsePhotoSize(resolvedSearchParams?.photoSize),
  };

  // Note: Margins are applied by Playwright's PDF renderer (not here)
  // This ensures margins appear on EVERY page, not just the first
  // The settings are passed to override CSS variables for spacing/fonts only
  const printSettings: TemplateSettings = {
    ...settings,
    // Zero out margins in CSS since Playwright handles them
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  };

  return (
    // `lang` also drives Chromium's own font fallback during PDF render, which
    // matters for the CJK faces (L-08).
    <div className="resume-print bg-white" lang={locale}>
      {/* "Name · 2 / 3" on pages 2+; the CSS string is fully escaped. */}
      <style
        dangerouslySetInnerHTML={{
          __html: runningHeaderCss(localizedResumeData.personalInfo?.name),
        }}
      />
      <Resume
        resumeData={localizedResumeData}
        template={settings.template}
        settings={printSettings}
        locale={locale}
        additionalSectionLabels={additionalSectionLabels}
        sectionHeadings={sectionHeadings}
        fallbackLabels={fallbackLabels}
      />
    </div>
  );
}
