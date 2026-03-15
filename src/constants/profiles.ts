export const PROFILES = {
  PROFILE_1: 'פרופיל_1_לא_נשוי_נכה',
  PROFILE_2: 'פרופיל_2_לא_נשוי_לא_נכה_מעל_גיל_71_הכנסה_מתחת_ל_2375',
  PROFILE_3: 'פרופיל_3_לא_נשוי_לא_נכה_מעל_גיל_71_הכנסה_מעל_2375_לא_אקדמאי',
  PROFILE_ALL:'סה_כ_קשישים_באזור',
    PROFILE_AT_RISK: 'סה_כ_קשישים_במצבי_סיכון'
} as const;

export type ProfileKey = keyof typeof PROFILES;