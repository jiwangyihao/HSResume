import type { Badge } from "../types/resume";

export const badgeBgClass = (badge: Badge) => {
  switch (badge.category) {
    case "award":
      return "bg-yellow-600";
    case "metric":
      return "bg-emerald-600";
    case "traffic":
      return "bg-sky-600";
    case "event":
      return "bg-orange-600";
    case "tech":
      return "bg-indigo-600";
    case "business":
      return "bg-purple-600";
    case "platform":
      return "bg-teal-600";
    default:
      return "bg-gray-600";
  }
};

export const badgeBorderClass = (badge: Badge) => {
  switch (badge.category) {
    case "award":
      return "border-yellow-600";
    case "metric":
      return "border-emerald-600";
    case "traffic":
      return "border-sky-600";
    case "event":
      return "border-orange-600";
    case "tech":
      return "border-indigo-600";
    case "business":
      return "border-purple-600";
    case "platform":
      return "border-teal-600";
    default:
      return "border-gray-600";
  }
};

export const badgeText = (badge: Badge) => {
  if (badge.kind === "svg") return badge.alt ?? badge.url;
  if (badge.kind === "split") return `${badge.domain}/${badge.value}`;
  return badge.label;
};

export const getBadgeIcon = (badge: Badge) => {
  if (badge.icon) return badge.icon;

  switch (badge.category) {
    case "award":
      return "i-heroicons-trophy-solid";
    case "metric":
      return "i-heroicons-chart-bar-solid";
    case "traffic":
      return "i-heroicons-arrow-trending-up-solid";
    case "event":
      return "i-icon-park-solid-online-meeting";
    case "tech":
      return "i-heroicons-cpu-chip-solid";
    case "business":
      return "i-heroicons-briefcase-solid";
    case "platform":
      return "i-heroicons-building-library-solid";
    default:
      return undefined;
  }
};
