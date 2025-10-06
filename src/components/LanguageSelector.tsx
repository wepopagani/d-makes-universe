import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const getCurrentLanguageLabel = () => {
    switch(i18n.language) {
      case 'en': return 'EN';
      case 'fr': return 'FR';
      case 'de': return 'DE';
      default: return 'IT';
    }
  };

  const getCurrentFlag = () => {
    switch(i18n.language) {
      case 'en': return '🇺🇸';
      case 'fr': return '🇫🇷';
      case 'de': return '🇩🇪';
      default: return '🇮🇹';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="text-sm">{getCurrentFlag()}</span>
          <span className="text-sm font-medium">{getCurrentLanguageLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => changeLanguage('it')}
          className={`flex items-center gap-2 ${i18n.language === 'it' ? 'bg-accent' : ''}`}
        >
          <span>🇮🇹</span>
          <span>Italiano</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('en')}
          className={`flex items-center gap-2 ${i18n.language === 'en' ? 'bg-accent' : ''}`}
        >
          <span>🇺🇸</span>
          <span>English</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('fr')}
          className={`flex items-center gap-2 ${i18n.language === 'fr' ? 'bg-accent' : ''}`}
        >
          <span>🇫🇷</span>
          <span>Français</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('de')}
          className={`flex items-center gap-2 ${i18n.language === 'de' ? 'bg-accent' : ''}`}
        >
          <span>🇩🇪</span>
          <span>Deutsch</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector; 