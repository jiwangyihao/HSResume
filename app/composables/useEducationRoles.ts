export type EducationRoleKind = "leader" | "assistant" | "default";

const getRoleIcon = (role: string) => {
  const r = role.toLowerCase();
  if (r.includes("团支书") || r.includes("secretary"))
    return "i-heroicons-flag";
  if (r.includes("代表") || r.includes("representative"))
    return "i-heroicons-megaphone";
  if (r.includes("部长") || r.includes("head") || r.includes("lead"))
    return "i-heroicons-briefcase";
  if (
    r.includes("技术") ||
    r.includes("开源") ||
    r.includes("lug") ||
    r.includes("tech")
  )
    return "i-heroicons-command-line";
  return "i-heroicons-user";
};

const getRoleColor = (role: string) => {
  return "text-sky-500 dark:text-sky-400";
};

export const useEducationRoles = () => {
  return {
    getRoleIcon,
    getRoleColor,
  };
};
