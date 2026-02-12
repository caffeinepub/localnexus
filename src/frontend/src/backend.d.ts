import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Message {
    image_payload?: Uint8Array;
    text: string;
    sender: Principal;
}
export interface GameState {
    winner?: Principal;
    state: string;
    currentTurn: Principal;
    player1: Principal;
    player2: Principal;
    gameType: GameType;
}
export interface UserProfile {
    name: string;
}
export enum GameType {
    ConnectFour = "ConnectFour",
    TicTacToe = "TicTacToe"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptGameChallenge(challenger: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearMessages(receiver: Principal): Promise<void>;
    createGameChallenge(opponent: Principal, gameType: GameType): Promise<void>;
    dropPresence(): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGameState(opponent: Principal): Promise<GameState | null>;
    getMessages(receiver: Principal): Promise<Array<Message>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    numActivePeers(): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(receiver: Principal, msg: Message): Promise<void>;
    setGameWinner(opponent: Principal, winner: Principal): Promise<void>;
    updateGameState(opponent: Principal, newState: string): Promise<void>;
    updatePresence(): Promise<bigint>;
}
