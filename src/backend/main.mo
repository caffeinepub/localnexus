import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import List "mo:core/List";

actor {
  /***************************************/
  /***    AUTH & STATE MANAGEMENT      ***/
  /***************************************/
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  /***************************************/
  /***       USER PROFILES             ***/
  /***************************************/
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  /***************************************/
  /***    PRESENCE & PEER DISCOVERY    ***/
  /***************************************/
  var nextPresenceKey = 0;
  let presenceKeys = Map.empty<Principal, Nat>();

  public shared ({ caller }) func updatePresence() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update presence");
    };
    let key = nextPresenceKey;
    presenceKeys.add(caller, key);
    nextPresenceKey += 1;
    key;
  };

  public shared ({ caller }) func dropPresence() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can drop presence");
    };
    presenceKeys.remove(caller);
  };

  public query ({ caller }) func numActivePeers() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can query active peers");
    };
    presenceKeys.size();
  };

  /***************************************/
  /***       CHAT MESSAGING            ***/
  /***************************************/
  type Message = {
    sender : Principal;
    text : Text;
    image_payload : ?[Nat8];
  };

  let chatHistory = Map.empty<Text, List.List<Message>>();

  func getChatId(caller : Principal, chatPartner : Principal) : Text {
    switch (caller.toText() <= chatPartner.toText()) {
      case (true) { caller.toText() # "." # chatPartner.toText() };
      case (false) { chatPartner.toText() # "." # caller.toText() };
    };
  };

  func validateMessage(msg : Message) {
    let validText = msg.text.size() <= 1000;
    let validImage = switch (msg.image_payload) {
      case (?img) { img.size() <= 465000 };
      case (null) { true };
    };

    if (not validText or not validImage) {
      if (not validText and validImage) { Runtime.trap("Text size too large") };
      if (not validImage and validText) { Runtime.trap("Image size too large") };
      Runtime.trap("Exceeded message size limit");
    };

    switch (msg.text.size() > 0, msg.image_payload) {
      case (true, null) { return () };
      case (false, ?_) { return () };
      case (true, ?_) { return () };
      case (false, null) { Runtime.trap("Empty message is not allowed") };
    };
  };

  public shared ({ caller }) func sendMessage(receiver : Principal, msg : Message) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    if (msg.sender != caller) {
      Runtime.trap("Unauthorized: Message sender must match caller");
    };

    validateMessage(msg);

    let chatId = getChatId(caller, receiver);

    switch (chatHistory.get(chatId)) {
      case (?existingMsgs) {
        existingMsgs.add(msg);
      };
      case (_) {
        let newMsgs = List.empty<Message>();
        newMsgs.add(msg);
        chatHistory.add(chatId, newMsgs);
      };
    };
  };

  public query ({ caller }) func getMessages(receiver : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can retrieve messages");
    };

    let chatId = getChatId(caller, receiver);

    switch (chatHistory.get(chatId)) {
      case (?msgs) { msgs.reverse().toArray() };
      case (_) { [] };
    };
  };

  public shared ({ caller }) func clearMessages(receiver : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear messages");
    };

    let chatId = getChatId(caller, receiver);
    if (not chatHistory.containsKey(chatId)) { return () };

    func hasMessagesFrom(messages : List.List<Message>, sender : Principal) : Bool {
      messages.any(
        func(msg) {
          msg.sender == sender;
        }
      );
    };

    switch (chatHistory.get(chatId)) {
      case (?msgs) {
        if (not ((hasMessagesFrom(msgs, caller) or hasMessagesFrom(msgs, receiver)))) {
          Runtime.trap("Unauthorized: Can only clear messages you participated in");
        };
      };
      case (_) { return () };
    };
    chatHistory.remove(chatId);
  };

  /***************************************/
  /***       GAME CHALLENGES           ***/
  /***************************************/
  public type GameType = {
    #TicTacToe;
    #ConnectFour;
  };

  public type GameChallenge = {
    challenger : Principal;
    opponent : Principal;
    gameType : GameType;
    accepted : Bool;
  };

  public type GameState = {
    player1 : Principal;
    player2 : Principal;
    currentTurn : Principal;
    gameType : GameType;
    state : Text; // JSON-serializable game state
    winner : ?Principal;
  };

  let gameChallenges = Map.empty<Text, GameChallenge>();
  let gameStates = Map.empty<Text, GameState>();

  func getGameId(p1 : Principal, p2 : Principal) : Text {
    let sortedIds = if (p1.toText() <= p2.toText()) {
      [p1, p2];
    } else {
      [p2, p1];
    };
    sortedIds[0].toText() # ".game." # sortedIds[1].toText();
  };

  public shared ({ caller }) func createGameChallenge(opponent : Principal, gameType : GameType) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create game challenges");
    };

    if (caller == opponent) {
      Runtime.trap("Cannot challenge yourself");
    };

    let gameId = getGameId(caller, opponent);
    let challenge : GameChallenge = {
      challenger = caller;
      opponent = opponent;
      gameType = gameType;
      accepted = false;
    };
    gameChallenges.add(gameId, challenge);
  };

  public shared ({ caller }) func acceptGameChallenge(challenger : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept game challenges");
    };

    let gameId = getGameId(caller, challenger);
    switch (gameChallenges.get(gameId)) {
      case (?challenge) {
        if (challenge.opponent != caller) {
          Runtime.trap("Unauthorized: You are not the opponent in this challenge");
        };
        if (challenge.accepted) {
          Runtime.trap("Challenge already accepted");
        };

        let updatedChallenge : GameChallenge = {
          challenger = challenge.challenger;
          opponent = challenge.opponent;
          gameType = challenge.gameType;
          accepted = true;
        };
        gameChallenges.add(gameId, updatedChallenge);

        let initialState : GameState = {
          player1 = challenge.challenger;
          player2 = caller;
          currentTurn = challenge.challenger;
          gameType = challenge.gameType;
          state = "{}";
          winner = null;
        };
        gameStates.add(gameId, initialState);
      };
      case (_) {
        Runtime.trap("Challenge not found");
      };
    };
  };

  public query ({ caller }) func getGameState(opponent : Principal) : async ?GameState {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can query game state");
    };

    let gameId = getGameId(caller, opponent);
    gameStates.get(gameId);
  };

  public shared ({ caller }) func updateGameState(opponent : Principal, newState : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update game state");
    };

    let gameId = getGameId(caller, opponent);
    switch (gameStates.get(gameId)) {
      case (?game) {
        if (game.currentTurn != caller) {
          Runtime.trap("Unauthorized: Not your turn");
        };

        if (game.winner != null) {
          Runtime.trap("Game already finished");
        };

        let nextTurn = if (caller == game.player1) { game.player2 } else { game.player1 };

        let updatedGame : GameState = {
          player1 = game.player1;
          player2 = game.player2;
          currentTurn = nextTurn;
          gameType = game.gameType;
          state = newState;
          winner = game.winner;
        };
        gameStates.add(gameId, updatedGame);
      };
      case (_) {
        Runtime.trap("Game not found");
      };
    };
  };

  public shared ({ caller }) func setGameWinner(opponent : Principal, winner : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set game winner");
    };

    let gameId = getGameId(caller, opponent);
    switch (gameStates.get(gameId)) {
      case (?game) {
        if (caller != game.player1 and caller != game.player2) {
          Runtime.trap("Unauthorized: Not a participant in this game");
        };

        if (game.winner != null) {
          Runtime.trap("Winner already set");
        };

        if (winner != game.player1 and winner != game.player2) {
          Runtime.trap("Invalid winner");
        };

        let updatedGame : GameState = {
          player1 = game.player1;
          player2 = game.player2;
          currentTurn = game.currentTurn;
          gameType = game.gameType;
          state = game.state;
          winner = ?winner;
        };
        gameStates.add(gameId, updatedGame);
      };
      case (_) {
        Runtime.trap("Game not found");
      };
    };
  };
};
