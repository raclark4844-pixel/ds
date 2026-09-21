import {
  Bot,
  Briefcase,
  Building2,
  ClipboardList,
  Globe,
  Home,
  ListOrdered,
  Scale,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { AppPath } from "@/lib/nav";

export const navIcons: Record<AppPath, LucideIcon> = {
  "/": Home,
  "/platform": Sparkles,
  "/websites": Globe,
  "/growth": TrendingUp,
  "/lead-generation": TrendingUp,
  "/automation": Bot,
  "/industries": Building2,
  "/contact": ClipboardList,
  "/work": Briefcase,
  "/process": ListOrdered,
  "/compare": Scale,
};
