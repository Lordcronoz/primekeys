"use client";

import * as React from 'react';
import { MessageSquare, Settings, User, LogOut, ChevronRight, Crown, type LucideIcon } from 'lucide-react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserProfile {
  name: string;
  handle: string;
  avatarUrl?: string;
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

interface ActionItem {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

interface MenuItem {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  isDestructive?: boolean;
  hasArrow?: boolean;
}

interface UserProfileDropdownProps {
  user: UserProfile;
  actions?: ActionItem[];
  menuItems?: MenuItem[];
  onSignOut?: () => void;
}

const TIER_COLORS: Record<string, { color: string; glow: string; bg: string; border: string }> = {
  Bronze:   { color: '#cd7f32', glow: 'rgba(205,127,50,0.2)',   bg: 'rgba(205,127,50,0.07)',  border: 'rgba(205,127,50,0.3)'  },
  Silver:   { color: '#c0c0c0', glow: 'rgba(192,192,192,0.2)', bg: 'rgba(192,192,192,0.07)', border: 'rgba(192,192,192,0.3)' },
  Gold:     { color: '#D4AF37', glow: 'rgba(212,175,55,0.2)',  bg: 'rgba(212,175,55,0.07)',  border: 'rgba(212,175,55,0.3)'  },
  Platinum: { color: '#e5e4e2', glow: 'rgba(229,228,226,0.2)', bg: 'rgba(229,228,226,0.07)', border: 'rgba(229,228,226,0.3)' },
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  user,
  actions,
  menuItems,
  onSignOut,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const tier = user.tier || 'Bronze';
  const t = TIER_COLORS[tier] || TIER_COLORS.Bronze;

const defaultActions: ActionItem[] = actions || [
  { icon: MessageSquare, label: 'Support', onClick: () => window.open('https://wa.me/918111956481', '_blank') },
  { icon: Settings,      label: 'Settings', onClick: () => window.location.href = '/portal?tab=settings' },
  { icon: User,          label: 'Profile',  onClick: () => window.location.href = '/portal?tab=profile'  },
]

const defaultMenuItems: MenuItem[] = menuItems || [
  { icon: User,     label: 'Account Settings', hasArrow: true, onClick: () => window.location.href = '/portal?tab=settings' },
  { icon: Settings, label: 'Preferences',       hasArrow: true, onClick: () => window.location.href = '/portal?tab=preferences' },
  { icon: LogOut,   label: 'Sign Out', isDestructive: true, onClick: onSignOut },
]
  const dropdownVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.94,
      y: -12,
      filter: 'blur(8px)',
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 28,
        stiffness: 380,
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -8,
      filter: 'blur(6px)',
      transition: {
        duration: 0.16,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const rowVariants: Variants = {
    hidden:  { opacity: 0, y: 8  },
    visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>

      {/* ── Avatar trigger ── */}
      <DropdownMenuTrigger asChild>
        <button
          className="relative outline-none flex-shrink-0"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: isOpen ? t.bg : 'rgba(212,175,55,0.06)',
            border: `1.5px solid ${isOpen ? t.color : 'rgba(212,175,55,0.22)'}`,
            boxShadow: isOpen
              ? `0 0 0 3px ${t.glow}, 0 0 16px ${t.glow}`
              : 'none',
            transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <span
            className="text-xs font-bold"
            style={{ color: t.color }}
          >
            {user.name.charAt(0)}
          </span>

          {/* Green live dot */}
          <span
            style={{
              position: 'absolute',
              bottom: 1,
              right: 1,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#2dcc6e',
              border: '1.5px solid #000',
              boxShadow: '0 0 6px rgba(45,204,110,0.7)',
            }}
          />
        </button>
      </DropdownMenuTrigger>

      {/* ── Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <DropdownMenuContent
            asChild
            forceMount
            align="end"
            sideOffset={9}
            collisionPadding={{ top: 60, right: 12 }}
            className="p-0 border-0 bg-transparent shadow-none"
            style={{ width: 280, zIndex: 9999 }}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={dropdownVariants}
              style={{
                width: 280,
                borderRadius: 18,
                overflow: 'hidden',
                background: 'rgba(10,10,12,0.75)',
                backdropFilter: 'blur(60px) saturate(180%) brightness(1.1)',
                WebkitBackdropFilter: 'blur(60px) saturate(180%) brightness(1.1)',
                border: '1px solid rgba(255,255,255,0.09)',
                boxShadow: `
                  0 0 0 0.5px rgba(255,255,255,0.04) inset,
                  0 24px 64px rgba(0,0,0,0.85),
                  0 8px 24px rgba(0,0,0,0.6),
                  0 0 0 1px rgba(0,0,0,0.5),
                  0 0 60px ${t.glow}
                `,
              }}
            >

              {/* ── Header ── */}
              <motion.div
                variants={rowVariants}
                style={{
                  padding: '20px 20px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                {/* Avatar square */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: t.bg,
                    border: `1px solid ${t.border}`,
                    boxShadow: `0 0 20px ${t.glow}`,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 18, fontWeight: 700, color: t.color }}>
                    {user.name.charAt(0)}
                  </span>
                </div>

                {/* Name block */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#f0f0f0',
                      letterSpacing: '-0.015em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {user.name}
                    </span>
                    {/* Tier pill */}
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '2px 7px',
                      borderRadius: 999,
                      background: t.bg,
                      color: t.color,
                      border: `0.5px solid ${t.border}`,
                      flexShrink: 0,
                    }}>
                      <Crown size={7} />
                      {tier}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.28)',
                    letterSpacing: '-0.01em',
                  }}>
                    {user.handle}
                  </span>
                </div>
              </motion.div>

              {/* ── Quick actions ── */}
              <motion.div
                variants={rowVariants}
                style={{
                  padding: '14px 14px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                }}
              >
                {defaultActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 7,
                      padding: '14px 8px',
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget
                      el.style.background = 'rgba(212,175,55,0.09)'
                      el.style.borderColor = 'rgba(212,175,55,0.25)'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget
                      el.style.background = 'rgba(255,255,255,0.03)'
                      el.style.borderColor = 'rgba(255,255,255,0.07)'
                    }}
                  >
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: 'rgba(212,175,55,0.08)',
                      border: '1px solid rgba(212,175,55,0.15)',
                      display: 'grid',
                      placeItems: 'center',
                    }}>
                      <action.icon size={14} color="rgba(212,175,55,0.85)" />
                    </div>
                    <span style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.09em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.4)',
                    }}>
                      {action.label}
                    </span>
                  </button>
                ))}
              </motion.div>

              {/* ── Menu items ── */}
              <motion.div
                variants={rowVariants}
                style={{ padding: '8px 8px' }}
              >
                {defaultMenuItems.map((item, i) => (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 12,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      marginBottom: i < defaultMenuItems.length - 1 ? 2 : 0,
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = item.isDestructive
                        ? 'rgba(255,68,68,0.08)'
                        : 'rgba(255,255,255,0.05)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Icon box */}
                      <div style={{
                        width: 30,
                        height: 30,
                        borderRadius: 9,
                        background: item.isDestructive
                          ? 'rgba(255,68,68,0.1)'
                          : 'rgba(212,175,55,0.08)',
                        border: `1px solid ${item.isDestructive
                          ? 'rgba(255,68,68,0.2)'
                          : 'rgba(212,175,55,0.15)'}`,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}>
                        <item.icon
                          size={13}
                          color={item.isDestructive ? '#ff5555' : '#D4AF37'}
                        />
                      </div>
                      <span style={{
                        fontSize: 13,
                        fontWeight: 500,
                        letterSpacing: '-0.01em',
                        color: item.isDestructive
                          ? '#ff6b6b'
                          : 'rgba(255,255,255,0.75)',
                      }}>
                        {item.label}
                      </span>
                    </div>
                    {item.hasArrow && (
                      <ChevronRight size={13} color="rgba(255,255,255,0.15)" />
                    )}
                  </button>
                ))}
              </motion.div>

              {/* ── Gold accent line ── */}
              <div style={{
                height: 1,
                margin: '4px 16px 12px',
                borderRadius: 999,
                background: `linear-gradient(90deg, transparent, ${t.color}44, transparent)`,
              }} />

            </motion.div>
          </DropdownMenuContent>
        )}
      </AnimatePresence>
    </DropdownMenu>
  );
};