import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export const DEFAULT_SETTINGS = {
  siteInfo: {
    platformName: 'Aliou Sow Academy',
    tagline: 'Excellence Scientifique',
    teacherDisplayName: 'M. Aliou Sow',
    defaultPrice: 6000,
    defaultDuration: '3 mois',
    waveNumber: '+221 77 102 33 99',
    orangeMoneyNumber: '+221 77 102 33 99',
    maintenanceMode: false,
    maintenanceMessage:
      'La plateforme est momentanément en maintenance. Nous revenons très vite !',
  },
  subjects: ['Mathématiques', 'Physique-Chimie'],
  levels: [
    { value: '4ème', label: '4ème' },
    { value: '3ème', label: '3ème' },
    { value: '2nde S', label: '2nde S' },
    { value: '1ère S', label: '1ère S' },
    { value: 'TS', label: 'Terminale S' },
  ],
  features: {
    enableOpenRegistration: true,
    enableFreeEnrollment: true,
    enablePayments: true,
    enableLiveMeet: true,
    enableQuiz: true,
    enableForum: true,
    enableReviews: true,
    enablePdfDownload: true,
    enableShareButtons: true,
    enableSequentialUnlock: true,
    enableAppInstall: true,
  },
  announcement: {
    active: false,
    message: 'Nouvelle séance de révision en direct avec M. Aliou Sow ce week-end !',
    type: 'info',
    buttonText: 'Découvrir',
    link: '/courses',
  },
  channels: {
    contactPhone: '+221 77 102 33 99',
    contactEmail: 'Sowaliou2504@gmail.com',
    whatsappNumber: '+221771023399',
    facebookUrl: '',
    tiktokUrl: 'https://www.tiktok.com/@aliousow9216',
    youtubeUrl: 'https://youtube.com/@dermannaltv4340?si=Jk86Ads8TMVEx6vv',
    globalMeetLink: 'https://meet.google.com/new',
  },
  faqs: [
    {
      question: 'Comment fonctionne Aliou Sow Academy ?',
      answer:
        "Inscrivez-vous en quelques secondes, choisissez votre matière en Mathématiques ou Physique-Chimie selon votre classe (de la 4ème à la Terminale S), accédez aux chapitres structurés (vidéos, fiches PDF, résumés, séances en direct) et validez vos acquis grâce aux quiz interactifs.",
    },
    {
      question: 'Les cours suivent-ils le programme officiel ?',
      answer:
        "Oui, l'ensemble des matières est conçu par M. Aliou Sow conformément au programme officiel sénégalais du collège et du lycée scientifique (4ème, 3ème, 2nde S, 1ère S, Terminale S) pour préparer efficacement le BFEM et le Baccalauréat.",
    },
    {
      question: "Quel est le tarif et la durée d'accès à une matière ?",
      answer:
        "L'accès standard à une matière est fixé à 6 000 FCFA (payable simplement par Wave ou Orange Money), avec des accès gratuits sur certaines matières de découverte et un accès renouvelable pour accompagner votre progression.",
    },
    {
      question: 'Puis-je accéder aux cours sur mobile ?',
      answer:
        "Oui, la plateforme est entièrement responsive et optimisée pour smartphones, tablettes et ordinateurs. Vous pouvez même l'installer sur votre écran d'accueil pour un accès rapide.",
    },
    {
      question: "Y a-t-il un support disponible si j'ai des questions ?",
      answer:
        "Oui ! Chaque matière intègre un salon de discussion et de soutien pédagogique permettant d'échanger directement avec M. Aliou Sow et les autres élèves, en plus des séances en direct.",
    },
  ],
  testimonials: [
    {
      name: 'FATOU DIAGNE',
      level: 'Élève en Terminale S',
      quote:
        "Grâce à Aliou Sow Academy, j'ai pu maîtriser les fonctions, les suites et la mécanique. Les cours sont très structurés et les quiz corrigés m'ont permis de réussir mon Baccalauréat sereinement.",
      rating: 5,
    },
    {
      name: 'MOUSSA KA',
      level: 'Élève en 1ère S',
      quote:
        "Les séances en direct et l'espace d'échange avec M. Aliou Sow font toute la différence. Dès que j'ai une question sur un chapitre de Physique-Chimie, j'obtiens une explication claire et rapide.",
      rating: 5,
    },
    {
      name: 'AÏSSATOU SARR',
      level: 'Élève en 3ème',
      quote:
        "Les fiches PDF et les vidéos pas à pas sont faciles à suivre sur téléphone comme sur ordinateur. J'ai préparé mon BFEM en toute confiance grâce aux exercices interactifs.",
      rating: 5,
    },
  ],
  extraLinks: [],
};

const mergeSettings = (data) => {
  if (!data || typeof data !== 'object') return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...data,
    siteInfo: { ...DEFAULT_SETTINGS.siteInfo, ...(data.siteInfo || {}) },
    subjects: Array.isArray(data.subjects) && data.subjects.length ? data.subjects : DEFAULT_SETTINGS.subjects,
    levels: Array.isArray(data.levels) && data.levels.length ? data.levels : DEFAULT_SETTINGS.levels,
    features: { ...DEFAULT_SETTINGS.features, ...(data.features || {}) },
    announcement: { ...DEFAULT_SETTINGS.announcement, ...(data.announcement || {}) },
    channels: { ...DEFAULT_SETTINGS.channels, ...(data.channels || {}) },
    faqs: Array.isArray(data.faqs) && data.faqs.length ? data.faqs : DEFAULT_SETTINGS.faqs,
    testimonials:
      Array.isArray(data.testimonials) && data.testimonials.length
        ? data.testimonials
        : DEFAULT_SETTINGS.testimonials,
    extraLinks: Array.isArray(data.extraLinks) ? data.extraLinks : [],
  };
};

export const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loadingSettings: false,
  refreshSettings: async () => {},
  saveSettings: async () => {},
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await api('/settings');
      setSettings(mergeSettings(data));
    } catch {
      // Fallback sur DEFAULT_SETTINGS si l'API ne répond pas encore
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const saveSettings = async (payload) => {
    const updated = await api('/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const merged = mergeSettings(updated);
    setSettings(merged);
    return merged;
  };

  return (
    <SettingsContext.Provider value={{ settings, loadingSettings, refreshSettings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
