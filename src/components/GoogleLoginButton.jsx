import React, { useContext, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const GoogleLoginButton = ({ onError }) => {
  const { googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (response) => {
    setLoading(true);
    try {
      await googleLogin(response.credential);
      navigate('/student-dashboard');
    } catch (err) {
      setLoading(false);
      onError?.(err.message || 'Erreur de connexion avec Google');
    }
  };

  return (
    <div className="flex justify-center">
      {loading ? (
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
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