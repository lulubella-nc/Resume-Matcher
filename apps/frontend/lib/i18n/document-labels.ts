/**
 * Labels printed *inside* the resume document: section headings, the contact block and
 * the additional-section captions.
 *
 * These used to be assembled by hand at every render site, which is how the on-screen
 * preview ended up with English contact labels while the PDF was translated: the
 * preview passed only `name` and every other label fell back to the template's English
 * default. One builder, used by every site, keeps the preview, browser print and PDF in
 * step with the language setting.
 */

/** Same shape as `useTranslations().t` and the server `t(key, params)` wrapper. */
export type DocumentTranslator = (
  key: string,
  params?: Record<string, string | number>
) => string;

/** Section headings; the templates fall back to these when the resume has no own name. */
export function documentSectionHeadings(t: DocumentTranslator) {
  return {
    summary: t('resume.sections.summary'),
    experience: t('resume.sections.experience'),
    education: t('resume.sections.education'),
    projects: t('resume.sections.projects'),
    certifications: t('resume.sections.certifications'),
    skills: t('resume.sections.skillsOnly'),
    languages: t('resume.sections.languages'),
    awards: t('resume.sections.awards'),
    links: t('resume.sections.links'),
    earlierExperience: t('resume.sections.earlierExperience'),
  };
}

/** Placeholder name plus the labelled contact block used by the photo templates. */
export function documentFallbackLabels(t: DocumentTranslator) {
  return {
    name: t('resume.defaults.name'),
    details: t('resume.contact.details'),
    address: t('resume.contact.address'),
    phone: t('resume.contact.phone'),
    email: t('resume.contact.email'),
    website: t('resume.contact.website'),
    linkedin: t('resume.contact.linkedin'),
    github: t('resume.contact.github'),
  };
}

/** Captions for the additional sections when the resume carries no section metadata. */
export function documentAdditionalLabels(t: DocumentTranslator) {
  return {
    technicalSkills: t('resume.additionalLabels.technicalSkills'),
    languages: t('resume.additionalLabels.languages'),
    certifications: t('resume.additionalLabels.certifications'),
    awards: t('resume.additionalLabels.awards'),
  };
}
