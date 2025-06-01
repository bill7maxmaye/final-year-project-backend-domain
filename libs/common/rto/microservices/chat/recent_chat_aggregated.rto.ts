import { UserRto } from '../auth/user.rto';
import { RecentChatRTO } from './recent_chat.rto';

export class RecentChatGatewayRTO {
  constructor(
    public chat: RecentChatRTO,
    public user: UserRto,
    public currentUser: UserRto,
  ) {}

  static fromRecentChatAndUsers(
    chat: RecentChatRTO,
    user: UserRto,
    currentUser: UserRto,
  ): RecentChatGatewayRTO {
    return new RecentChatGatewayRTO(chat, user, currentUser);
  }
}
