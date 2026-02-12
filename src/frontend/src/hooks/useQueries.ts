import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import type { UserProfile, Message, GameState, GameType } from '../backend';
import { queryKeys } from './queryKeys';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: queryKeys.callerProfile(),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(user: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: queryKeys.userProfile(user?.toString() || ''),
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !actorFetching && !!user,
    retry: false,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.callerProfile() });
    },
  });
}

// Presence Queries
export function useUpdatePresence() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePresence();
    },
  });
}

export function useDropPresence() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.dropPresence();
    },
  });
}

export function useNumActivePeers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<number>({
    queryKey: queryKeys.activePeers(),
    queryFn: async () => {
      if (!actor) return 0;
      const result = await actor.numActivePeers();
      return Number(result);
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });
}

// Chat Queries
export function useGetMessages(receiver: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: queryKeys.messages(receiver?.toString() || ''),
    queryFn: async () => {
      if (!actor || !receiver) return [];
      return actor.getMessages(receiver);
    },
    enabled: !!actor && !actorFetching && !!receiver,
    refetchInterval: 3000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiver, message }: { receiver: Principal; message: Message }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(receiver, message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages(variables.receiver.toString()) });
    },
  });
}

export function useClearMessages() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (receiver: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.clearMessages(receiver);
    },
    onSuccess: (_, receiver) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages(receiver.toString()) });
    },
  });
}

// Game Queries
export function useCreateGameChallenge() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ opponent, gameType }: { opponent: Principal; gameType: GameType }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createGameChallenge(opponent, gameType);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gameState(variables.opponent.toString()) });
    },
  });
}

export function useAcceptGameChallenge() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (challenger: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.acceptGameChallenge(challenger);
    },
    onSuccess: (_, challenger) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gameState(challenger.toString()) });
    },
  });
}

export function useGetGameState(opponent: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<GameState | null>({
    queryKey: queryKeys.gameState(opponent?.toString() || ''),
    queryFn: async () => {
      if (!actor || !opponent) return null;
      return actor.getGameState(opponent);
    },
    enabled: !!actor && !actorFetching && !!opponent,
    refetchInterval: 5000,
  });
}

export function useUpdateGameState() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ opponent, newState }: { opponent: Principal; newState: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateGameState(opponent, newState);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gameState(variables.opponent.toString()) });
    },
  });
}

export function useSetGameWinner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ opponent, winner }: { opponent: Principal; winner: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setGameWinner(opponent, winner);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gameState(variables.opponent.toString()) });
    },
  });
}
