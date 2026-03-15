"use client";

import * as React from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { AnimatePresence, motion, Variants } from 'framer-motion';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Define the types for the props
export interface UniversalDropdownHeader {
  title: string;
  subtitle?: string;
  avatarUrl?: string; // either avatar image
  fallback?: string;
  icon?: React.ReactNode; // or an icon
}

export interface UniversalDropdownActionItem {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

export interface UniversalDropdownMenuItem {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  isDestructive?: boolean;
  hasArrow?: boolean;
}

export interface UniversalDropdownProps {
  trigger: React.ReactNode; 
  header?: UniversalDropdownHeader;
  actions?: UniversalDropdownActionItem[];
  menuItems: UniversalDropdownMenuItem[];
  align?: "center" | "end" | "start";
  className?: string; // allow customizing
}

export const UniversalDropdown: React.FC<UniversalDropdownProps> = ({ 
  trigger, 
  header, 
  actions, 
  menuItems,
  align = "start",
  className
}) => {
  const [isOpen, setIsOpen] = React.useState(false); 
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);

  // Animation variants for the dropdown content
  const contentVariants: Variants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300,
        staggerChildren: 0.05,
      },
    },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } },
  };

  // Animation variants for each menu item
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>

      <AnimatePresence>
        {isOpen && (
          <DropdownMenuContent
            asChild
            forceMount
            className={cn("w-64 p-2 bg-[#121214] border-white/10", className)}
            align={align}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
            >
              {/* Top section with info */}
              {header && (
                <>
                  <DropdownMenuLabel className="flex items-center gap-2 p-2">
                    {header.avatarUrl || header.fallback ? (
                      <Avatar className="h-9 w-9 border border-white/10">
                        {header.avatarUrl && <AvatarImage src={header.avatarUrl} alt={header.title} />}
                        <AvatarFallback>{header.fallback || header.title.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ) : header.icon ? (
                      <div className="h-9 w-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10">
                        {header.icon}
                      </div>
                    ) : null}
                    <div>
                      <p className="text-sm font-medium text-[#f5f5f7]">{header.title}</p>
                      {header.subtitle && <p className="text-xs text-muted-foreground">{header.subtitle}</p>}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="mx-2 bg-white/5" />
                </>
              )}
              
              {/* Quick actions section */}
              {actions && actions.length > 0 && (
                <>
                  <DropdownMenuGroup>
                    <div className="grid grid-cols-3 gap-1 p-1">
                      {actions.map((action) => (
                        <Button
                          key={action.label}
                          variant="ghost"
                          className="flex flex-col h-16 items-center justify-center gap-1 text-muted-foreground hover:bg-white/5 hover:text-[#f5f5f7] rounded-xl"
                          onClick={action.onClick}
                        >
                          <action.icon className="h-5 w-5" />
                          <span className="text-xs font-medium">{action.label}</span>
                        </Button>
                      ))}
                    </div>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="mx-2 mb-1 bg-white/5" />
                </>
              )}

              {/* Main menu items section */}
              <DropdownMenuGroup>
                {menuItems.map((item) => (
                  <motion.div variants={itemVariants} key={item.label}>
                    <DropdownMenuItem
                      onMouseEnter={() => setHoveredItem(item.label)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={cn(
                        'flex items-center justify-between p-2 text-sm relative rounded-lg cursor-pointer transition-colors',
                        item.isDestructive ? 'text-red-400 focus:text-red-300 focus:bg-red-500/10' : 'text-[#a1a1a6] focus:text-[#f5f5f7] focus:bg-white/5'
                      )}
                      onClick={item.onClick}
                    >
                      {hoveredItem === item.label && (
                         <motion.div
                          layoutId="dropdown-hover-bg"
                          className={cn(
                              "absolute inset-0 rounded-lg -z-10",
                              item.isDestructive ? "bg-red-500/10" : "bg-white/5"
                          )}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                         />
                      )}
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.hasArrow && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </DropdownMenuItem>
                  </motion.div>
                ))}
              </DropdownMenuGroup>
            </motion.div>
          </DropdownMenuContent>
        )}
      </AnimatePresence>
    </DropdownMenu>
  );
};
