import { Redirect } from 'expo-router';
import React, { useState, useEffect } from 'react';

// Imports do Firebase
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/services/firebaseConfig';

export default function Index() {
  // Por enquanto esse procedimento poderia falhar, porque antes do app carregar o currentUser é NULL, então o certo é fazer um loading aqui, splash screen sei la
  // Fiz um temporário
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLogin = onAuthStateChanged(auth, () => {
      setLoading(false);
    });

    return getLogin;
  }, []);

  if (loading) return null;


  //Verificando se o usuário ja está logado e então redirecionando ele pra tela adequada
  if (auth.currentUser) {
    return <Redirect href="/(hub)/dashboard" />;
  }
  
  return <Redirect href="/(login)/login" />;
}