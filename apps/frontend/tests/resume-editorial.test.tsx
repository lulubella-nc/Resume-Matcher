import type { ComponentProps } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Resume, { type ResumeData } from '@/components/dashboard/resume-component';
import { DEFAULT_TEMPLATE_SETTINGS } from '@/lib/types/template-settings';

vi.mock('@/lib/i18n', () => ({ useTranslations: () => ({ t: (key: string) => key }) }));

const PHOTO = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';

const data: ResumeData = {
  personalInfo: {
    name: 'Wes Andover',
    title: 'Paralegal',
    email: 'wes@example.com',
    phone: '(561) 217-6321',
    location: '540 Apoxy Court\nNew York, NY 33496',
    website: 'wesandover.com',
    photo: PHOTO,
  },
  summary: 'Experienced and dedicated paralegal.',
  workExperience: [
    {
      id: 1,
      title: 'Paralegal',
      company: 'Gulf Law Practice',
      location: 'Boca Raton',
      years: 'Aug 2015 - Present',
      description: ['Report directly to three attorneys.', 'Prepare content specific files.'],
    },
  ],
  education: [
    {
      id: 1,
      institution: 'Rutgers University',
      degree: 'Bachelor of Communications',
      years: 'Aug 2009 - May 2013',
      description: 'Vice President of the debate team.\nHead writer and reporter at The Owl.',
    },
  ],
  additional: {
    technicalSkills: ['Interpersonal Communication', 'Time Management'],
    languages: ['English', 'Spanish'],
    skillLevels: { 'Interpersonal Communication': 5, 'Time Management': 3 },
  },
};

const renderTemplate = (props: Partial<ComponentProps<typeof Resume>> = {}) =>
  render(<Resume resumeData={data} template="editorial" {...props} />);

describe('editorial template', () => {
  it('renders the identity and every populated section', () => {
    const { container } = renderTemplate();
    const text = container.textContent ?? '';
    expect(text).toContain('Wes Andover');
    expect(text).toContain('Paralegal');
    expect(text).toContain('Experienced and dedicated paralegal.');
    expect(text).toContain('Gulf Law Practice');
    expect(text).toContain('Rutgers University');
    expect(text).toContain('Interpersonal Communication');
    expect(text).toContain('English');
  });

  it('prints skills as plain names, with no proficiency scale', () => {
    // The reference design draws a five-dot scale, but a scale states a level the
    // resume never claimed (unrated skills used to render a confident 4/5). Skills
    // are names only, whatever is stored in the legacy `skillLevels` map.
    const { container } = renderTemplate();
    expect(container.querySelectorAll('[data-skill-level]')).toHaveLength(0);
    expect(container.textContent).not.toContain('/ 5');

    const skills = Array.from(container.querySelectorAll('p')).map((p) => p.textContent?.trim());
    expect(skills).toContain('Interpersonal Communication');
    expect(skills).toContain('Time Management');
  });

  it('prints the labelled contact block with working mail and phone links', () => {
    const { container } = renderTemplate();
    expect(container.textContent).toContain('Address');
    expect(container.textContent).toContain('Phone');
    expect(container.textContent).toContain('Email');
    expect(container.querySelector('a[href="mailto:wes@example.com"]')).not.toBeNull();
    expect(container.querySelector('a[href="tel:(561) 217-6321"]')).not.toBeNull();
    // A saved multi-line address keeps its line breaks.
    expect(container.textContent).toContain('540 Apoxy Court');
    expect(container.textContent).toContain('New York, NY 33496');
  });

  it('joins role and employer on the title line and keeps dates with the location', () => {
    const { container } = renderTemplate();
    expect(container.textContent).toContain('Paralegal, Gulf Law Practice');
    expect(container.textContent).toContain('Aug 2015 - Present');
    expect(container.textContent).toContain('Boca Raton');
  });

  it('turns a multi-line education note into bullets', () => {
    const { container } = renderTemplate();
    const items = Array.from(container.querySelectorAll('li')).map((li) =>
      (li.textContent ?? '').replace(/^\s*•\s*/, '').trim()
    );
    expect(items).toContain('Vice President of the debate team.');
    expect(items).toContain('Head writer and reporter at The Owl.');
  });

  it('renders the uploaded portrait as a decorative image', () => {
    const { container } = renderTemplate();
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', PHOTO);
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('data-photo-shape', 'circle');
  });

  it('honours the photo shape and show-photo settings', () => {
    const square = renderTemplate({
      settings: { ...DEFAULT_TEMPLATE_SETTINGS, template: 'editorial', photoShape: 'square' },
    });
    expect(square.container.querySelector('img')).toHaveAttribute('data-photo-shape', 'square');
    square.unmount();

    const hidden = renderTemplate({
      settings: { ...DEFAULT_TEMPLATE_SETTINGS, template: 'editorial', showPhoto: false },
    });
    expect(hidden.container.querySelector('img')).toBeNull();
  });

  it('falls back to a monogram when there is no photo', () => {
    const { container } = renderTemplate({
      resumeData: { ...data, personalInfo: { name: 'Wes Andover' } },
    });
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('[data-photo-shape]')?.textContent).toBe('W');
  });

  it('puts the story column first in the DOM so a parser reads profile before the rail', () => {
    const { container } = renderTemplate();
    const text = container.textContent ?? '';
    expect(text.indexOf('Wes Andover')).toBeLessThan(text.indexOf('Gulf Law Practice'));
    expect(text.indexOf('Gulf Law Practice')).toBeLessThan(text.indexOf('Interpersonal'));
  });

  it('drops a section entirely when its data is empty', () => {
    const { container } = renderTemplate({
      resumeData: { personalInfo: { name: 'Wes Andover' } },
      sectionHeadings: { summary: 'Profile', experience: 'Employment History' },
    });
    const text = container.textContent ?? '';
    expect(text).not.toContain('Profile');
    expect(text).not.toContain('Employment History');
    expect(text).toContain('Wes Andover');
  });

  it('uses a renamed section heading from the section manager', () => {
    const { container } = renderTemplate({
      resumeData: {
        ...data,
        sectionMeta: [
          {
            id: 'summary',
            key: 'summary',
            displayName: 'Profile',
            sectionType: 'text',
            isDefault: true,
            isVisible: true,
            order: 1,
          },
          {
            id: 'workExperience',
            key: 'workExperience',
            displayName: 'Employment History',
            sectionType: 'itemList',
            isDefault: true,
            isVisible: true,
            order: 2,
          },
        ],
      },
    });
    const text = container.textContent ?? '';
    expect(text).toContain('Profile');
    expect(text).toContain('Employment History');
  });

  it('localizes the contact block labels', () => {
    const { container } = renderTemplate({
      fallbackLabels: {
        name: '你的名字',
        details: '联系方式',
        address: '地址',
        phone: '电话',
        email: '邮箱',
      },
    });
    const text = container.textContent ?? '';
    expect(text).toContain('联系方式');
    expect(text).toContain('地址');
    expect(text).toContain('电话');
    expect(text).toContain('邮箱');
  });
});
