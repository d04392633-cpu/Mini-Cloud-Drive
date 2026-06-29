import React from 'react';
import { Menu, HardDrive } from 'lucide-react';

interface MobileHeaderProps {
  onMenuToggle: () => void;
  title: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuToggle, title }) => {
  return (
    <header className="mobile-header" id="mobile-header-bar">
      <button className="mobile-menu-btn" onClick={onMenuToggle} aria-label="Open menu" id="btn-mobile-menu">
        <Menu style={{ width: 22, height: 22 }} />
      </button>
      <div className="mobile-header-title">
        <HardDrive style={{ width: 16, height: 16, color: 'var(--color-primary)' }} />
        <span>{title}</span>
      </div>
      <div style={{ width: 44 }} /> {/* Spacer to balance the hamburger button */}
    </header>
  );
};
