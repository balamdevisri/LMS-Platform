/**
 * SHAIVIKA LMS AI Platform - Communication Policy Guard Service
 * 
 * POLICY RULES:
 * 1. Platform is strictly designed for educational collaboration.
 * 2. NO private 1-on-1 chats, direct messages (DM), private inbox, friend requests, personal calls, video calls, or screen sharing.
 * 3. Allowed: Group Discussions (Minimum 3 Members), Forum Threads, Project Groups, Coding Help, AI Mentor, Polls, Announcements.
 * 4. Group Restrictions:
 *    - Minimum Members: 3
 *    - Maximum Members: 100 (configurable)
 *    - If group < 3 members: Lock posting & show policy warning.
 */

export const COMMUNICATION_POLICY = {
  MIN_GROUP_MEMBERS: 3,
  MAX_GROUP_MEMBERS: 100,
  WARNING_MESSAGE: 'Groups must contain at least 3 members. Personal communication is not supported on this platform.',
  DISABLED_FEATURES_NOTICE: 'Private messaging, Direct Messages (DM), 1-on-1 chats, and personal calls are strictly disabled by platform security policy.',
} as const;

export interface GroupValidationResult {
  allowed: boolean;
  memberCount: number;
  reason?: string;
}

class CommunicationPolicyService {
  /**
   * Validate if a group meets the minimum 3 member requirement for posting/discussion.
   */
  validateGroupActivity(memberCount: number): GroupValidationResult {
    if (memberCount < COMMUNICATION_POLICY.MIN_GROUP_MEMBERS) {
      return {
        allowed: false,
        memberCount,
        reason: COMMUNICATION_POLICY.WARNING_MESSAGE,
      };
    }
    return {
      allowed: true,
      memberCount,
    };
  }

  /**
   * Always blocks private 1-on-1 direct message attempts.
   */
  validateDirectMessage(): GroupValidationResult {
    return {
      allowed: false,
      memberCount: 2,
      reason: COMMUNICATION_POLICY.DISABLED_FEATURES_NOTICE,
    };
  }
}

export const communicationPolicyService = new CommunicationPolicyService();
