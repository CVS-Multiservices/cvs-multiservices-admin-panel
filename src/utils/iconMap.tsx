import React from 'react';
import {
  Users, Award, Globe, Briefcase, Droplets, Mountain, Trash2, Wrench,
  ShieldCheck, TrendingUp, Target, Star, Building2, Package, Cpu, Shield,
  Activity, Truck, Rocket, Factory, HeartPulse, Coffee, Trophy, HardHat,
  Wallet, BookOpen, FlaskConical, Plane, Code, Megaphone, Calculator,
  Eye, Handshake, Crown, Users2, Clock, FolderKanban, MessageSquare,
  BriefcaseBusiness, Layers, Newspaper, Image, BarChart3,
  Zap, Flame, Leaf, Gem, CircleDot, Compass, Anchor, Gauge,
  Lightbulb, PenTool, Microscope, Radio, Satellite, Settings,
  Terminal, Wifi, Database, Server, Monitor, Smartphone, MapPin,
} from 'lucide-react';

export const iconMap: Record<string, React.FC<any>> = {
  Users, Award, Globe, Briefcase, Droplets, Mountain, Trash2, Wrench,
  ShieldCheck, TrendingUp, Target, Star, Building2, Package, Cpu, Shield,
  Activity, Truck, Rocket, Factory, HeartPulse, Coffee, Trophy, HardHat,
  Wallet, BookOpen, FlaskConical, Plane, Code, Megaphone, Calculator,
  Eye, Handshake, Crown, Users2, Clock, FolderKanban, MessageSquare,
  BriefcaseBusiness, Layers, Newspaper, Image, BarChart3,
  Zap, Flame, Leaf, Gem, CircleDot, Compass, Anchor, Gauge,
  Lightbulb, PenTool, Microscope, Radio, Satellite, Settings,
  Terminal, Wifi, Database, Server, Monitor, Smartphone, MapPin,
};

export function getIconComponent(iconName: string, className: string = 'w-5 h-5') {
  const IconComponent = iconMap[iconName] || Briefcase;
  return <IconComponent className={className} />;
}