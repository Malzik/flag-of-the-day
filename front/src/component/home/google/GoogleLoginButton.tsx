import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { identifyUser } from '../../../store/action/auth';
import { useLocalStorage } from '../../../utils/useLocalStorage';

const GoogleLoginButton: React.FC = () => {
  const [profile] = useLocalStorage('profile', '')
  const dispatch = useDispatch();

  const handleLoginSuccess = (credentialResponse: any) => {
    console.log(credentialResponse);
    // Here you would typically send the credential to your backend
    // and get a response with the user's information
    // For now, we'll just dispatch a success action with the credential
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