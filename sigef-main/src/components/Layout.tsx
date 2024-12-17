import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeToggle } from './theme/ThemeToggle';
import Sidebar from './sidebar/Sidebar';
import { supabase } from '@/integrations/supabase/client';

const Layout = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogoUrl = async () => {
      try {
        const { data: { publicUrl } } = supabase
          .storage
          .from('system-assets')
          .getPublicUrl('logo.png');
        
        setLogoUrl(publicUrl);
      } catch (error) {
        console.error('Error fetching logo:', error);
      }
    };

    fetchLogoUrl();
  }, []);

  return (
    <div className="relative flex h-screen overflow-hidden bg-gradient-to-br from-background to-background/80 backdrop-blur-lg">
      <div 
        className="absolute top-0 left-0 h-screen z-50"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div 
          className={`h-full relative transition-all duration-300 ease-in-out group hover:w-64 ${isExpanded ? 'w-64' : 'w-16'}`}
        >
          <div className="flex flex-col h-full glass">
            <div className="flex items-center justify-center h-16">
              <div className={`flex items-center ${isExpanded ? 'w-full px-4' : 'w-10 justify-center'}`}>
                {logoUrl && (
                  <img 
                    src={logoUrl}
                    alt="SiGeF Logo" 
                    className={`transition-all duration-300 ${isExpanded ? 'w-8' : 'w-6'}`}
                  />
                )}
                <div className={`flex flex-col items-center transition-opacity duration-300 ${isExpanded ? 'opacity-100 ml-3' : 'opacity-0'}`}>
                  <span className="font-semibold text-lg text-primary">
                    SiGeF
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Sistema de Gestão Financeira
                  </span>
                </div>
              </div>
            </div>
            <Sidebar isExpanded={isExpanded} />
          </div>
        </div>
      </div>

      <main className="flex-1 w-full pl-16 overflow-y-auto p-6 animate-enter">
        <div className="container mx-auto space-y-6">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;