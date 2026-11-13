import React, { useContext, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const GoogleLoginButton = ({ onError, onSuccessRedirect }) => {
  const { googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (response) => {
    setLoading(true);
    try {
      const data = await googleLogin(response.credential);
      const target = onSuccessRedirect || redirectParam;
      if (target && data?.role === 'student') {
        navigate(target);
        return;
      }
      navigate(
        data?.role === 'admin'
          ? '/admin-dashboard'
          : data?.role === 'teacher'
          ? '/teacher-dashboard'
          : '/student-dashboard'
      );
    } catch (err) {
      setLoading(false);
      onError?.(err.message || 'Erreur de connexion avec Google');
    }
  };

  return (
    <div className="flex justify-center">
      {loading ? (
        <div className="w-6 h-6 border-2 border-[#009688] border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => onError?.('Connexion Google échouée')}
          text="signup_with"
          locale="fr"
        />
      )}
    </div>
  );
};

export default GoogleLoginButton;
