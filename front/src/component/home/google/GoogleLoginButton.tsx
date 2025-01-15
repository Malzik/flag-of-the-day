import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { identifyUser } from '../../../store/action/auth';
import { useLocalStorage } from '../../../utils/useLocalStorage';

const GoogleLoginButton: React.FC = () => {
  const [profile] = useLocalStorage('profile', '')
  const dispatch = useDispatch();

  const handleLoginSuccess = (credentialResponse: any) => {
    dispatch(identifyUser(credentialResponse, profile.id) as any);
  };

  const handleLoginFailure = () => {
    console.log('Login Failed');
  };

  return (
    <GoogleLogin
      onSuccess={handleLoginSuccess}
      onError={handleLoginFailure}
    />
  );
};

export default GoogleLoginButton;
