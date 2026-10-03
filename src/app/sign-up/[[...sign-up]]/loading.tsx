import React from 'react';
import BrandLoader from '@/components/ui/BrandLoader';

export default function SignUpLoading() {
  return <BrandLoader message="Preparing your registration" sublabel="Alpha Edu Hub" fullScreen={false} />;
}
