import type { ComponentProps } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Resume, { type ResumeData } from '@/components/dashboard/resume-component';
import {
  DEFAULT_TEMPLATE_SETTINGS,
  PHOTO_SIZE_MAP,
  isPhotoTemplate,
  isTwoColumnTemplate,
  settingsToCssVars,
} from '@/lib/types/template-settings';

vi.mock('@/lib/i18n', () => ({ useTranslations: () => ({ t: (key: string) => key }) }));

const PHOTO = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';

const data: ResumeData = {
  personalInfo: {
    name: 'Li Lei',
    title: 'Product Manager',
    email: 'lilei@example.com',
    phone: '+86 138 0000 0000',
    photo: PHOTO,
  },
  summary: 'Ships data products for operations teams.',
  workExperience: [
    {
      id: 1,
      title: 'Senior PM',
      company: 'Northwind',
      location: 'Shanghai',
      years: '2020 - 2024',
      description: ['Grew activation 18%.', 'Rebuilt onboarding.'],
    },
  ],
  education: [{ id: 1, institution: 'Fudan University', degree: 'BSc', years: '2012 - 2016' }],
  additional: { technicalSkills: ['SQL', 'Figma'], languages: ['Chinese', 'English'] },
};

const renderTemplate = (props: Partial<ComponentProps<typeof Resume>> = {}) =>
  render(<Resume resumeData={data} template="photo-sidebar" {...props} />);

describe('photo-sidebar template', () => {
  it('is registered as a two-column photo template', () => {
    expect(isTwoColumnTemplate('photo-sidebar')).toBe(true);
    expect(isPhotoTemplate('photo-sidebar')).toBe(true);
    expect(isPhotoTemplate('swiss-single')).toBe(false);
  });

  it('renders the uploaded portrait in the colored rail', () => {
    const { container } = renderTemplate();
    const photo = container.querySelector('img');
    expect(photo).toHaveAttribute('src', PHOTO);
    expect(photo).toHaveAttribute('data-photo-shape', 'circle');
    // Decorative: the portrait must not add text an ATS would read.
    expect(photo).toHaveAttribute('alt', '');
  });

  it('honours the shape and show-photo settings', () => {
    const square = renderTemplate({
      settings: { ...DEFAULT_TEMPLATE_SETTINGS, template: 'photo-sidebar', photoShape: 'square' },
    });
    expect(square.container.querySelector('img')).toHaveAttribute('data-photo-shape', 'square');
    square.unmount();

    const hidden = renderTemplate({
      settings: { ...DEFAULT_TEMPLATE_SETTINGS, template: 'photo-sidebar', showPhoto: false },
    });
    expect(hidden.container.querySelector('img')).toBeNull();
    // The rail still identifies the person: the name is always on the page.
    expect(hidden.container.textContent).toContain('Li Lei');
  });

  it('falls back to a monogram when the resume has no photo', () => {
    const { container } = renderTemplate({
      resumeData: { ...data, personalInfo: { name: 'Li Lei' } },
    });
    expect(container.querySelector('img')).toBeNull();
    const monogram = container.querySelector('[data-photo-shape]');
    expect(monogram?.textContent).toBe('L');
  });

  it('refuses a photo value that is not an image URL', () => {
    const { container } = renderTemplate({
      resumeData: {
        ...data,
        personalInfo: { ...data.personalInfo, photo: 'javascript:alert(1)' },
      },
    });
    expect(container.querySelector('img')).toBeNull();
  });

  it('keeps the rail sections and the main column in reading order', () => {
    const { container } = renderTemplate();
    const text = container.textContent ?? '';
    const rail = ['Li Lei', 'SQL', 'Fudan University'];
    const main = ['Ships data products', 'Northwind'];
    for (const value of [...rail, ...main]) expect(text).toContain(value);
    // The rail comes first in the DOM so a parser reads identity before history.
    expect(text.indexOf('Li Lei')).toBeLessThan(text.indexOf('Northwind'));
  });

  it('maps the photo size setting onto the CSS variable the rail reads', () => {
    const vars = settingsToCssVars({
      ...DEFAULT_TEMPLATE_SETTINGS,
      template: 'photo-sidebar',
      photoSize: 3,
    }) as Record<string, string>;
    expect(vars['--resume-photo-size']).toBe(PHOTO_SIZE_MAP[3]);
  });
});
