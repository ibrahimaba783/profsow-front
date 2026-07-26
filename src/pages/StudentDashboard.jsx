import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import {
  BookOpen,
  Award,
  CreditCard,
  ChevronRight,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Phone,
  Smartphone,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [myCourses, setMyCourses] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Wave');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [emailPreviewUrl, setEmailPreviewUrl] = useState('');
  const [paying, setPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [enrollingFreeId, setEnrollingFreeId] = useState(null);
  const [freeEnrollError, setFreeEnrollError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const allCourses = await api('/courses');
      const mySubs = await api('/subscriptions/my');

      const activeCourseIds = mySubs
        .filter(sub => sub.course && sub.status === 'active' && new Date(sub.expiresAt) > new Date())
        .map(sub => sub.course._id);

      const enrolled = allCourses.filter(c => activeCourseIds.includes(c._id));
      const available = allCourses.filter(c => !activeCourseIds.includes(c._id));

      setMyCourses(enrolled);
      setCatalog(available);
    } catch (err) {
      console.error('Erreur de récupération des données du dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollFree = async (course) => {
    setEnrollingFreeId(course._id);
    setFreeEnrollError('');
    try {
      await api(`/subscriptions/enroll-free/${course._id}`, { method: 'POST' });
      await fetchDashboardData();
    } catch (err) {
      setFreeEnrollError(err.message || "Impossible d'activer ce cours gratuit pour le moment");
    } finally {
      setEnrollingFreeId(null);
    }
  };

  const startPayment = (course) => {
    setSelectedCourse(course);
    setPhoneNumber('');
    setPaymentSuccess(false);
    setTransactionId('');
    setEmailPreviewUrl('');
    setErrorMessage('');
    setPaymentMethod('Wave');
  };

  const handleSimulatePayment = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 9) {
      setErrorMessage('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    setPaying(true);
    setErrorMessage('');

    const prefix = paymentMethod === 'Wave' ? 'WV-' : 'OM-';
    const fakeTxId = prefix + Math.random().toString(36).substring(2, 10).toUpperCase();

    try {
      const data = await api('/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          courseId: selectedCourse._id,
          paymentMethod,
          transactionId: fakeTxId,
          amount: selectedCourse.price,
          durationMonths: 12,
        }),
      });

      setTransactionId(fakeTxId);
      if (data.emailPreviewUrl) {
        setEmailPreviewUrl(data.emailPreviewUrl);
      }
      setPaymentSuccess(true);
      await fetchDashboardData();
    } catch (err) {
      setErrorMessage(err.message || 'Le paiement a échoué');
    } finally {
      setPaying(false);
    }
  };

  const handleCardClick = (course) => {
    navigate(`/courses/${course._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pt-28 pb-12 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Mon Espace Étudiant</h1>
            <p className="text-slate-500 mt-1">Bienvenue, {user?.name}. Suivez vos cours et gérez vos abonnements.</p>
          </div>
          <Link
            to="/profile"
            className="btn-shiny px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-semibold text-slate-700 mt-4 md:mt-0 shadow-sm"
          >
            Gérer mon Profil
          </Link>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-indigo-600 flex items-center gap-2 mb-6">
            <BookOpen className="w-6 h-6" />
            <span>Mes Cours Débloqués ({myCourses.length})</span>
          </h2>

          {myCourses.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-slate-500 border border-dashed border-slate-200">
              <p>Vous n'avez aucun cours débloqué pour le moment.</p>
              <p className="text-sm mt-1">Sélectionnez un cours dans le catalogue ci-dessous et activez votre abonnement.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {myCourses.map((course) => (
                <div
                  key={course._id}
                  onClick={() => handleCardClick(course)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleCardClick(course);
                  }}
                  className="glass-card rounded-2xl overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-300"
                >
                  <div
                    className="h-44 bg-cover bg-center"
                    style={{ backgroundImage: `url(${course.image})` }}
                  ></div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex gap-2">
                        <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full font-semibold">
                          {course.subject}
                        </span>
                        <span className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-0.5 rounded-full font-semibold">
                          {course.level}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mt-4 mb-2 text-slate-900">{course.title}</h3>
                      <p className="text-slate-500 text-sm line-clamp-2">{course.description}</p>
                    </div>
                    <div className="mt-6 border-t border-slate-100 pt-4 flex justify-between items-center">
                      <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                        Abonnement Actif
                      </span>
                      <span className="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center gap-1">
                        Étudier <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-purple-600 flex items-center gap-2 mb-6">
            <Award className="w-6 h-6" />
            <span>Catalogue des modules disponibles ({catalog.length})</span>
          </h2>

          {freeEnrollError && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
              {freeEnrollError}
            </div>
          )}

          {catalog.length === 0 ? (
            <p className="text-slate-400 text-sm">Tous les cours disponibles sont débloqués dans votre espace !</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {catalog.map((course) => {
                const courseIsFree = course.isFree || course.price === 0;

                return (
                  <div
                    key={course._id}
                    onClick={() => handleCardClick(course)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleCardClick(course);
                    }}
                    className="glass-card rounded-2xl overflow-hidden opacity-90 hover:opacity-100 transition-opacity flex flex-col justify-between relative cursor-pointer hover:shadow-lg"
                  >
                    {courseIsFree && (
                      <span className="absolute top-3 right-3 z-10 text-xs bg-emerald-500 text-white px-3 py-1 rounded-full font-bold shadow-lg">
                        Gratuit
                      </span>
                    )}

                    <div>
                      <div
                        className="h-44 bg-cover bg-center grayscale-[15%]"
                        style={{ backgroundImage: `url(${course.image})` }}
                      ></div>
                      <div className="p-6">
                        <div className="flex gap-2">
                          <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full font-semibold">
                            {course.subject}
                          </span>
                          <span className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-0.5 rounded-full font-semibold">
                            {course.level}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold mt-4 mb-2 flex items-center justify-between text-slate-900">
                          <span>{course.title}</span>
                          <Lock className="w-4 h-4 text-slate-400" />
                        </h3>
                        <p className="text-slate-500 text-sm line-clamp-2">{course.description}</p>
                      </div>
                    </div>

                    <div className="p-6 border-t border-slate-100 flex justify-between items-center">
                      {courseIsFree ? (
                        <>
                          <span className="flex items-baseline gap-2">
                            <span className="font-extrabold text-lg text-emerald-600">Gratuit</span>
                            {course.originalPrice > 0 && (
                              <span className="text-xs text-slate-400 line-through">
                                {course.originalPrice} FCFA
                              </span>
                            )}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEnrollFree(course);
                            }}
                            disabled={enrollingFreeId === course._id}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition"
                          >
                            {enrollingFreeId === course._id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                <span>Accéder gratuitement</span>
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="font-extrabold text-lg text-slate-900">
                            {course.price} FCFA
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startPayment(course);
                            }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>S'abonner (1 an)</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 border border-slate-100 relative flex flex-col slide-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              ✕
            </button>

            {paymentSuccess ? (
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Abonnement Réussi !</h3>
                <p className="text-slate-600 text-sm">
                  Le module <strong>{selectedCourse.title}</strong> est désormais débloqué.
                </p>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left text-xs space-y-1 font-mono">
                  <div className="text-slate-500">Transaction ID: {transactionId}</div>
                  <div className="text-slate-500">Montant: {selectedCourse.price} FCFA</div>
                  <div className="text-emerald-600">Statut: Validé</div>
                </div>

                {emailPreviewUrl && (
                  <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-left text-xs space-y-1">
                    <span className="flex items-center gap-1 text-xs font-bold text-indigo-600">
                      <Sparkles className="w-3 h-3 animate-pulse" />
                      E-MAIL DE PAIEMENT GÉNÉRÉ
                    </span>
                    <a
                      href={emailPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-indigo-600 hover:text-indigo-700 font-bold underline"
                    >
                      Prévisualiser l'email de confirmation ↗
                    </a>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedCourse(null);
                    navigate(`/courses/${selectedCourse._id}`);
                  }}
                  className="w-full btn-neon text-white font-bold py-3 rounded-xl cursor-pointer"
                >
                  Accéder au cours
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                  <span>Simulateur de Paiement FCFA</span>
                </h3>
                <p className="text-slate-500 text-xs mb-6">
                  Simulez un virement Wave ou Orange Money pour le cours : <strong>{selectedCourse.title}</strong> (6000 FCFA).
                </p>

                {errorMessage && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-xs mb-4">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSimulatePayment} className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Wave')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition cursor-pointer ${
                        paymentMethod === 'Wave'
                          ? 'payment-card-wave border-blue-400 text-white'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <span className="text-lg font-bold">Wave</span>
                      <span className="text-[10px] opacity-75">Frais à 1%</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Orange Money')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition cursor-pointer ${
                        paymentMethod === 'Orange Money'
                          ? 'payment-card-orange border-orange-400 text-white'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <span className="text-lg font-bold">Orange Money</span>
                      <span className="text-[10px] opacity-75">Sénégal / Mali / etc</span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Numéro de téléphone payeur
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="input-animated pl-10"
                        placeholder="77 123 45 67"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg flex justify-between text-xs border border-slate-100 font-semibold">
                    <span className="text-slate-500">Total à payer :</span>
                    <span className="text-slate-900">{selectedCourse.price} FCFA</span>
                  </div>

                  <button
                    type="submit"
                    disabled={paying}
                    className="w-full btn-neon text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {paying ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>Confirmer le paiement simulé</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;