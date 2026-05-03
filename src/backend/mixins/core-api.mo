import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Types "../types/core";
import Common "../types/common";
import CoreLib "../lib/core";

mixin (
  accessControlState : AccessControl.AccessControlState,
  chats : Map.Map<Common.ChatId, Types.Chat>,
  nextChatId : [var Nat],
  nextMessageId : [var Nat],
) {

  /// Transform callback required by IC HTTP outcalls
  public query func transformGroq(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  /// Create a new chat for the authenticated user with the first question as title seed
  public shared ({ caller }) func createChat(firstQuestion : Text) : async (Common.ChatId, Text) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    let result = CoreLib.createChat(chats, nextChatId[0], caller, firstQuestion);
    nextChatId[0] += 1;
    result;
  };

  /// Get all chats for the authenticated user, sorted by most recent
  public query ({ caller }) func getUserChats() : async [Types.ChatInfo] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    CoreLib.getUserChats(chats, caller);
  };

  /// Get a specific chat with all its messages
  public query ({ caller }) func getChat(chatId : Common.ChatId) : async ?Types.ChatWithMessages {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    CoreLib.getChatWithMessages(chats, chatId, caller);
  };

  /// Append a message to an existing chat
  public shared ({ caller }) func addMessage(
    chatId : Common.ChatId,
    role : Common.MessageRole,
    content : Text,
    inputType : Common.InputType,
  ) : async ?Common.MessageId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    let result = CoreLib.addMessage(chats, nextMessageId[0], chatId, caller, role, content, inputType);
    switch (result) {
      case (?_) { nextMessageId[0] += 1 };
      case null {};
    };
    result;
  };

  /// Delete a chat and all its messages
  public shared ({ caller }) func deleteChat(chatId : Common.ChatId) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    CoreLib.deleteChat(chats, chatId, caller);
  };

  /// Delete a single message from a chat
  public shared ({ caller }) func deleteMessage(messageId : Common.MessageId) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    CoreLib.deleteMessage(chats, messageId, caller);
  };

  /// Submit a doubt (text/image/voice already transcribed), call Groq AI, store both messages, return result
  public shared ({ caller }) func submitDoubt(
    chatId : Common.ChatId,
    inputType : Common.InputType,
    content : Text,
    imageKey : ?Text,
  ) : async Types.SubmitDoubtResult {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    // Ensure the chat exists and belongs to the caller
    switch (chats.get(chatId)) {
      case null { Runtime.trap("Chat not found") };
      case (?chat) {
        if (not Principal.equal(chat.userId, caller)) {
          Runtime.trap("Unauthorized: not your chat");
        };
      };
    };

    // Detect subject from question text
    let subject = CoreLib.detectSubject(content);

    // Update chat subject
    switch (chats.get(chatId)) {
      case (?chat) { chat.subject := subject };
      case null {};
    };

    // Store the user's doubt message
    let userMsgId = switch (CoreLib.addMessage(chats, nextMessageId[0], chatId, caller, #user, content, inputType)) {
      case null { Runtime.trap("Failed to store user message") };
      case (?id) { nextMessageId[0] += 1; id };
    };

    // Build and send Groq API request
    let (_, requestBody) = CoreLib.buildGroqPrompt(subject, content, imageKey);
    let groqUrl = "https://api.groq.com/openai/v1/chat/completions";
    let groqApiKey = "GROQ_API_KEY_PLACEHOLDER";
    let headers : [OutCall.Header] = [
      { name = "Content-Type"; value = "application/json" },
      { name = "Authorization"; value = "Bearer " # groqApiKey },
    ];
    let responseJson = await OutCall.httpPostRequest(groqUrl, headers, requestBody, transformGroq);

    // Parse the AI response
    let aiText = CoreLib.parseGroqResponse(responseJson);

    // Store the AI response message
    let aiMsgId = switch (CoreLib.addMessage(chats, nextMessageId[0], chatId, caller, #assistant, aiText, #text)) {
      case null { Runtime.trap("Failed to store AI message") };
      case (?id) { nextMessageId[0] += 1; id };
    };

    {
      userMessageId = userMsgId;
      aiMessageId = aiMsgId;
      aiResponse = aiText;
      subject = subject;
    };
  };
};
