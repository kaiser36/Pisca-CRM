"use client";

import React from 'react';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Footer: React.FC = () => {
  return (
    <footer className="py-2 border-t bg-background text-center text-sm text-muted-foreground">
      <MadeWithDyad />
    </footer>
  );
};

export default Footer;