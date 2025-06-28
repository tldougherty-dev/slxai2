import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only absolute left-2 top-2 z-50 bg-white text-electric-blue px-4 py-2 rounded shadow-lg">Skip to main content</a>
    </>
  );
};

export default Navigation;
