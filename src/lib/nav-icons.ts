import {
  Bot,
  Briefcase,
  Building2,
  ClipboardList,
  Globe,
  Home,
  ListOrdered,
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
  "/automation": Bot,
  "/industries": Building2,
  "/contact": ClipboardList,
  "/work": Briefcase,
  "/process": ListOrdered,
};
