"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ContainerCreationPage from '../container-creation/page';

export default function ContainerOrchestrationRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/container-creation');
  }, [router]);

  return <ContainerCreationPage />;
}
