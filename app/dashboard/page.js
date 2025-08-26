'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

const Dashboard = () => {
  const { status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div>Dashboard</div>
  )
}

export default Dashboard