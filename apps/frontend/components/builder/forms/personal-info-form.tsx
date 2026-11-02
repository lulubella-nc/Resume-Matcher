'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PersonalInfo } from '@/components/dashboard/resume-component';
import { useTranslations } from '@/lib/i18n';
import {
  PhotoError,
  fileToPhotoDataUrl,
  isPhotoValue,
  isUploadedPhoto,
  type PhotoErrorCode,
} from '@/lib/utils/image';

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ data, onChange }) => {
  const { t } = useTranslations();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [photoError, setPhotoError] = React.useState<PhotoErrorCode | null>(null);
  const [isReadingPhoto, setIsReadingPhoto] = React.useState(false);

  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const setPhoto = (photo: string) => {
    setPhotoError(null);
    onChange({ ...data, photo });
  };

  const handlePhotoFile = async (file: File | undefined) => {
    if (!file) return;
    setIsReadingPhoto(true);
    try {
      setPhoto(await fileToPhotoDataUrl(file));
    } catch (error) {
      setPhotoError(error instanceof PhotoError ? error.code : 'decode');
    } finally {
      setIsReadingPhoto(false);
      // Let the same file be picked again after an error.
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const uploaded = isUploadedPhoto(data.photo);
  const photoVisible = isPhotoValue(data.photo);

  return (
    <div className="ml-4 space-y-4 border border-ink p-6 bg-white shadow-sw-nested">
      <h3 className="font-serif text-xl font-bold border-b border-ink pb-2 mb-4">
        {t('builder.personalInfo')}
      </h3>

      {/* Portrait: used by the photo templates only, always part of the resume data. */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        <div className="size-24 shrink-0 border border-ink bg-canvas flex items-center justify-center overflow-hidden">
          {photoVisible ? (
            // eslint-disable-next-line @next/next/no-img-element -- user-supplied data URL or remote link, previewed as-is
            <img
              src={data.photo}
              alt=""
              className="size-full object-cover"
              onError={() => setPhotoError('decode')}
            />
          ) : (
            <span className="font-mono text-xs uppercase tracking-wider text-ink-soft">
              {t('builder.personalInfoForm.photo.empty')}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor="photo-url">{t('builder.personalInfoForm.photo.label')}</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isReadingPhoto}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploaded
                ? t('builder.personalInfoForm.photo.replace')
                : t('builder.personalInfoForm.photo.upload')}
            </Button>
            {data.photo && (
              <Button type="button" variant="outline" size="sm" onClick={() => setPhoto('')}>
                {t('builder.personalInfoForm.photo.remove')}
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void handlePhotoFile(event.target.files?.[0])}
            />
          </div>

          <Input
            id="photo-url"
            inputMode="url"
            value={uploaded ? '' : data.photo || ''}
            placeholder={
              uploaded
                ? t('builder.personalInfoForm.photo.uploaded')
                : t('builder.personalInfoForm.photo.urlPlaceholder')
            }
            onChange={(event) => setPhoto(event.target.value)}
          />
          <p className="font-mono text-xs text-ink-soft">
            {t('builder.personalInfoForm.photo.hint')}
          </p>
          {photoError && (
            <p role="alert" className="font-mono text-xs text-destructive">
              {t(`builder.personalInfoForm.photo.errors.${photoError}`)}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t('resume.personalInfo.name')}</Label>
          <Input
            id="name"
            autoComplete="name"
            value={data.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder={t('builder.personalInfoForm.placeholders.name')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">{t('resume.personalInfo.title')}</Label>
          <Input
            id="title"
            autoComplete="organization-title"
            value={data.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder={t('builder.personalInfoForm.placeholders.title')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t('resume.personalInfo.email')}</Label>
          <Input
            id="email"
            autoComplete="email"
            type="email"
            value={data.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder={t('builder.personalInfoForm.placeholders.email')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t('resume.personalInfo.phone')}</Label>
          <Input
            id="phone"
            autoComplete="tel"
            type="tel"
            value={data.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder={t('builder.personalInfoForm.placeholders.phone')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">{t('resume.personalInfo.location')}</Label>
          <Input
            id="location"
            value={data.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder={t('builder.personalInfoForm.placeholders.location')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">{t('resume.personalInfo.website')}</Label>
          <Input
            id="website"
            autoComplete="url"
            inputMode="url"
            value={data.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder={t('builder.personalInfoForm.placeholders.website')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedin">{t('resume.personalInfo.linkedin')}</Label>
          <Input
            id="linkedin"
            value={data.linkedin || ''}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            placeholder={t('builder.personalInfoForm.placeholders.linkedin')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="github">{t('resume.personalInfo.github')}</Label>
          <Input
            id="github"
            value={data.github || ''}
            onChange={(e) => handleChange('github', e.target.value)}
            placeholder={t('builder.personalInfoForm.placeholders.github')}
          />
        </div>
      </div>
    </div>
  );
};
