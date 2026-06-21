const AVATAR_GRADIENTS = [
  "from-teal-500 to-cyan-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-green-600",
  "from-blue-500 to-indigo-600",
  "from-fuchsia-500 to-pink-600",
  "from-sky-500 to-blue-600",
] as const;

const hashString = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }

  return Math.abs(hash);
};

export const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const getAvatarGradient = (seed: string) => {
  const index = hashString(seed) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
};
