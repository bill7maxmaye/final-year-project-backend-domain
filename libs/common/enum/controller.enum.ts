export enum CONTROLLER {
  // 1. User Authentication and Profiles
  AUTH = 'auth',
  PROFILES = 'profiles',
  PROFILE_SETTINGS = 'profile-settings',
  ACCOUNT = 'account',
  SECURITY = 'security',

  // 2. Social Posts
  SOCIAL_POSTS = 'social-posts',
  SOCIAL_COMMENTS = 'social-comments',
  SOCIAL_REACTIONS = 'social-reactions',
  SOCIAL_SAVED_POSTS = 'social-saved-posts',
  SOCIAL_HIDDEN_POSTS = 'social-hidden-posts',
  HASHTAGS = 'hashtags',
  TRENDS = 'trends',

  // 3. Reels (Short Videos)
  REELS = 'reels',
  TRENDING_REELS = 'trending-reels',

  // 4. Gifting System
  GIFTS = 'gifts',
  GIFT_HISTORY = 'gift-history',
  GIFT_LEADERBOARD = 'gift-leaderboard',
  IN_APP_CURRENCY = 'in-app-currency',

  // 5. Live Streaming
  LIVE_STREAMS = 'live-streams',
  LIVE_STREAM_EVENTS = 'live-stream-events',
  LIVE_STREAM_VIEWERS = 'live-stream-viewers',

  // 6. Notifications
  NOTIFICATIONS = 'notifications',
  NOTIFICATION_SETTINGS = 'notification-settings',

  // 7. Search and Discovery
  SEARCH = 'search',
  EXPLORE = 'explore',
  RECOMMENDATIONS = 'recommendations',
  LOCATIONS = 'locations',

  // 8. Messaging
  MESSAGES = 'messages',
  GROUP_CHATS = 'group-chats',
  MESSAGE_REACTIONS = 'message-reactions',
  READ_RECEIPTS = 'read-receipts',
  MESSAGE_SEARCH = 'message-search',
  SAVED_MESSAGES = 'saved-messages',
  PINNED_MESSAGES = 'pinned-messages',

  // 9. Settings
  LANGUAGES = 'languages',
  REGIONS = 'regions',
  DATA_STORAGE = 'data-storage',

  // 10. Monetization (Core)
  IN_APP_PURCHASES = 'in-app-purchases',
  ADVERTISEMENTS = 'advertisements',
  GIFTING_ECONOMY = 'gifting-economy',

  //Other Controllers
  FILES = 'files',
  IMAGES = 'images',
  VIDEOS = 'videos',
  STORAGE = 'storage',
}
