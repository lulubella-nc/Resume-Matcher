import React from 'react';
import { MapPin } from 'lucide-react';
import type {
  ResumeData,
  ResumeSectionHeadings,
  ResumeFallbackLabels,
  SectionMeta,
} from '@/components/dashboard/resume-component';
import { getSortedSections, getSectionMeta } from '@/lib/utils/section-helpers';
import { formatDateRange } from '@/lib/utils';
import { isPhotoValue } from '@/lib/utils/image';
import { cleanItems } from './resume-vivid';
import { DescriptionList } from './description-list';
import { condensedLine, splitCondensed } from './earlier-experience';
import { RESUME_SECTION, RESUME_SECTION_TITLE, resumeItem } from './page-break-attrs';
import baseStyles from './styles/_base.module.css';
import styles from './styles/editorial.module.css';

export type EditorialPhotoShape = 'circle' | 'square';

interface ResumeEditorialProps {
  earlierExperienceLabel?: string;
  data: ResumeData;
  showPhoto?: boolean;
  photoShape?: EditorialPhotoShape;
  sectionHeadings?: Partial<ResumeSectionHeadings>;
  fallbackLabels?: Partial<ResumeFallbackLabels>;
}

/** First character of the name, used when the resume has no photo. */
function monogramOf(name?: string): string {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return '';
  return Array.from(trimmed)[0].toUpperCase();
}

const linkHref = (label: Exclude<ContactKey, 'address'>, value: string) => {
  if (label === 'email') return `mailto:${value}`;
  if (label === 'phone') return `tel:${value}`;
  return value.startsWith('http') || value.startsWith('//') ? value : `https://${value}`;
};

type ContactKey = 'address' | 'phone' | 'email' | 'website' | 'linkedin' | 'github';

interface ContactRow {
  label: string;
  value: string;
  href?: string;
  text?: string;
}

const linkText = (value: string) =>
  value
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');

/** Split a one-field education description into bullet lines. */
const descriptionLines = (text?: string | null): string[] =>
  (text ?? '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[•·▪*–-]\s*/, '').trim())
    .filter(Boolean);

/**
 * Editorial Resume Template
 *
 * The reference design translated into a data-driven template: a narrow rail with
 * a round portrait, a labelled contact block ("Details") and a plain skills list,
 * beside a wide story column that opens with the name and runs profile →
 * experience → projects → education → certifications.
 *
 * Everything comes from ResumeData, so an uploaded resume renders here as-is and
 * every string stays editable in the builder. Skills print as their names only:
 * the reference shows a dot scale, but a scale would mean inventing a proficiency
 * the user never stated, so the rail stays a plain list.
 *
 * ATS notes: the story column is DOM-first, the photo is decorative (alt=""),
 * headings are real <h3>/<h4> text, and no symbol is drawn with characters, so no
 * parser reads invented glyphs.
 */
export const ResumeEditorial: React.FC<ResumeEditorialProps> = ({
  data,
  showPhoto = true,
  photoShape = 'circle',
  sectionHeadings,
  fallbackLabels,
  earlierExperienceLabel,
}) => {
  const { personalInfo, summary, workExperience, education, personalProjects, additional } = data;

  const technicalSkills = cleanItems(additional?.technicalSkills);
  const languages = cleanItems(additional?.languages);
  const certifications = cleanItems(additional?.certificationsTraining);
  const awards = cleanItems(additional?.awards);

  const sortedSections = getSortedSections(data);
  const allSections = getSectionMeta(data);

  const headingFallbacks: ResumeSectionHeadings = {
    summary: sectionHeadings?.summary ?? 'Summary',
    experience: sectionHeadings?.experience ?? 'Experience',
    education: sectionHeadings?.education ?? 'Education',
    projects: sectionHeadings?.projects ?? 'Projects',
    certifications: sectionHeadings?.certifications ?? 'Training & Certifications',
    skills: sectionHeadings?.skills ?? 'Skills',
    languages: sectionHeadings?.languages ?? 'Languages',
    awards: sectionHeadings?.awards ?? 'Awards',
    links: sectionHeadings?.links ?? 'Links',
  };

  const getSectionDisplayName = (sectionKey: string, fallback: string): string =>
    sortedSections.find((section) => section.key === sectionKey)?.displayName || fallback;

  const isSectionVisible = (sectionKey: string): boolean =>
    allSections.find((section) => section.key === sectionKey)?.isVisible ?? true;

  const displayName = personalInfo?.name || fallbackLabels?.name || 'Your Name';
  const photoValue = personalInfo?.photo;
  const photo = showPhoto && isPhotoValue(photoValue) ? photoValue : null;
  const monogram = photo ? '' : monogramOf(personalInfo?.name);

  const contactSource: { key: ContactKey; label: string; value?: string }[] = [
    { key: 'address', label: fallbackLabels?.address ?? 'Address', value: personalInfo?.location },
    { key: 'phone', label: fallbackLabels?.phone ?? 'Phone', value: personalInfo?.phone },
    { key: 'email', label: fallbackLabels?.email ?? 'Email', value: personalInfo?.email },
    { key: 'website', label: fallbackLabels?.website ?? 'Website', value: personalInfo?.website },
    {
      key: 'linkedin',
      label: fallbackLabels?.linkedin ?? 'LinkedIn',
      value: personalInfo?.linkedin,
    },
    { key: 'github', label: fallbackLabels?.github ?? 'GitHub', value: personalInfo?.github },
  ];
  const contactRows: ContactRow[] = [];
  for (const row of contactSource) {
    const value = row.value?.trim();
    if (!value) continue;
    if (row.key === 'address') {
      contactRows.push({ label: row.label, value });
      continue;
    }
    contactRows.push({
      label: row.label,
      value,
      href: linkHref(row.key, value),
      text: row.key === 'email' || row.key === 'phone' ? value : linkText(value),
    });
  }

  const condensed = workExperience ? splitCondensed(workExperience) : { full: [], condensed: [] };

  const renderCustomSection = (section: SectionMeta) => {
    const custom = data.customSections?.[section.key];
    if (!custom) return null;

    if (section.sectionType === 'text' && custom.text?.trim()) {
      return (
        <div key={section.id} {...RESUME_SECTION}>
          <h3 {...RESUME_SECTION_TITLE} className={styles.title}>
            {section.displayName}
          </h3>
          <p className={styles.body}>{custom.text}</p>
        </div>
      );
    }

    if (section.sectionType === 'stringList' && custom.strings?.length) {
      return (
        <div key={section.id} {...RESUME_SECTION}>
          <h3 {...RESUME_SECTION_TITLE} className={styles.title}>
            {section.displayName}
          </h3>
          <ul className={styles.plainList}>
            {cleanItems(custom.strings).map((line, index) => (
              <li key={index} className={styles.plainItem}>
                <span className={styles.bullet} aria-hidden="true">
                  •
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (section.sectionType === 'itemList' && custom.items?.length) {
      return (
        <div key={section.id} {...RESUME_SECTION}>
          <h3 {...RESUME_SECTION_TITLE} className={styles.title}>
            {section.displayName}
          </h3>
          <div className={styles.entryStack}>
            {custom.items.map((item) => (
              <div key={item.id} {...resumeItem(item.description)} className={styles.entry}>
                <h4 className={styles.entryTitle}>{item.title}</h4>
                {(item.years || item.location || item.subtitle) && (
                  <p className={styles.meta}>
                    {item.subtitle && <span>{item.subtitle}</span>}
                    {item.years && <span>{formatDateRange(item.years)}</span>}
                    {item.location && (
                      <span className={styles.metaLocation}>
                        <MapPin size={10} className={styles.metaIcon} aria-hidden="true" />
                        {item.location}
                      </span>
                    )}
                  </p>
                )}
                <DescriptionList
                  items={item.description}
                  styles={item.descriptionStyles}
                  textClassName={styles.body}
                  marker="•"
                  markerClassName={styles.bullet}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.grid}>
      {/* Story column - right */}
      <main className={styles.main}>
        <header className={`${baseStyles['resume-header']} ${styles.identity}`}>
          <h1 className={styles.name}>{displayName}</h1>
          {personalInfo?.title && <p className={styles.jobTitle}>{personalInfo.title}</p>}
        </header>

        {isSectionVisible('summary') && summary && (
          <div {...RESUME_SECTION}>
            <h3 {...RESUME_SECTION_TITLE} className={styles.title}>
              {getSectionDisplayName('summary', headingFallbacks.summary)}
            </h3>
            <p className={styles.body}>{summary}</p>
          </div>
        )}

        {isSectionVisible('workExperience') && workExperience && workExperience.length > 0 && (
          <div {...RESUME_SECTION}>
            <h3 {...RESUME_SECTION_TITLE} className={styles.title}>
              {getSectionDisplayName('workExperience', headingFallbacks.experience)}
            </h3>
            <div className={styles.entryStack}>
              {condensed.full.map((entry) => (
                <div key={entry.id} {...resumeItem(entry.description)} className={styles.entry}>
                  <h4 className={styles.entryTitle}>
                    {[entry.title, entry.company].filter(Boolean).join(', ')}
                  </h4>
                  {(entry.years || entry.location) && (
                    <p className={styles.meta}>
                      {entry.years && <span>{formatDateRange(entry.years)}</span>}
                      {entry.location && (
                        <span className={styles.metaLocation}>
                          <MapPin size={10} className={styles.metaIcon} aria-hidden="true" />
                          {entry.location}
                        </span>
                      )}
                    </p>
                  )}
                  <DescriptionList
                    items={entry.description}
                    styles={entry.descriptionStyles}
                    textClassName={styles.body}
                    marker="•"
                    markerClassName={styles.bullet}
                  />
                </div>
              ))}

              {condensed.condensed.length > 0 && (
                <div className={styles.condensed} data-earlier-experience="">
                  <p {...RESUME_SECTION_TITLE} className={styles.condensedLabel}>
                    {earlierExperienceLabel || 'Earlier experience'}
                  </p>
                  {condensed.condensed.map((entry) => (
                    <span key={entry.id} className={styles.condensedLine}>
                      {condensedLine(entry)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {isSectionVisible('personalProjects') &&
          personalProjects &&
          personalProjects.length > 0 && (
            <div {...RESUME_SECTION}>
              <h3 {...RESUME_SECTION_TITLE} className={styles.title}>
                {getSectionDisplayName('personalProjects', headingFallbacks.projects)}
              </h3>
              <div className={styles.entryStack}>
                {personalProjects.map((project) => {
                  const links = [project.github, project.website].filter(Boolean) as string[];
                  return (
                    <div
                      key={project.id}
                      {...resumeItem(project.description)}
                      className={styles.entry}
                    >
                      <h4 className={styles.entryTitle}>
                        {[project.name, project.role].filter(Boolean).join(' · ')}
                      </h4>
                      {(project.years || links.length > 0) && (
                        <p className={styles.meta}>
                          {project.years && <span>{formatDateRange(project.years)}</span>}
                          {links.map((link) => (
                            <a
                              key={link}
                              className={styles.link}
                              href={link.startsWith('http') ? link : `https://${link}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {linkText(link)}
                            </a>
                          ))}
                        </p>
                      )}
                      <DescriptionList
                        items={project.description}
                        styles={project.descriptionStyles}
                        textClassName={styles.body}
                        marker="•"
                        markerClassName={styles.bullet}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {isSectionVisible('education') && education && education.length > 0 && (
          <div {...RESUME_SECTION}>
            <h3 {...RESUME_SECTION_TITLE} className={styles.title}>
              {getSectionDisplayName('education', headingFallbacks.education)}
            </h3>
            <div className={styles.entryStack}>
              {education.map((item) => {
                const bullets = descriptionLines(item.description);
                return (
                  <div key={item.id} {...resumeItem(bullets)} className={styles.entry}>
                    <h4 className={styles.entryTitle}>
                      {[item.institution, item.degree].filter(Boolean).join(', ')}
                    </h4>
                    {item.years && (
                      <p className={styles.meta}>
                        <span>{formatDateRange(item.years)}</span>
                      </p>
                    )}
                    <DescriptionList
                      items={bullets}
                      textClassName={styles.body}
                      marker="•"
                      markerClassName={styles.bullet}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isSectionVisible('additional') && certifications.length > 0 && (
          <div {...RESUME_SECTION}>
            <h3 {...RESUME_SECTION_TITLE} className={styles.title}>
              {headingFallbacks.certifications}
            </h3>
            <ul className={styles.plainList}>
              {certifications.map((item, index) => (
                <li key={index} className={styles.plainItem}>
                  <span className={styles.bullet} aria-hidden="true">
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isSectionVisible('additional') && awards.length > 0 && (
          <div {...RESUME_SECTION}>
            <h3 {...RESUME_SECTION_TITLE} className={styles.title}>
              {headingFallbacks.awards}
            </h3>
            <ul className={styles.plainList}>
              {awards.map((item, index) => (
                <li key={index} className={styles.plainItem}>
                  <span className={styles.bullet} aria-hidden="true">
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {sortedSections.filter((section) => !section.isDefault).map(renderCustomSection)}
      </main>

      {/* Narrow rail - left */}
      <aside className={styles.rail}>
        {(photo || monogram) && (
          <div className={styles.portrait}>
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- a data URL has nothing to optimise
              <img
                src={photo}
                alt=""
                className={styles.photo}
                data-photo-shape={photoShape}
                decoding="async"
              />
            ) : (
              <div className={styles.monogram} data-photo-shape={photoShape} aria-hidden="true">
                {monogram}
              </div>
            )}
          </div>
        )}

        {contactRows.length > 0 && (
          <div {...RESUME_SECTION}>
            <h3 {...RESUME_SECTION_TITLE} className={styles.title}>
              {fallbackLabels?.details ?? 'Details'}
            </h3>
            <div className={styles.contactList}>
              {contactRows.map((row) => (
                <div key={row.label} className={styles.contact}>
                  <span className={styles.contactLabel}>{row.label}</span>
                  {row.href ? (
                    <a
                      className={styles.contactValue}
                      href={row.href}
                      // mailto:/tel: stay in the same tab; only web links open a new one.
                      {...(row.href.startsWith('http')
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      {row.text}
                    </a>
                  ) : (
                    <span className={styles.contactValue}>{row.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isSectionVisible('additional') && technicalSkills.length > 0 && (
          <div {...RESUME_SECTION}>
            <h3 {...RESUME_SECTION_TITLE} className={styles.title}>
              {headingFallbacks.skills}
            </h3>
            <div className={styles.skillList}>
              {technicalSkills.map((skill, index) => (
                <p key={`${skill}-${index}`} className={styles.skillName}>
                  {skill}
                </p>
              ))}
            </div>
          </div>
        )}

        {isSectionVisible('additional') && languages.length > 0 && (
          <div {...RESUME_SECTION}>
            <h3 {...RESUME_SECTION_TITLE} className={styles.title}>
              {headingFallbacks.languages}
            </h3>
            <p className={styles.railText}>{languages.join(' · ')}</p>
          </div>
        )}
      </aside>
    </div>
  );
};

export default ResumeEditorial;
