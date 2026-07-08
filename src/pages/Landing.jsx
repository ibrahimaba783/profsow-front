import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Video, FileText, ShieldCheck, ChevronRight } from 'lucide-react';
import logoFull from '../assets/logo-aliou-sow-academy-hero.png';
import logoEmblem from '../assets/logo-aliou-sow-academy-navbar.png';

const Landing = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await api('/courses');
        setCourses(data);
      } catch (err) {
        console.error("Erreur de chargement des cours :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen gradient-bg pt-24 text-slate-100 flex flex-col items-center">
      {/* Hero Section */}
      <header className="w-full max-w-6xl px-6 py-12 md:py-20 text-center flex flex-col items-center relative">
        {/* Glow Effects */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-20 left-1/3 w-60 h-60 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none"></div>

        <img src={logoFull} alt="Aliou Sow Academy" className="h-56 md:h-72 w-auto mb-6 slide-in" />

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight max-w-4xl slide-in">
          Maîtrisez les <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Mathématiques</span> & la <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">Physique-Chimie</span>
        </h1>

        <p className="text-slate-400 text-base md:text-xl max-w-2xl mb-8 leading-relaxed slide-in">
          Rejoignez la classe en ligne de <strong>M. Aliou Sow</strong> et accédez à des chapitres structurés, des vidéos YouTube, des documents PDF de cours et des sessions d'accompagnement en direct via Google Meet.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 slide-in">
          <Link to="/register" className="btn-neon text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-indigo-500/50 transition">
            Commencer gratuitement
          </Link>
          <a href="#courses" className="glass hover:bg-white/5 border border-white/10 text-slate-200 font-semibold px-8 py-3.5 rounded-xl transition">
            Découvrir les cours
          </a>
        </div>
      </header>

      {/* Feature Section */}
      <section className="w-full max-w-6xl px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <div className="glass-card p-8 rounded-2xl flex flex-col items-center text-center">
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-indigo-400 mb-6">
            <Video className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold mb-2">Cours Vidéos & Directs</h3>
          <p className="text-slate-400 text-sm">Visionnez les cours structurés sur YouTube et rejoignez des lives interactifs sur Google Meet pour poser vos questions en direct.</p>
        </div>

        <div className="glass-card p-8 rounded-2xl flex flex-col items-center text-center">
          <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl text-purple-400 mb-6">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold mb-2">Fiches & Devoirs PDF</h3>
          <p className="text-slate-400 text-sm">Téléchargez des fiches de résumé de cours, des séries d'exercices et des corrigés détaillés au format PDF hébergés de manière sécurisée.</p>
        </div>

        <div className="glass-card p-8 rounded-2xl flex flex-col items-center text-center">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold mb-2">Suivi & Évaluations</h3>
          <p className="text-slate-400 text-sm">Testez vos connaissances en temps réel via des QCM et quiz interactifs avec corrections automatiques fournies par M. Sow.</p>
        </div>
      </section>

      {/* Pricing / Information Card */}
      <section className="w-full max-w-3xl mx-6 my-12 glass-card p-8 md:p-12 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 to-slate-900/40 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-purple-500/10 rounded-full blur-[80px]"></div>
        <div>
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 mb-2">Abonnement Annuel Unique</h3>
          <p className="text-slate-400 text-sm max-w-md">Accès complet à toutes les leçons d'un module, aux visioconférences Google Meet et au chat de soutien pendant un an.</p>
        </div>
        <div className="text-center flex flex-col items-center md:items-end">
          <span className="text-4xl font-extrabold text-white tracking-tight">6 000 FCFA</span>
          <span className="text-indigo-400 text-sm font-medium mb-4">Par module & par an</span>
          <Link to="/register" className="btn-shiny px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-bold text-white shadow-md">
            S'inscrire Maintenant
          </Link>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="w-full max-w-6xl px-6 py-16">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Nos Modules Disponibles</h2>
            <p className="text-slate-400">Sélectionnez le niveau pour explorer les cours structurés par chapitres.</p>
          </div>
          <span className="text-indigo-400 text-sm font-semibold hover:underline cursor-pointer flex items-center gap-1 mt-4 md:mt-0">
            Voir tous les niveaux <ChevronRight className="w-4 h-4" />
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="loader-spinner"></div>
          </div>
        ) : courses.length === 0 ? (
          /* Placeholders Premium en l'absence de données réelles */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition">
              <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800')` }}></div>
              <div className="p-6">
                <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full font-semibold">Mathématiques</span>
                <span className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-full font-semibold ml-2">TS (Terminales S)</span>
                <h3 className="text-xl font-bold mt-4 mb-2">Algèbre & Analyse Mathématique</h3>
                <p className="text-slate-400 text-sm line-clamp-2">Limites de fonctions, suites numériques, fonctions exponentielles et logarithmes de Terminale S.</p>
                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="font-extrabold text-lg">6 000 FCFA</span>
                  <button onClick={() => navigate('/login')} className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-1">
                    Accéder au cours <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition">
              <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800')` }}></div>
              <div className="p-6">
                <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full font-semibold">Physique-Chimie</span>
                <span className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-full font-semibold ml-2">1ère S</span>
                <h3 className="text-xl font-bold mt-4 mb-2">Mécanique & Cinématique du Point</h3>
                <p className="text-slate-400 text-sm line-clamp-2">Lois de Newton, énergie mécanique, travail d'une force et mouvements rectilignes uniformes.</p>
                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="font-extrabold text-lg">6 000 FCFA</span>
                  <button onClick={() => navigate('/login')} className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-1">
                    Accéder au cours <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition">
              <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=800')` }}></div>
              <div className="p-6">
                <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full font-semibold">Mathématiques</span>
                <span className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-full font-semibold ml-2">3ème</span>
                <h3 className="text-xl font-bold mt-4 mb-2">Théorème de Thalès & Trigonométrie</h3>
                <p className="text-slate-400 text-sm line-clamp-2">Préparation complète aux épreuves de géométrie pour le brevet/BFEM.</p>
                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="font-extrabold text-lg">6 000 FCFA</span>
                  <button onClick={() => navigate('/login')} className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-1">
                    Accéder au cours <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course._id} className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition">
                <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${course.image})` }}></div>
                <div className="p-6">
                  <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full font-semibold">{course.subject}</span>
                  <span className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-full font-semibold ml-2">{course.level}</span>
                  <h3 className="text-xl font-bold mt-4 mb-2">{course.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2">{course.description}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="font-extrabold text-lg">{course.price} FCFA</span>
                    <Link to={`/courses/${course._id}`} className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-1">
                      Accéder au cours <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 mt-auto py-8 text-center text-slate-500 text-sm glass flex flex-col items-center gap-3">
        <img src={logoEmblem} alt="Aliou Sow Academy" className="h-10 w-auto opacity-70" />
        <p>&copy; {new Date().getFullYear()} Aliou Sow Academy - Tous droits réservés.</p>
        <p className="text-xs mt-1 text-slate-600">Conçu pour la classe de M. Aliou Sow</p>
      </footer>
    </div>
  );
};

export default Landing;