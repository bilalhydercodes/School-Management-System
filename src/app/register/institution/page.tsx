import React from 'react';
import InstitutionRegistrationWizard from '@/components/registration/InstitutionRegistrationWizard';

export const metadata = {
  title: 'Register Institution — Alpha Edu Hub',
  description:
    'Register your school or college on Alpha Edu Hub. Complete our onboarding application to establish your multi-tenant institution workspace.',
};

export default function RegisterInstitutionPage() {
  return <InstitutionRegistrationWizard />;
}
