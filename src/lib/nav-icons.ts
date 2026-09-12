import {
  Bot,
  Briefcase,
  ClipboardList,
  FileStack,
  Globe,
  Home,
  Layers,
  ListOrdered,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { AppPath } from "@/lib/nav";

export const navIcons: Record<AppPath, LucideIcon> = {
  "/": Home,
  "/websites": Globe,
  "/growth": TrendingUp,
  "/automation": Bot,
  "/claims": FileStack,
  "/contact": ClipboardList,
  "/work": Briefcase,
  "/industries": Layers,
  "/industries/landscaping": Layers,
  "/industries/hospitality": Layers,
  "/industries/stores": Layers,
  "/industries/service-companies": Layers,
  "/industries/contractors": Layers,
  "/industries/professionals": Layers,
  "/process": ListOrdered,
};
