import React from 'react';
import { Briefcase, GraduationCap, Quote, User } from 'lucide-react';
import type {
  ResumeData,
  ResumeFallbackLabels,
  ResumeSectionHeadings,
  SectionMeta,
} from '@/components/dashboard/resume-component';
import { getSectionMeta, getSortedSections } from '@/lib/utils/section-helpers';
import { formatDateRange } from '@/lib/utils';
import { isPhotoValue } from '@/lib/utils/image';
import { cleanItems } from './resume-vivid';
import { DescriptionList } from './description-list';
import { condensedLine, splitCondensed } from './earlier-experience';
import { RESUME_SECTION, RESUME_SECTION_TITLE, resumeItem } from './page-break-attrs';
import baseStyles from './styles/_base.module.css';
import type { ProfilePreset } from './profile-presets';
import styles from './styles/profile.module.css';

export interface ResumeProfileProps {
  preset: ProfilePreset;
  data: ResumeData;
  showPhoto?: boolean;
  photoShape?: 'circle' | 'square';
  sectionHeadings?: Partial<ResumeSectionHeadings>;
  fallbackLabels?: Partial<ResumeFallbackLabels>;
  earlierExperienceLabel?: string;
}

type ContactKey = 'address' | 'phone' | 'email' | 'website' | 'linkedin' | 'github';

const SECTION_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  summary: User,
  workExperience: Briefcase,
  education: GraduationCap,
};

const linkHref = (key: ContactKey, value: string) => {
  if (key === 'email') return `mailto:${value}`;
  if (key === 'phone') return `tel:${value}`;
  return value.startsWith('http') || value.startsWith('//') ? value : `https://${value}`;
};

const linkText = (value: string) =>
  value
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');

/**
 * Shared layout engine for the profile presets.
 *
 * Reads `preset` for every visual decision (layout, header, heading, skills, entry,
 * colours) so a new design is a preset, not a new component. Structure and reading
 * order stay identical across presets: the story column is DOM-first, the rail
 * second, headings are real `<h3>`s and the portrait is decorative (`alt=""`).
 */
export const ResumeProfile: React.FC<ResumeProfileProps> = ({
  preset,
  data,
  showPhoto = true,
  photoShape = 'circle',
  sectionHeadings,
  fallbackLabels,
  earlierExperienceLabel,
}) => {
  const { personalInfo, summary, workExperience, education, personalProjects, additional } = data;

  const skills = cleanItems(additional?.technicalSkills);
  const languages = cleanItems(additional?.languages);
  const certifications = cleanItems(additional?.certificationsTraining);
  const awards = cleanItems(additional?.awards);

  const condensed = workExperience ? splitCondensed(workExperience) : { full: [], condensed: [] };

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

  const sectionName = (key: string, fallback: string) =>
    sortedSections.find((section) => section.key === key)?.displayName || fallback;
  const visible = (key: string) =>
    allSections.find((section) => section.key === key)?.isVisible ?? true;

  const displayName = personalInfo?.name || fallbackLabels?.name || 'Your Name';
  const photoValue = personalInfo?.photo;
  const photo = preset.photo && showPhoto && isPhotoValue(photoValue) ? photoValue : null;

  const contactCandidates: { key: ContactKey; label: string; value: string }[] = [
    {
      key: 'address',
      label: fallbackLabels?.address ?? 'Address',
      value: personalInfo?.location ?? '',
    },
    { key: 'phone', label: fallbackLabels?.phone ?? 'Phone', value: personalInfo?.phone ?? '' },
    { key: 'email', label: fallbackLabels?.email ?? 'Email', value: personalInfo?.email ?? '' },
    {
      key: 'website',
      label: fallbackLabels?.website ?? 'Website',
      value: personalInfo?.website ?? '',
    },
    {
      key: 'linkedin',
      label: fallbackLabels?.linkedin ?? 'LinkedIn',
      value: personalInfo?.linkedin ?? '',
    },
    { key: 'github', label: fallbackLabels?.github ?? 'GitHub', value: personalInfo?.github ?? '' },
  ];
  const contactRows = contactCandidates.filter((row) => row.value.trim());

  /** `n` numbers the headings for the numbered preset, in render order. */
  let headingIndex = 0;

  const renderHeading = (label: string, icon?: string) => {
    const Icon = icon ? SECTION_ICONS[icon] : undefined;
    const number = String(++headingIndex).padStart(2, '0');

    if (preset.heading === 'chip') {
      return (
        <h3 {...RESUME_SECTION_TITLE} className={styles.headChip}>
          <span className={styles.chipLabel}>{label}</span>
        </h3>
      );
    }
    if (preset.heading === 'rule-label') {
      return (
        <h3 {...RESUME_SECTION_TITLE} className={styles.headRuleLabel}>
          {label}
        </h3>
      );
    }
    if (preset.heading === 'numbered') {
      return (
        <h3 {...RESUME_SECTION_TITLE} className={styles.headNumbered}>
          <span className={styles.headNumber}>{number}</span>
          <span>{label}</span>
        </h3>
      );
    }
    if (preset.heading === 'icon-rule') {
      return (
        <h3 {...RESUME_SECTION_TITLE} className={styles.headIcon}>
          {Icon ? <Icon size={13} className={styles.headIconGlyph} /> : null}
          <span>{label}</span>
        </h3>
      );
    }
    if (preset.heading === 'icon-plain' || preset.heading === 'icon-caps') {
      const caps = preset.heading === 'icon-caps';
      return (
        <h3 {...RESUME_SECTION_TITLE} className={caps ? styles.headIconCaps : styles.headIconPlain}>
          {Icon ? <Icon size={13} className={styles.headIconGlyph} /> : null}
          <span>{label}</span>
        </h3>
      );
    }
    if (preset.heading === 'underline') {
      return (
        <h3 {...RESUME_SECTION_TITLE} className={styles.headUnderline}>
          {label}
        </h3>
      );
    }
    if (preset.heading === 'display') {
      return (
        <h3 {...RESUME_SECTION_TITLE} className={styles.headDisplay}>
          {label}
        </h3>
      );
    }
    if (preset.heading === 'tracked-serif') {
      return (
        <h3 {...RESUME_SECTION_TITLE} className={styles.headTracked}>
          {label}
        </h3>
      );
    }
    return (
      <h3
        {...RESUME_SECTION_TITLE}
        className={preset.serifHeadings ? styles.headSerif : styles.headPlain}
      >
        {label}
      </h3>
    );
  };

  const renderContactLine = () => (
    <p className={styles.contactInline}>
      {contactRows.map((row, index) => (
        <span key={row.key}>
          {index > 0 && (
            <span className={styles.contactSep} aria-hidden="true">
              ·
            </span>
          )}
          {row.key === 'email' || row.key === 'phone' ? (
            <a href={linkHref(row.key, row.value)} className={styles.contactLink}>
              {row.value}
            </a>
          ) : (
            row.value
          )}
        </span>
      ))}
    </p>
  );

  const renderIdentityText = () => (
    <div className={styles.identityText}>
      <h1
        className={`${styles.name} ${preset.italicName ? styles.nameItalic : ''} ${
          preset.accentName ? styles.nameAccent : ''
        }`}
      >
        {displayName}
      </h1>
      {personalInfo?.title && <p className={styles.role}>{personalInfo.title}</p>}
      {preset.contact === 'inline' && contactRows.length > 0 && renderContactLine()}
    </div>
  );

  /* A `photo-panel` layout prints its portrait at the head of the rail column, so the
     identity area stays text-only there. */
  const identityPhoto = preset.layout === 'photo-panel' ? null : photo;

  const renderIdentity = () => (
    <header className={`${baseStyles['resume-header']} ${styles.identity}`}>
      {preset.header === 'boxed' ? (
        <div className={styles.nameBox}>{renderIdentityText()}</div>
      ) : (
        <>
          {identityPhoto ? (
            <img
              src={identityPhoto}
              alt=""
              className={styles.portrait}
              data-photo-shape={photoShape}
              style={{ borderRadius: photoShape === 'circle' ? '999px' : '0' }}
            />
          ) : null}
          {renderIdentityText()}
        </>
      )}
    </header>
  );

  const renderContactGrid = () => (
    <dl className={styles.contactGrid}>
      {contactRows.map((row) => (
        <React.Fragment key={row.key}>
          <dt className={styles.contactTerm}>{row.label}</dt>
          <dd className={styles.contactValue}>
            {row.key === 'email' || row.key === 'phone' ? (
              <a href={linkHref(row.key, row.value)} className={styles.contactLink}>
                {row.value}
              </a>
            ) : (
              row.value
            )}
          </dd>
        </React.Fragment>
      ))}
    </dl>
  );

  const renderContactStack = () => (
    <div className={styles.contactStack}>
      {preset.contact === 'grid'
        ? renderContactGrid()
        : contactRows.map((row) => (
            <div key={row.key} className={styles.contactRow}>
              <span className={styles.contactLabel}>{row.label}</span>
              {row.key === 'email' || row.key === 'phone' ? (
                <a href={linkHref(row.key, row.value)} className={styles.contactLink}>
                  {linkText(row.value)}
                </a>
              ) : (
                <span>{row.value}</span>
              )}
            </div>
          ))}
    </div>
  );

  const skillItemClass =
    preset.skills === 'bars'
      ? styles.skillBar
      : preset.skills === 'ruled'
        ? styles.skillRuled
        : preset.skills === 'rule-sep'
          ? styles.skillRuleSep
          : styles.skillItem;

  const renderSkillList = (twoCol?: boolean) => (
    <ul className={twoCol || preset.skills === 'two-col' ? styles.skillTwoCol : styles.skillList}>
      {skills.map((skill, index) => (
        <li key={`${skill}-${index}`} className={skillItemClass}>
          {skill}
        </li>
      ))}
    </ul>
  );

  const renderRailLabel = (children: React.ReactNode) => (
    <h3
      {...RESUME_SECTION_TITLE}
      className={preset.railLabelled ? styles.railLabel : styles.railLabelPlain}
    >
      {children}
    </h3>
  );

  const renderEntry = ({
    title,
    subtitle,
    years,
    location,
    description,
    descriptionStyles,
    id,
  }: {
    title?: string;
    subtitle?: string;
    years?: string;
    location?: string;
    description?: string[] | null;
    descriptionStyles?: unknown;
    id?: string | number;
  }) => {
    const head = [title, subtitle].filter(Boolean).join(', ');
    const titleClass = preset.titleBar
      ? `${styles.entryTitle} ${styles.entryTitleBar}`
      : styles.entryTitle;
    const meta = (
      <>
        {years && <span className={styles.dates}>{formatDateRange(years)}</span>}
        {location && <span className={styles.entryLocation}>{location}</span>}
      </>
    );

    if (preset.entry === 'title-right') {
      return (
        <div key={id} {...resumeItem(description ?? undefined)} className={styles.entry}>
          <div className={styles.entryHeadRow}>
            <h4 className={titleClass}>{head}</h4>
            {location && <span className={styles.entryLocation}>{location}</span>}
          </div>
          {years && <p className={styles.entryMeta}>{formatDateRange(years)}</p>}
          <DescriptionList
            items={description ?? undefined}
            styles={descriptionStyles as never}
            textClassName={styles.body}
            marker="•"
            markerClassName={styles.bullet}
          />
        </div>
      );
    }

    if (preset.entry === 'date-column') {
      return (
        <div key={id} {...resumeItem(description ?? undefined)} className={styles.entryColumns}>
          <div className={styles.entryDateColumn}>{meta}</div>
          <div className={styles.entryBody}>
            <h4 className={titleClass}>{head}</h4>
            <DescriptionList
              items={description ?? undefined}
              styles={descriptionStyles as never}
              textClassName={styles.body}
              marker="•"
              markerClassName={styles.bullet}
            />
          </div>
        </div>
      );
    }

    return (
      <div key={id} {...resumeItem(description ?? undefined)} className={styles.entry}>
        <h4 className={titleClass}>{head}</h4>
        {(years || location) && <p className={styles.entryMeta}>{meta}</p>}
        <DescriptionList
          items={description ?? undefined}
          styles={descriptionStyles as never}
          textClassName={styles.body}
          marker="•"
          markerClassName={styles.bullet}
        />
      </div>
    );
  };

  const renderCustomSection = (section: SectionMeta) => {
    const custom = data.customSections?.[section.key];
    if (!custom) return null;

    if (section.sectionType === 'text' && custom.text?.trim()) {
      return (
        <div key={section.id} {...RESUME_SECTION}>
          {renderHeading(section.displayName)}
          <p className={styles.body}>{custom.text}</p>
        </div>
      );
    }

    if (section.sectionType === 'stringList' && custom.strings?.length) {
      return (
        <div key={section.id} {...RESUME_SECTION}>
          {renderHeading(section.displayName)}
          <ul className={styles.skillList}>
            {cleanItems(custom.strings).map((line, index) => (
              <li key={index} className={styles.skillItem}>
                {line}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (section.sectionType === 'itemList' && custom.items?.length) {
      return (
        <div key={section.id} {...RESUME_SECTION}>
          {renderHeading(section.displayName)}
          <div className={styles.entryStack}>
            {custom.items.map((item) =>
              renderEntry({
                id: item.id,
                title: item.title,
                subtitle: item.subtitle,
                years: item.years,
                location: item.location,
                description: item.description,
                descriptionStyles: item.descriptionStyles,
              })
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  const customSections = sortedSections
    .filter((section) => !section.isDefault && section.isVisible)
    .map((section) => renderCustomSection(section));

  const railSkills = (
    <>
      {visible('additional') && skills.length > 0 && (
        <div {...RESUME_SECTION} className={styles.railBlock}>
          {renderRailLabel(sectionName('additional', headingFallbacks.skills))}
          {renderSkillList()}
        </div>
      )}
      {visible('additional') && languages.length > 0 && (
        <div {...RESUME_SECTION} className={styles.railBlock}>
          {renderRailLabel(headingFallbacks.languages)}
          <p className={styles.railText}>{languages.join(' · ')}</p>
        </div>
      )}
    </>
  );

  const railDetails = (
    <div {...RESUME_SECTION} className={styles.railBlock}>
      {renderRailLabel(fallbackLabels?.details ?? 'Details')}
      {renderContactStack()}
    </div>
  );

  /* The photo-panel portrait is a full-bleed block at the head of the column, not a
     chip: it stays square whatever the photo-shape setting says, or a "circle" choice
     would print as an ellipse. The attribute stays for the photo-style tests. */
  const railPhoto =
    photo && preset.layout === 'photo-panel' ? (
      <img src={photo} alt="" className={styles.panelPhoto} data-photo-shape={photoShape} />
    ) : null;

  const rail =
    preset.layout === 'single' ? null : (
      <aside className={styles.rail}>
        {railPhoto}
        {preset.layout === 'rail-left' || preset.layout === 'rail-divider' ? (
          preset.railContactFirst ? (
            <>
              {preset.railContact !== false && railDetails}
              {railSkills}
            </>
          ) : (
            <>
              {railSkills}
              {/* A band header already prints the contact block, so the rail does not
                  repeat it. */}
              {preset.railContact !== false && preset.header !== 'band' && railDetails}
            </>
          )
        ) : (
          <>
            {preset.railContact !== false && railDetails}
            {railSkills}
          </>
        )}
      </aside>
    );

  const story = (
    <div className={styles.story}>
      {preset.header !== 'band' && preset.header !== 'night' && renderIdentity()}
      {preset.header === 'plain' &&
        preset.layout === 'single' &&
        preset.contact !== 'inline' &&
        contactRows.length > 0 && (
          <div className={styles.inlineContacts}>{renderContactStack()}</div>
        )}

      {visible('summary') && summary && (
        <div {...RESUME_SECTION}>
          {renderHeading(sectionName('summary', headingFallbacks.summary), 'summary')}
          <p className={styles.body}>{summary}</p>
        </div>
      )}

      {visible('workExperience') && workExperience && workExperience.length > 0 && (
        <div {...RESUME_SECTION}>
          {renderHeading(
            sectionName('workExperience', headingFallbacks.experience),
            'workExperience'
          )}
          <div className={styles.entryStack}>
            {condensed.full.map((entry) =>
              renderEntry({
                id: entry.id,
                title: entry.title,
                subtitle: entry.company,
                years: entry.years,
                location: entry.location,
                description: entry.description,
                descriptionStyles: entry.descriptionStyles,
              })
            )}

            {condensed.condensed.length > 0 && (
              <div className={styles.condensed} data-earlier-experience="">
                <p className={styles.condensedLabel}>
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

      {visible('personalProjects') && personalProjects && personalProjects.length > 0 && (
        <div {...RESUME_SECTION}>
          {renderHeading(sectionName('personalProjects', headingFallbacks.projects))}
          <div className={styles.entryStack}>
            {personalProjects.map((entry) =>
              renderEntry({
                id: entry.id,
                title: entry.name,
                subtitle: entry.role,
                years: entry.years,
                description: entry.description,
                descriptionStyles: entry.descriptionStyles,
              })
            )}
          </div>
        </div>
      )}

      {visible('education') && education && education.length > 0 && (
        <div {...RESUME_SECTION}>
          {renderHeading(sectionName('education', headingFallbacks.education), 'education')}
          <div className={styles.entryStack}>
            {education.map((entry) =>
              renderEntry({
                id: entry.id,
                title: entry.institution,
                subtitle: entry.degree,
                years: entry.years,
                description:
                  typeof entry.description === 'string' ? [entry.description] : entry.description,
              })
            )}
          </div>
        </div>
      )}

      {visible('additional') && certifications.length > 0 && (
        <div {...RESUME_SECTION}>
          {renderHeading(headingFallbacks.certifications)}
          <ul className={styles.skillList}>
            {certifications.map((item, index) => (
              <li key={index} className={styles.skillItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {visible('additional') && awards.length > 0 && (
        <div {...RESUME_SECTION}>
          {renderHeading(headingFallbacks.awards)}
          <ul className={styles.skillList}>
            {awards.map((item, index) => (
              <li key={index} className={styles.skillItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {preset.layout === 'single' && (
        <>
          {visible('additional') && skills.length > 0 && (
            <div {...RESUME_SECTION}>
              {renderHeading(sectionName('additional', headingFallbacks.skills))}
              {renderSkillList(true)}
            </div>
          )}
          {visible('additional') && languages.length > 0 && (
            <div {...RESUME_SECTION}>
              {renderHeading(headingFallbacks.languages)}
              <p className={styles.body}>{languages.join(' · ')}</p>
            </div>
          )}
        </>
      )}

      {customSections}

      {workExperience && workExperience.length === 0 && !summary && !education?.length && (
        <p className={styles.emptyHint}>
          <Quote size={12} className={styles.headIconGlyph} />
          {earlierExperienceLabel ?? ''}
        </p>
      )}
    </div>
  );

  const band = (preset.header === 'band' || preset.header === 'night') && (
    <header
      className={`${baseStyles['resume-header']} ${styles.band} ${preset.header === 'night' ? styles.bandNight : ''}`}
    >
      {photo ? (
        <img
          src={photo}
          alt=""
          className={styles.bandPortrait}
          data-photo-shape={photoShape}
          style={{ borderRadius: photoShape === 'circle' ? '999px' : '0' }}
        />
      ) : null}
      <div className={styles.bandText}>
        <h1 className={styles.bandName}>{displayName}</h1>
        {personalInfo?.title && <p className={styles.bandRole}>{personalInfo.title}</p>}
      </div>
      {contactRows.length > 0 && (
        <div className={styles.bandContacts}>
          {contactRows.map((row) => (
            <span key={row.key} className={styles.bandContactLine}>
              {row.key === 'email' || row.key === 'phone' ? (
                <a href={linkHref(row.key, row.value)} className={styles.contactLink}>
                  {linkText(row.value)}
                </a>
              ) : (
                row.value
              )}
            </span>
          ))}
        </div>
      )}
    </header>
  );

  return (
    <div
      className={`${styles.page} ${styles[`layout-${preset.layout}`]}`}
      data-header={preset.header}
      data-heading={preset.heading}
      data-skills={preset.skills}
      data-entry={preset.entry}
      style={
        {
          '--profile-accent': preset.accent,
          '--profile-surface': preset.surface,
          '--profile-on-surface': preset.onSurface,
          '--profile-name-scale': preset.largeName ? '1.9' : '1',
        } as React.CSSProperties
      }
    >
      {band}
      <div className={preset.layout === 'single' ? styles.single : styles.columns}>
        {preset.layout === 'rail-left' || preset.layout === 'rail-divider' ? rail : null}
        {story}
        {preset.layout === 'rail-right' ||
        preset.layout === 'night-rail' ||
        preset.layout === 'panel-right' ||
        preset.layout === 'photo-panel'
          ? rail
          : null}
      </div>
    </div>
  );
};

export default ResumeProfile;
