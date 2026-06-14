export interface Vote {
  _id?: string;
  awardId: string; // The ID of the award category
  voterId: string; // The ID of the student who is voting
  candidateId: string; // The ID of the student being voted for
  createdAt: string; // ISO date string
}

export interface AwardCategory {
  id: string; // e.g. "batch-legend"
  title: string; // e.g. "Batch Legend"
  group: 'Fun' | 'Funny' | 'Engineering' | 'Friendship' | 'Secret' | 'Grand' | 'Secret Category';
  description?: string;
}

export const AWARD_CATEGORIES: AwardCategory[] = [
  // Fun Awards
  { id: 'batch-legend', title: 'Batch Legend', group: 'Fun' },
  { id: 'funniest-person', title: 'Funniest Person', group: 'Fun' },
  { id: 'most-helpful-friend', title: 'Most Helpful Friend', group: 'Fun' },
  { id: 'study-machine', title: 'Study Machine', group: 'Fun' },
  { id: 'tech-wizard', title: 'Tech Wizard', group: 'Fun' },
  { id: 'best-speaker', title: 'Best Speaker', group: 'Fun' },
  { id: 'coolest-person', title: 'Coolest Person', group: 'Fun' },
  { id: 'most-popular', title: 'Most Popular', group: 'Fun' },
  { id: 'hidden-genius', title: 'Hidden Genius', group: 'Fun' },
  { id: 'most-hardworking', title: 'Most Hardworking', group: 'Fun' },

  // Funny Awards
  { id: 'sleep-king-queen', title: 'Sleep King/Queen', group: 'Funny' },
  { id: 'always-late', title: 'Always Late Award', group: 'Funny' },
  { id: 'canteen-minister', title: 'Canteen Minister', group: 'Funny' },
  { id: 'instagram-celebrity', title: 'Instagram Celebrity', group: 'Funny' },
  { id: 'assignment-supplier', title: 'Assignment Supplier', group: 'Funny' },
  { id: 'drama-king-queen', title: 'Drama King/Queen', group: 'Funny' },
  { id: 'attendance-ghost', title: 'Attendance Ghost', group: 'Funny' },
  { id: 'dj-of-the-batch', title: 'DJ of the Batch', group: 'Funny' },
  { id: 'selfie-star', title: 'Selfie Star', group: 'Funny' },
  { id: 'reel-creator', title: 'Reel Creator of the Batch', group: 'Funny' },

  // Engineering Awards
  { id: 'last-minute-submission', title: 'Last Minute Submission Expert', group: 'Engineering' },
  { id: 'assignment-runner', title: 'Assignment Runner', group: 'Engineering' },
  { id: 'one-night-warrior', title: 'One Night Before Exam Warrior', group: 'Engineering' },
  { id: 'viva-survivor', title: 'Viva Survivor', group: 'Engineering' },
  { id: 'proxy-master', title: 'Proxy Attendance Master', group: 'Engineering' },
  { id: 'most-confused', title: 'Most Confused Engineer', group: 'Engineering' },
  { id: 'tea-coffee-addict', title: 'Tea/Coffee Addict', group: 'Engineering' },
  { id: 'future-startup-founder', title: 'Future Startup Founder', group: 'Engineering' },
  { id: 'future-ceo', title: 'Future CEO', group: 'Engineering' },
  { id: 'future-professor', title: 'Future Professor', group: 'Engineering' },

  // Friendship Awards
  { id: 'best-duo', title: 'Best Friendship Duo', group: 'Friendship' },
  { id: 'inseparable-friends', title: 'Inseparable Friends', group: 'Friendship' },
  { id: 'party-planner', title: 'Party Planner', group: 'Friendship' },
  { id: 'most-caring', title: 'Most Caring Friend', group: 'Friendship' },
  { id: 'always-available', title: 'Always Available Friend', group: 'Friendship' },
  { id: 'never-fails-to-laugh', title: 'Friend Who Never Fails To Make Us Laugh', group: 'Friendship' },

  // Secret Awards
  { id: 'most-likely-famous', title: 'Most Likely To Become Famous', group: 'Secret' },
  { id: 'most-likely-forget', title: 'Most Likely To Forget Everyone', group: 'Secret' },
  { id: 'most-likely-rich', title: 'Most Likely To Become Rich', group: 'Secret' },
  { id: 'most-likely-travel', title: 'Most Likely To Travel The World', group: 'Secret' },
  { id: 'most-likely-start-company', title: 'Most Likely To Start A Company', group: 'Secret' },
  { id: 'most-likely-late-10y', title: 'Most Likely To Still Be Late After 10 Years', group: 'Secret' },

  // Grand Awards
  { id: 'mr-signing-off', title: 'Mr. Signing Off 2026', group: 'Grand' },
  { id: 'miss-signing-off', title: 'Miss Signing Off 2026', group: 'Grand' },
  { id: 'hall-of-fame-winner', title: 'Hall Of Fame Winner', group: 'Grand' },
  { id: 'peoples-favourite', title: 'People\'s Favourite', group: 'Grand' },
  { id: 'batch-favourite', title: 'Batch Favourite', group: 'Grand' },

  // Secret Category
  { id: 'most-dangerous-bench', title: 'Most Dangerous Bench', group: 'Secret Category' },
  { id: 'most-dangerous-group', title: 'Most Dangerous Friend Group', group: 'Secret Category' },
  { id: 'biggest-gossip', title: 'Biggest Gossip Collector', group: 'Secret Category' },
  { id: 'bro-one-last-doubt', title: 'Most Likely To Say Bro One Last Doubt', group: 'Secret Category' },
  { id: 'assignment-at-1159', title: 'Most Likely To Ask Assignment At 11:59 PM', group: 'Secret Category' },
];
