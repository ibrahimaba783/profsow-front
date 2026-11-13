import {
  Calculator,
  FlaskConical,
  Dna,
  BookOpen,
  Globe,
  Lightbulb,
  Compass,
  GraduationCap,
} from 'lucide-react';

/**
 * Structure des classes prises en charge par M. Aliou Sow :
 * 4ème, 3ème, 2nde S, 1ère S, TS
 * Modèle Sénégal : Classe → Matière → Chapitre → (Leçons, Exercices, Quiz)
 */
export const CYCLES = [
  {
    id: 'college',
    label: 'Collège',
    cycleName: 'Collège',
    shortSubtitle: '4e & 3e (BFEM)',
    subtitle: 'Enseignement moyen : 4ème et 3ème — Préparation au BFEM',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accentColor: '#10b981',
    classes: [
      {
        id: '4ème',
        name: '4ème',
        short: '4e',
        cycle: 'Collège',
        desc: 'Introduction aux sciences physiques et théorèmes clés en mathématiques',
        levelValues: ['4ème', '4e', '4eme', 'quatrième', 'quatrieme'],
      },
      {
        id: '3ème',
        name: '3ème',
        short: '3e',
        cycle: 'Collège',
        desc: 'Année du BFEM : révisions intensives, annales et méthodologie d\'examen',
        levelValues: ['3ème', '3e', '3eme', 'troisième', 'troisieme'],
      },
    ],
  },
  {
    id: 'lycee',
    label: 'Lycée',
    cycleName: 'Lycée',
    shortSubtitle: '2nde S à TS (Baccalauréat)',
    subtitle: 'Enseignement secondaire scientifique (2nde S, 1ère S, TS) — Préparation au Baccalauréat',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    accentColor: '#6366f1',
    classes: [
      {
        id: '2nde S',
        name: '2nde S',
        short: '2nde S',
        cycle: 'Lycée',
        desc: 'Orientation scientifique, mécanique, algèbre et chimie fondamentale',
        levelValues: ['2nde S', '2nde', 'Seconde', 'Seconde S', '2ndes', '2nde s'],
      },
      {
        id: '1ère S',
        name: '1ère S',
        short: '1ère S',
        cycle: 'Lycée',
        desc: 'Programme clé du lycée scientifique : analyse, énergie, cinématique et chimie',
        levelValues: ['1ère S', '1ère', 'Première', 'Première S', '1ere S', '1ere', '1ères'],
      },
      {
        id: 'TS',
        name: 'Terminale S',
        short: 'TS',
        cycle: 'Lycée',
        desc: 'Année du Bac : maîtrise des fonctions, suites, ondes, chimie et annales corrigées',
        levelValues: ['TS', 'Terminale S', 'Terminale', 'Tle S', 'tle s', 'terminale s'],
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
    (targetId === 'TS' && (raw.includes('terminale') || raw === 'ts' || raw === 'tle s')) ||
    (targetId === '2nde S' && (raw.includes('seconde') || raw.includes('2nde'))) ||
    (targetId === '1ère S' && (raw.includes('première') || raw.includes('premiere') || raw.includes('1ère') || raw.includes('1ere'))) ||
    (targetId === '4ème' && (raw.includes('4') || raw === '4e' || raw === '4ème' || raw === '4eme')) ||
    (targetId === '3ème' && (raw.includes('3') || raw === '3e' || raw === '3ème' || raw === '3eme'))
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
  if (level === 'TS' || level === 'Terminale S' || level === 'Terminale') return 'Terminale S';
  if (level === '2nde S' || level === '2nde' || level === 'Seconde' || level === 'Seconde S') return '2nde S';
  if (level === '1ère S' || level === '1ère' || level === 'Première' || level === 'Première S') return '1ère S';
  if (level === '4ème' || level === '4e' || level === '4eme') return '4ème';
  if (level === '3ème' || level === '3e' || level === '3eme') return '3ème';
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
