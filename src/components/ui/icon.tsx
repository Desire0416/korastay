import {
  Search, Compass, Heart, CalendarCheck, User, LayoutDashboard, Star,
  MessageCircle, Bell, Shield, Home, Calendar, Wallet, Tags, Briefcase,
  FileText, Users, Receipt, Building2, CreditCard, RotateCcw, MapPin,
  Handshake, ScrollText, Wifi, Snowflake, CookingPot, Droplets, Car, Tv,
  Coffee, Sparkles, Trees, ShieldCheck, Zap, Waves, WashingMachine, Laptop,
  ArrowUpDown, Download, Settings, Wand2, Newspaper, Trash2, Languages,
  Banknote, HelpCircle, type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Search, Compass, Heart, CalendarCheck, User, LayoutDashboard, Star,
  MessageCircle, Bell, Shield, Home, Calendar, Wallet, Tags, Briefcase,
  FileText, Users, Receipt, Building2, CreditCard, RotateCcw, MapPin,
  Handshake, ScrollText, Wifi, Snowflake, CookingPot, Droplets, Car, Tv,
  Coffee, Sparkles, Trees, ShieldCheck, Zap, Waves, WashingMachine, Laptop,
  ArrowUpDown, Download, Settings, Wand2, Newspaper, Trash2, Languages, Banknote,
};

export function getIcon(name?: string | null): LucideIcon {
  if (!name) return HelpCircle;
  return ICONS[name] ?? HelpCircle;
}

export function Icon({
  name,
  className,
}: {
  name?: string | null;
  className?: string;
}) {
  const Cmp = getIcon(name);
  return <Cmp className={className} />;
}
