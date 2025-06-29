'use client';

import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

export function Turnstile() {
  const { setValue } = useFormContext();

  // Define o callback global que será chamado pela Turnstile
  useEffect(() => {
    // Define no escopo global para o Turnstile encontrar
    (window as any).turnstileCallback = function (token: string) {
      setValue('turnstile', token);
    };

    if (!document.getElementById("cf-turnstile-script")) {
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [setValue]);

  return (
    <div
      className="cf-turnstile"
      data-sitekey={process.env.NEXT_PUBLIC_CF_SITEKEY}
      data-callback="turnstileCallback"
      data-theme="light"
    />
  );
}
