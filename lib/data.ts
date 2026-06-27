// FIFA 2026 Team Flags & Data
export const TEAM_FLAGS: Record<string, string> = {
  'Argentina': '🇦🇷', 'Brazil': '🇧🇷', 'France': '🇫🇷', 'Germany': '🇩🇪',
  'Spain': '🇪🇸', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Italy': '🇮🇹', 'Netherlands': '🇳🇱',
  'Portugal': '🇵🇹', 'Belgium': '🇧🇪', 'Croatia': '🇭🇷', 'Uruguay': '🇺🇾',
  'Colombia': '🇨🇴', 'USA': '🇺🇸', 'Mexico': '🇲🇽', 'Canada': '🇨🇦',
  'Costa Rica': '🇨🇷', 'Saudi Arabia': '🇸🇦', 'Japan': '🇯🇵', 'South Korea': '🇰🇷',
  'Australia': '🇦🇺', 'Serbia': '🇷🇸', 'Cameroon': '🇨🇲', 'Ghana': '🇬🇭',
  'Iran': '🇮🇷', 'Poland': '🇵🇱', 'Denmark': '🇩🇰', 'Switzerland': '🇨🇭',
  'Sweden': '🇸🇪', 'Senegal': '🇸🇳', 'Morocco': '🇲🇦', 'Tunisia': '🇹🇳',
  'Egypt': '🇪🇬', 'Nigeria': '🇳🇬', 'Chile': '🇨🇱', 'Peru': '🇵🇪',
  'Ecuador': '🇪🇨', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Türkiye': '🇹🇷', 'Romania': '🇷🇴', 'Hungary': '🇭🇺', 'Austria': '🇦🇹',
  'Czechia': '🇨🇿', 'Ukraine': '🇺🇦', 'Greece': '🇬🇷', 'Norway': '🇳🇴',
  'Finland': '🇫🇮', 'Iceland': '🇮🇸', 'Haiti': '🇭🇹', 'Curaçao': '🇨🇼',
  'Cape Verde': '🇨🇻', 'New Zealand': '🇳🇿', 'Bosnia-Herz': '🇧🇦', 'Qatar': '🇶🇦',
  'Paraguay': '🇵🇾', 'Ivory Coast': '🇨🇮', 'Jordan': '🇯🇴',
  'Algeria': '🇩🇿', 'Congo DR': '🇨🇩', 'Uzbekistan': '🇺🇿', 'Panama': '🇵🇦',
  'Iraq': '🇮🇶', 'South Africa': '🇿🇦', 'TBD': '❓'
};

export const TEAMS_BY_GROUP: Record<string, string[]> = {
  'A': ['Mexico', 'USA', 'Canada', 'Costa Rica'],
  'B': ['Brazil', 'Argentina', 'Uruguay', 'Paraguay'],
  'C': ['France', 'Germany', 'Spain', 'Italy'],
  'D': ['England', 'Netherlands', 'Belgium', 'Switzerland'],
  'E': ['Japan', 'South Korea', 'Australia', 'Saudi Arabia'],
  'F': ['Portugal', 'Denmark', 'Poland', 'Croatia'],
  'G': ['Morocco', 'Senegal', 'Egypt', 'Nigeria'],
  'H': ['Colombia', 'Ecuador', 'Chile', 'Peru'],
  'I': ['Cameroon', 'Ghana', 'Tunisia', 'Ivory Coast'],
  'J': ['Iran', 'Uzbekistan', 'Qatar', 'Jordan'],
  'K': ['Norway', 'Sweden', 'Finland', 'Wales'],
  'L': ['Türkiye', 'Czechia', 'Austria', 'Romania'],
  'M': ['Hungary', 'Ukraine', 'Greece', 'Scotland'],
  'N': ['Serbia', 'Iceland', 'Curaçao', 'Haiti'],
  'O': ['Cape Verde', 'New Zealand', 'Bosnia-Herz', 'Congo DR'],
  'P': ['Pennsylvania', 'Iraq', 'South Africa', 'Algeria'],
};

export function getTeamFlag(team: string): string {
  return TEAM_FLAGS[team] || '⚽';
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatRound(round: string): string {
  const labels: Record<string, string> = {
    'group_stage': 'Group Stage Group Stage',
    'round_of_32': 'Round of 32',
    'round_of_16': 'Round of 16',
    'quarter_finals': 'Quarter Finals',
    'semi_finals': 'Semi Finals',
    'final': 'Grand Final'
  };
  return labels[round] || round.replace(/_/g, ' ');
}
