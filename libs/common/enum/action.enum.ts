export enum ACTION {
  // 1. User Authentication and Profiles
  REGISTER = 'register',
  LOGIN = 'login',
  VERIFY_EMAIL = 'verify-email',
  RESEND_VERIFICATION_EMAIL = 'resend-verification-email',
  LOGOUT = 'logout',
  UPDATE_EMAIL = 'update-email',
  CONFIRM_EMAIL = 'confirm-email',
  CHANGE_PASSWORD = 'change-password',
  CONFIRM_PASSWORD = 'confirm-password',
  VERIFY_TOKEN = 'verify-token',
  SWITCH_CONTEXT = 'switch-context',
  FORGOT_PASSWORD = 'forgot-password',
  RESET_PASSWORD = 'reset-password',
  RESEND_VERIFICATION = 'resend-verification',
  PROFILE_ME = 'profile-me',
  UNBLOCK_USER = 'unblock-user',
  ADD_SECONDARY_EMAIL = 'add-secondary-email',
  REMOVE_SECONDARY_EMAIL = 'remove-secondary-email',
  RETRIEVE_PROFILE_VIEW_MAP = 'retrieve-profile-view-map',
  UPDATE_PREFERENCES = 'update-preferences',

  // 2. Social Posts
  CREATE_POST = 'create-post',
  UPDATE_POST = 'update-post',
  DELETE_POST = 'delete-post',
  GET_MANY = 'get-many',
  GET = 'get',
  RETRIEVE_POST = 'retrieve-post',
  LIKE_POST = 'like-post',
  UNLIKE_POST = 'unlike-post',
  COMMENT_POST = 'comment-post',
  SHARE_POST = 'share-post',
  SAVE_POST = 'save-post',
  UNSAVE_POST = 'unsave-post',
  TAG_USER = 'tag-user',
  RETRIEVE_POST_ANALYTICS = 'retrieve-post-analytics',
  UPDATE_POST_NOTIFICATION = 'update-post-notification',
  HIDE_POST = 'hide-post',
  UNHIDE_POST = 'unhide-post',

  // 3. Reels (Short Videos)
  CREATE_REEL = 'create-reel',
  UPDATE_REEL = 'update-reel',
  DELETE_REEL = 'delete-reel',
  RETRIEVE_REEL = 'retrieve-reel',
  LIKE_REEL = 'like-reel',
  UNLIKE_REEL = 'unlike-reel',
  COMMENT_REEL = 'comment-reel',
  SHARE_REEL = 'share-reel',
  RETRIEVE_REEL_ANALYTICS = 'retrieve-reel-analytics',
  LIST_TRENDING_REELS = 'list-trending-reels',

  // 4. Gifting System
  SEND_GIFT = 'send-gift',
  RETRIEVE_GIFT_HISTORY = 'retrieve-gift-history',
  RETRIEVE_GIFT_LEADERBOARD = 'retrieve-gift-leaderboard',
  PURCHASE_IN_APP_CURRENCY = 'purchase-in-app-currency',

  // 5. Live Streaming
  START_LIVE_STREAM = 'start-live-stream',
  GET_LIVE_STREAM_URL = 'get-live-stream-url',
  STOP_LIVE_STREAM = 'stop-live-stream',
  SEND_LIVE_STREAM_REACTION = 'send-live-stream-reaction',
  SEND_LIVE_STREAM_GIFT = 'send-live-stream-gift',
  RETRIEVE_LIVE_STREAM_ANALYTICS = 'retrieve-live-stream-analytics',
  SAVE_LIVE_STREAM = 'save-live-stream',

  // 6. Notifications
  RETRIEVE_NOTIFICATIONS = 'retrieve-notifications',
  UPDATE_NOTIFICATION_SETTINGS = 'update-notification-settings',

  // 7. Search and Discovery
  SEARCH = 'search',
  EXPLORE = 'explore',
  RECOMMENDATIONS = 'recommendations',
  LOCATIONS = 'locations',

  // 8. Messaging
  SEND_MESSAGE = 'send-message',
  RETRIEVE_MESSAGES = 'retrieve-messages',
  CREATE_GROUP_CHAT = 'create-group-chat',
  ADD_GROUP_MEMBER = 'add-group-member',
  REMOVE_GROUP_MEMBER = 'remove-group-member',
  REACT_TO_MESSAGE = 'react-to-message',
  READ_MESSAGE = 'read-message',
  SEARCH_MESSAGES = 'search-messages',
  SAVE_MESSAGE = 'save-message',
  UNSAVE_MESSAGE = 'unsave-message',
  PIN_MESSAGE = 'pin-message',
  UNPIN_MESSAGE = 'unpin-message',
  CLEAR_HISTORY = 'clear-history',

  // 9. Settings
  LANGUAGES = 'languages',
  REGIONS = 'regions',
  DATA_STORAGE = 'data-storage',

  // 10. Monetization
  PURCHASE_ITEMS = 'purchase-items',
  VIEW_ADS = 'view-ads',
  EARN_FROM_GIFTS = 'earn-from-gifts',

  // Generic Actions (Can be used across multiple controllers)
  CREATE = 'create',
  RETRIEVE = 'retrieve',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST_ALL = 'list-all',
}
