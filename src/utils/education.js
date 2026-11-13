import {
  Calculator,
  FlaskConical,
  Dna,
  BookOpen,
  Globe,
  Lightbulb,
  Compass,
  GraduationCap,
  Atom,
} from 'lucide-react';

/**
 * Structure officielle du système éducatif sénégalais (modèle Sama School) :
 * Classe → Matière → Chapitre → (Leçons, Exercices, Quiz)
 */
export const CYCLES = [
  {
    id: 'college',
    label: 'Collège',
    cycleName: 'Collège',
    shortSubtitle: '6e à 3e (BFEM)',
    subtitle: 'Enseignement moyen de la 6ème à la 3ème — Préparation au BFEM',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accentColor: '#10b981',
    classes: [
      {
        id: '6ème',
        name: '6ème',
        short: '6e',
        cycle: 'Collège',
        desc: 'Entrée au collège, bases solides en calcul et sciences',
        levelValues: ['6ème', '6e', '6eme'],
      },
      {
        id: '5ème',
        name: '5ème',
        short: '5e',
        cycle: 'Collège',
        desc: 'Approfondissement des notions scientifiques et géométriques',
        levelValues: ['5ème', '5e', '5eme'],
      },
      {
        id: '4ème',
        name: '4ème',
        short: '4e',
        cycle: 'Collège',
        desc: 'Introduction aux sciences physiques et théorèmes clés',
        levelValues: ['4ème', '4e', '4eme'],
      },
      {
        id: '3ème',
        name: '3ème',
        short: '3e',
        cycle: 'Collège',
        desc: 'Année du BFEM : révisions intensives, annales et méthodologie',
        levelValues: ['3ème', '3e', '3eme'],
      },
    ],
  },
  {
    id: 'lycee',
    label: 'Lycée',
    cycleName: 'Lycée',
    shortSubtitle: 'Seconde à Terminale (Baccalauréat)',
    subtitle: 'Enseignement secondaire scientifique — Préparation au Baccalauréat',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    accentColor: '#6366f1',
    classes: [
      {
        id: '2nde S',
        name: 'Seconde',
        short: '2nde',
        cycle: 'Lycée',
        desc: 'Orientation scientifique, mécanique, algèbre et chimie',
        levelValues: ['2nde S', '2nde', 'Seconde', '2nde L'],
      },
      {
        id: '1ère S',
        name: 'Première',
        short: '1ère',
        cycle: 'Lycée',
        desc: 'Programme clé du lycée scientifique : dérivées, énergie, réactions',
        levelValues: ['1ère S', '1ère', 'Première', '1ère L'],
      },
      {
        id: 'TS',
        name: 'Terminale',
        short: 'Terminale',
        cycle: 'Lycée',
        desc: 'Année du Bac : maîtrise des fonctions, suites, ondes et annales corrigées',
        levelValues: ['TS', 'Terminale S', 'Terminale', 'TL'],
      },
    ],
  },
];

export const ALL_CLASSES = CYCLES.flatMap((cycle) => cycle.classes);

/**
 * Normalise et associe le champ "level" d'un cours à une classe du cycle.
 */
export const matchesClassLevel = (courseLevel, classTarget) => {
  if (!courseLevel || !classTarget) return false;
  const raw = String(courseLevel).trim().toLowerCase();
  const targetId = typeof classTarget === 'string' ? classTarget : classTarget.id;
  const targetValues =
    typeof classTarget === 'object' && Array.isArray(classTarget.levelValues)
      ? classTarget.levelValues.map((v) => v.toLowerCase())
      : [targetId.toLowerCase()];

  return (
    targetValues.includes(raw) ||
    raw === targetId.toLowerCase() ||
    (targetId === 'TS' && (raw.includes('terminale') || raw === 'ts')) ||
    (targetId === '2nde S' && (raw.includes('seconde') || raw.includes('2nde'))) ||
    (targetId === '1ère S' && (raw.includes('première') || raw.includes('premiere') || raw.includes('1ère') || raw.includes('1ere')))
  );
};

/**
 * Calcule dynamiquement le nombre de matières et de chapitres pour une classe donnée.
 */
export const getClassStats = (courses = [], classItem) => {
  const classCourses = courses.filter((c) => matchesClassLevel(c.level, classItem));
  const distinctSubjects = Array.from(
    new Set(classCourses.map((c) => c.subject || c.title || 'Matière'))
  );
  const totalChapters = classCourses.reduce(
    (sum, c) => sum + (c.chaptersCount ?? c.chapters?.length ?? 0),
    0
  );

  return {
    coursesCount: classCourses.length,
    subjectsCount: distinctSubjects.length,
    totalChapters,
    subjectsList: distinctSubjects,
    courses: classCourses,
  };
};

/**
 * Formate le nom d'une classe pour un affichage soigné.
 */
export const formatClassLabel = (level) => {
  if (!level) return 'Tous niveaux';
  if (level === 'TS') return 'Terminale S';
  if (level === '2nde S') return 'Seconde S';
  if (level === '1ère S') return 'Première S';
  return level;
};

/**
 * Renvoie une icône et des couleurs adaptées à une matière.
 */
export const getSubjectMeta = (subjectName) => {
  const name = String(subjectName || '').toLowerCase();
  if (name.includes('math')) {
    return {
      icon: Calculator,
      label: 'Mathématiques',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      color: '#2563eb',
    };
  }
  if (name.includes('physique') || name.includes('chimie') || name.includes('pc') || name.includes('sciences physiques')) {
    return {
      icon: FlaskConical,
      label: 'Physique-Chimie',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      color: '#d97706',
    };
  }
  if (name.includes('svt') || name.includes('vie') || name.includes('terre') || name.includes('biologie')) {
    return {
      icon: Dna,
      label: 'SVT',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      color: '#059669',
    };
  }
  if (name.includes('français') || name.includes('francais') || name.includes('lettres')) {
    return {
      icon: BookOpen,
      label: 'Français',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      color: '#9333ea',
    };
  }
  if (name.includes('philo')) {
    return {
      icon: Lightbulb,
      label: 'Philosophie',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      color: '#4f46e5',
    };
  }
  if (name.includes('anglais') || name.includes('english')) {
    return {
      icon: Globe,
      label: 'Anglais',
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
      color: '#0284c7',
    };
  }
  if (name.includes('histoire') || name.includes('géo') || name.includes('geo')) {
    return {
      icon: Compass,
      label: 'Histoire-Géo',
      badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
      color: '#ea580c',
    };
  }
  return {
    icon: GraduationCap,
    label: subjectName || 'Matière scientifique',
    badgeClass: 'bg-teal-50 text-[#00796b] border-teal-200',
    color: '#009688',
  };
};
