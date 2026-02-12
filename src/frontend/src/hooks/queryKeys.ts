export const queryKeys = {
  callerProfile: () => ['currentUserProfile'] as const,
  userProfile: (userId: string) => ['userProfile', userId] as const,
  activePeers: () => ['activePeers'] as const,
  messages: (peerId: string) => ['messages', peerId] as const,
  gameState: (opponentId: string) => ['gameState', opponentId] as const,
};
