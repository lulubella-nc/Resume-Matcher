import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, ExternalLink } from 'lucide-react';
import type {
  ResumeData,
  ResumeSectionHeadings,
  ResumeFallbackLabels,
} from '@/components/dashboard/resume-component';
import { getSortedSections, getSectionMeta } from '@/lib/utils/section-helpers';
import { formatDateRange } from '@/lib/utils';
import { isPhotoValue } from '@/lib/utils/image';
import { DynamicResumeSectionVivid, cleanItems } from './resume-vivid';
import { DescriptionList } from './description-list';
import { EarlierExperience, splitCondensed } from './earlier-experience';
import { RESUME_SECTION, RESUME_SECTION_TITLE, resumeItem } from './page-break-attrs';
import baseStyles from './styles/_base.module.css';
import styles from './styles/photo-sidebar.module.css';

export type PhotoShape = 'circle' | 'square';

interface ResumePhotoSidebarProps {
  earlierExperienceLabel?: string;
  data: ResumeData;
  showContactIcons?: boolean;
  showPhoto?: boolean;
  photoShape?: PhotoShape;
  sectionHeadings?: Partial<ResumeSectionHeadings>;
  fallbackLabels?: Partial<ResumeFallbackLabels>;
}

const contactIcons: Record<string, React.ReactNode> = {
  Email: <Mail size={11} />,
  Phone: <Phone size={11} />,
  Location: <MapPin size={11} />,
  Website: <Globe size={11} />,
  LinkedIn: <Linkedin size={11} />,
  GitHub: <Github size={11} />,
};

/** First character of the name, used when the resume has no photo. */
function monogramOf(name?: string): string {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return '';
  const first = Array.from(trimmed)[0];
  return first.toUpperCase();
}

const renderContact = (
  showContactIcons: boolean,
  label: string,
  value?: string,
  hrefPrefix: string = ''
) => {
  if (!value) return null;

  let finalHrefPrefix = hrefPrefix;
  if (
    ['Website', 'LinkedIn', 'GitHub'].includes(label) &&
    !value.startsWith('http') &&
    !value.startsWith('//')
  ) {
    finalHrefPrefix = 'https://';
  }

  const href = finalHrefPrefix + value;
  const isLink =
    finalHrefPrefix.startsWith('http') ||
    finalHrefPrefix.startsWith('mailto:') ||
    finalHrefPrefix.startsWith('tel:');

  let displayText = value;
  if (isLink && (label === 'LinkedIn' || label === 'GitHub' || label === 'Website')) {
    displayText = value.replace(/^https?:\/\//, '').replace(/^www\./, '');
  }

  return (
    <div className={styles.contactRow}>
      {showContactIcons && <span className={styles.contactIcon}>{contactIcons[label]}</span>}
      {isLink ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={styles.contactValue}>
          {displayText}
        </a>
      ) : (
        <span className={styles.contactValue}>{displayText}</span>
      )}
    </div>
  );
};

/**
 * Photo Sidebar Resume Template
 *
 * A solid accent rail on the left (photo, name, contact, skills, languages,
 * education, awards) next to a white main column (summary, experience, projects,
 * certifications, custom sections). Reads the accent-color, photo-shape and
 * photo-size controls. ATS-safe: every string is a real DOM node in reading order,
 * the rail is DOM-first, and the photo is decorative alt="" so no parser sees
 * invented text.
 */
export const ResumePhotoSidebar: React.FC<ResumePhotoSidebarProps> = ({
  data,
  showContactIcons = false,
  showPhoto = true,
  photoShape = 'circle',
  sectionHeadings,
  fallbackLabels,
  earlierExperienceLabel,
}) => {
  const { personalInfo, summary, workExperience, education, personalProjects, additional } = data;

  const technicalSkills = cleanItems(additional?.technicalSkills);
  const languages = cleanItems(additional?.languages);
  const certificationsTraining = cleanItems(additional?.certificationsTraining);
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

  const getSectionDisplayName = (sectionKey: string, fallback: string): string => {
    const section = sortedSections.find((s) => s.key === sectionKey);
    return section?.displayName || fallback;
  };

  const isSectionVisible = (sectionKey: string): boolean => {
    const section = allSections.find((s) => s.key === sectionKey);
    return section?.isVisible ?? true;
  };

  const customSections = sortedSections.filter((s) => !s.isDefault);

  const displayName = personalInfo?.name || fallbackLabels?.name || 'Your Name';
  const photo = showPhoto && isPhotoValue(personalInfo?.photo) ? personalInfo?.photo : null;
  // The monogram stands in for a missing photo, so it only exists when a name does.
  const monogram = photo ? '' : monogramOf(personalInfo?.name);

  const contactRows = personalInfo ? (
    <div className={styles.contactList}>
      {renderContact(showContactIcons, 'Email', personalInfo.email, 'mailto:')}
      {renderContact(showContactIcons, 'Phone', personalInfo.phone, 'tel:')}
      {renderContact(showContactIcons, 'Location', personalInfo.location)}
      {renderContact(showContactIcons, 'Website', personalInfo.website)}
      {renderContact(showContactIcons, 'LinkedIn', personalInfo.linkedin)}
      {renderContact(showContactIcons, 'GitHub', personalInfo.github)}
    </div>
  ) : null;

  return (
    <div className={styles.grid}>
      {/* Main column - left */}
      <main className={styles.mainColumn}>
        <header className={`${baseStyles['resume-header']} ${styles.identity}`}>
          <h1 className={styles.name}>{displayName}</h1>
          {personalInfo?.title && <p className={styles.jobTitle}>{personalInfo.title}</p>}
          {contactRows}
        </header>

        {isSectionVisible('summary') && summary && (
          <div {...RESUME_SECTION}>
            <h3 {...RESUME_SECTION_TITLE} className={styles.mainTitle}>
              {getSectionDisplayName('summary', headingFallbacks.summary)}
            </h3>
            <p className={`text-justify ${baseStyles['resume-text-sm']}`}>{summary}</p>
          </div>
        )}

        {isSectionVisible('workExperience') && workExperience && workExperience.length > 0 && (
          <div {...RESUME_SECTION}>
            <h3 {...RESUME_SECTION_TITLE} className={styles.mainTitle}>
              {getSectionDisplayName('workExperience', headingFallbacks.experience)}
            </h3>
            <div className={baseStyles['resume-items']}>
              {splitCondensed(workExperience).full.map((exp) => (
                <div
                  key={exp.id}
                  {...resumeItem(exp.description)}
                  className={baseStyles['resume-item']}
                >
                  <div className={styles.entryRow}>
                    <h4 className={styles.entryTitle}>{exp.title}</h4>
                    {exp.years && (
                      <span className={styles.entryMeta}>{formatDateRange(exp.years)}</span>
                    )}
                  </div>
                  <p className={styles.entrySub}>
                    <span className={styles.entryRole}>{exp.company}</span>
                    {exp.location && <> • {exp.location}</>}
                  </p>
                  <DescriptionList
                    items={exp.description}
                    styles={exp.descriptionStyles}
                    textClassName={baseStyles['resume-text-xs']}
                    marker="▪"
                    markerClassName={`mr-1.5 flex-shrink-0 ${styles.bulletMarker}`}
                  />
                </div>
              ))}
              {splitCondensed(workExperience).condensed.length > 0 && (
                <EarlierExperience
                  items={splitCondensed(workExperience).condensed}
                  label={earlierExperienceLabel}
                />
              )}
            </div>
          </div>
        )}

        {isSectionVisible('personalProjects') &&
          personalProjects &&
          personalProjects.length > 0 && (
            <div {...RESUME_SECTION}>
              <h3 {...RESUME_SECTION_TITLE} className={styles.mainTitle}>
                {getSectionDisplayName('personalProjects', headingFallbacks.projects)}
              </h3>
              <div className={baseStyles['resume-items']}>
                {personalProjects.map((project) => (
                  <div
                    key={project.id}
                    {...resumeItem(project.description)}
                    className={baseStyles['resume-item']}
                  >
                    <div className={styles.entryRow}>
                      <span className="flex items-baseline gap-1.5 min-w-0 flex-wrap">
                        <h4 className={styles.entryTitle}>{project.name}</h4>
                        {project.role && <span className={styles.entryRole}>{project.role}</span>}
                        {project.github && (
                          <a
                            href={
                              project.github.startsWith('http')
                                ? project.github
                                : `https://${project.github}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className={baseStyles['resume-link-pill']}
                          >
                            <Github size={9} />
                            {project.github
                              .replace(/^https?:\/\//, '')
                              .replace(/^www\./, '')
                              .replace(/\/$/, '')}
                          </a>
                        )}
                        {project.website && (
                          <a
                            href={
                              project.website.startsWith('http')
                                ? project.website
                                : `https://${project.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className={baseStyles['resume-link-pill']}
                          >
                            <ExternalLink size={9} />
                            {project.website
                              .replace(/^https?:\/\//, '')
                              .replace(/^www\./, '')
                              .replace(/\/$/, '')}
                          </a>
                        )}
                      </span>
                      {project.years && (
                        <span className={styles.entryMeta}>{formatDateRange(project.years)}</span>
                      )}
                    </div>
                    <DescriptionList
                      items={project.description}
                      styles={project.descriptionStyles}
                      textClassName={baseStyles['resume-text-xs']}
                      marker="▪"
                      markerClassName={`mr-1.5 flex-shrink-0 ${styles.bulletMarker}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        {isSectionVisible('additional') && certificationsTraining.length > 0 && (
          <div {...RESUME_SECTION}>
            <h3 {...RESUME_SECTION_TITLE} className={styles.mainTitle}>
              {headingFallbacks.certifications}
            </h3>
            <ul className={`${baseStyles['resume-list']} ${baseStyles['resume-text-xs']}`}>
              {certificationsTraining.map((cert, index) => (
                <li key={index} className="flex">
                  <span className={`mr-1.5 flex-shrink-0 ${styles.bulletMarker}`}>▪&nbsp;</span>
                  <span>{cert}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {customSections.map((section) => (
          <DynamicResumeSectionVivid
            key={section.id}
            sectionMeta={section}
            resumeData={data}
            titleClassName={styles.mainTitle}
            roleClassName={styles.entryRole}
          />
        ))}
      </main>

      {/* Color rail - right */}
      <aside className={styles.sidebarColumn}>
        {(photo || monogram) && (
          <div className={styles.photoTop}>
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

        {isSectionVisible('additional') && technicalSkills.length > 0 && (
          <div {...RESUME_SECTION}>
            <h3 {...RESUME_SECTION_TITLE} className={styles.railTitle}>
              {headingFallbacks.skills}
            </h3>
            <div className={styles.chipList}>
              {technicalSkills.map((skill, index) => (
                <span key={index} className={styles.chip}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {isSectionVisible('additional') && languages.length > 0 && (
          <div {...RESUME_SECTION}>
            <h3 {...RESUME_SECTION_TITLE} className={styles.railTitle}>
              {headingFallbacks.languages}
            </h3>
            <p className={styles.railText}>{languages.join(' • ')}</p>
          </div>
        )}

        {isSectionVisible('education') && education && education.length > 0 && (
          <div {...RESUME_SECTION}>
            <h3 {...RESUME_SECTION_TITLE} className={styles.railTitle}>
              {getSectionDisplayName('education', headingFallbacks.education)}
            </h3>
            <div className={styles.railStack}>
              {education.map((edu) => (
                <div key={edu.id} {...resumeItem()} className={styles.railEntry}>
                  <h4 className={styles.railEntryTitle}>{edu.institution}</h4>
                  {edu.degree && <p className={styles.railText}>{edu.degree}</p>}
                  {edu.years && <p className={styles.railMuted}>{formatDateRange(edu.years)}</p>}
                  {edu.description && <p className={styles.railText}>{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {isSectionVisible('additional') && awards.length > 0 && (
          <div {...RESUME_SECTION}>
            <h3 {...RESUME_SECTION_TITLE} className={styles.railTitle}>
              {headingFallbacks.awards}
            </h3>
            <ul className={`${baseStyles['resume-list']} ${styles.railText}`}>
              {awards.map((award, index) => (
                <li key={index}>{award}</li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
};

export default ResumePhotoSidebar;
