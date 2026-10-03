import React from 'react';
import BrandLoader from '@/components/ui/BrandLoader';

export default function SignInLoading() {
  return <BrandLoader message="Connecting secure authentication..." sublabel="Alpha Edu Hub" />;
}
