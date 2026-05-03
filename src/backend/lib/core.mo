import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/core";
import Common "../types/common";
import Int "mo:core/Int";
import Text "mo:core/Text";

module {
  public func createChat(
    chats : Map.Map<Common.ChatId, Types.Chat>,
    nextChatId : Nat,
    caller : Principal,
    firstQuestion : Text,
  ) : (Common.ChatId, Text) {
    let title = if (firstQuestion.size() > 50) {
      Text.fromArray(firstQuestion.toArray().sliceToArray(0, 50)) # "..."
    } else {
      firstQuestion;
    };
    let chat : Types.Chat = {
      id = nextChatId;
      userId = caller;
      var title = title;
      var subject = #other;
      messages = List.empty<Types.Message>();
      createdAt = Time.now();
      var updatedAt = Time.now();
    };
    chats.add(nextChatId, chat);
    (nextChatId, title);
  };

  public func getUserChats(
    chats : Map.Map<Common.ChatId, Types.Chat>,
    caller : Principal,
  ) : [Types.ChatInfo] {
    let userChats = chats.values()
      .filter(func(chat) { Principal.equal(chat.userId, caller) })
      .map(func(chat) { chatToInfo(chat) })
      .toArray();
    // Sort by updatedAt descending (most recent first)
    userChats.sort(func(a, b) { Int.compare(b.updatedAt, a.updatedAt) });
  };

  public func getChatWithMessages(
    chats : Map.Map<Common.ChatId, Types.Chat>,
    chatId : Common.ChatId,
    caller : Principal,
  ) : ?Types.ChatWithMessages {
    switch (chats.get(chatId)) {
      case null { null };
      case (?chat) {
        if (not Principal.equal(chat.userId, caller)) { null } else {
          ?{
            chat = chatToInfo(chat);
            messages = chat.messages.map<Types.Message, Types.MessageInfo>(func(m) { messageToInfo(m) }).toArray();
          };
        };
      };
    };
  };

  public func addMessage(
    chats : Map.Map<Common.ChatId, Types.Chat>,
    nextMessageId : Nat,
    chatId : Common.ChatId,
    caller : Principal,
    role : Common.MessageRole,
    content : Text,
    inputType : Common.InputType,
  ) : ?Common.MessageId {
    switch (chats.get(chatId)) {
      case null { null };
      case (?chat) {
        if (not Principal.equal(chat.userId, caller)) { null } else {
          let msg : Types.Message = {
            id = nextMessageId;
            chatId = chatId;
            role = role;
            content = content;
            inputType = inputType;
            timestamp = Time.now();
          };
          chat.messages.add(msg);
          chat.updatedAt := Time.now();
          ?(nextMessageId);
        };
      };
    };
  };

  public func deleteChat(
    chats : Map.Map<Common.ChatId, Types.Chat>,
    chatId : Common.ChatId,
    caller : Principal,
  ) : Bool {
    switch (chats.get(chatId)) {
      case null { false };
      case (?chat) {
        if (not Principal.equal(chat.userId, caller)) { false } else {
          chats.remove(chatId);
          true;
        };
      };
    };
  };

  public func deleteMessage(
    chats : Map.Map<Common.ChatId, Types.Chat>,
    messageId : Common.MessageId,
    caller : Principal,
  ) : Bool {
    // Find the chat that contains this message
    let chatOpt = chats.values().find(func(chat) {
      Principal.equal(chat.userId, caller) and
      chat.messages.find(func(m) { m.id == messageId }) != null
    });
    switch (chatOpt) {
      case null { false };
      case (?chat) {
        let sizeBefore = chat.messages.size();
        let filtered = chat.messages.filter(func(m) { m.id != messageId });
        chat.messages.clear();
        chat.messages.append(filtered);
        chat.updatedAt := Time.now();
        chat.messages.size() < sizeBefore;
      };
    };
  };

  public func detectSubject(text : Text) : Common.Subject {
    let lower = text.toLower();
    if (
      lower.contains(#text "math") or lower.contains(#text "equation") or
      lower.contains(#text "algebra") or lower.contains(#text "calculus") or
      lower.contains(#text "geometry") or lower.contains(#text "trigonometry") or
      lower.contains(#text "integral") or lower.contains(#text "derivative") or
      lower.contains(#text "polynomial") or lower.contains(#text "matrix")
    ) {
      #math;
    } else if (
      lower.contains(#text "physics") or lower.contains(#text "velocity") or
      lower.contains(#text "acceleration") or lower.contains(#text "force") or
      lower.contains(#text "momentum") or lower.contains(#text "energy") or
      lower.contains(#text "newton") or lower.contains(#text "gravity") or
      lower.contains(#text "thermodynamics") or lower.contains(#text "electro")
    ) {
      #physics;
    } else if (
      lower.contains(#text "chemistry") or lower.contains(#text "chemical") or
      lower.contains(#text "element") or lower.contains(#text "molecule") or
      lower.contains(#text "reaction") or lower.contains(#text "compound") or
      lower.contains(#text "acid") or lower.contains(#text "base") or
      lower.contains(#text "periodic") or lower.contains(#text "bond")
    ) {
      #chemistry;
    } else if (
      lower.contains(#text "biology") or lower.contains(#text "cell") or
      lower.contains(#text "organism") or lower.contains(#text "evolution") or
      lower.contains(#text "dna") or lower.contains(#text "gene") or
      lower.contains(#text "protein") or lower.contains(#text "ecosystem") or
      lower.contains(#text "photosynthesis") or lower.contains(#text "mitosis")
    ) {
      #biology;
    } else if (
      lower.contains(#text "history") or lower.contains(#text "war") or
      lower.contains(#text "civilization") or lower.contains(#text "ancient") or
      lower.contains(#text "revolution") or lower.contains(#text "empire") or
      lower.contains(#text "century") or lower.contains(#text "historical")
    ) {
      #history;
    } else if (
      lower.contains(#text "grammar") or lower.contains(#text "language") or
      lower.contains(#text "vocabulary") or lower.contains(#text "literature") or
      lower.contains(#text "poem") or lower.contains(#text "essay") or
      lower.contains(#text "verb") or lower.contains(#text "noun") or
      lower.contains(#text "sentence") or lower.contains(#text "writing")
    ) {
      #language;
    } else {
      #other;
    };
  };

  public func buildGroqPrompt(
    subject : Common.Subject,
    doubt : Text,
    imageKey : ?Text,
  ) : (Text, Text) {
    let subjectName = switch (subject) {
      case (#math) "Mathematics";
      case (#physics) "Physics";
      case (#chemistry) "Chemistry";
      case (#biology) "Biology";
      case (#history) "History";
      case (#language) "Language / Literature";
      case (#other) "General Knowledge";
    };
    let systemPrompt = "You are an expert academic tutor specialising in " # subjectName # ". "
      # "Provide clear, step-by-step explanations suitable for students. "
      # "Use markdown formatting with headings, bullet points, and code blocks where helpful. "
      # "Always be encouraging and educational.";
    switch (imageKey) {
      case (?key) {
        let model = "meta-llama/llama-4-scout-17b-16e-instruct";
        let body = "{"
          # "\"model\":\"" # model # "\","
          # "\"messages\":[{"
          # "\"role\":\"system\",\"content\":\"" # systemPrompt # "\""
          # "},{"
          # "\"role\":\"user\",\"content\":["
          # "{\"type\":\"text\",\"text\":\"" # doubt # "\"},"
          # "{\"type\":\"image_url\",\"image_url\":{\"url\":\"" # key # "\"}}"
          # "]}"
          # "],"
          # "\"max_tokens\":2048"
          # "}";
        (model, body);
      };
      case null {
        let model = "llama-3.3-70b-versatile";
        let body = "{"
          # "\"model\":\"" # model # "\","
          # "\"messages\":[{"
          # "\"role\":\"system\",\"content\":\"" # systemPrompt # "\""
          # "},{"
          # "\"role\":\"user\",\"content\":\"" # doubt # "\""
          # "}],"
          # "\"max_tokens\":2048"
          # "}";
        (model, body);
      };
    };
  };

  public func parseGroqResponse(responseJson : Text) : Text {
    // Extract content from: {"choices":[{"message":{"content":"...",...}}],...}
    // Find the content field by scanning for "content":"
    let contentMarker = "\"content\":\"";
    switch (responseJson.split(#text contentMarker).next()) {
      case null { "Unable to parse AI response." };
      case (?_) {
        // Get the part after the first occurrence of "content":"
        var parts = responseJson.split(#text contentMarker);
        // skip the first part (before content marker)
        ignore parts.next();
        switch (parts.next()) {
          case null { "Unable to parse AI response." };
          case (?afterContent) {
            // Collect characters until we hit an unescaped closing quote
            let quoteChar : Char = '\u{22}'; // double-quote character
            let backslashChar : Char = '\\';
            var result = "";
            var prevBackslash = false;
            var done = false;
            for (c in afterContent.toIter()) {
              if (not done) {
                if (prevBackslash) {
                  // Handle common escape sequences
                  if (c == quoteChar) {
                    result := result # "\"";
                  } else if (c == 'n') {
                    result := result # "\n";
                  } else if (c == 't') {
                    result := result # "\t";
                  } else if (c == 'r') {
                    result := result # "";
                  } else if (c == backslashChar) {
                    result := result # "\\";
                  } else {
                    result := result # "\\" # Text.fromChar(c);
                  };
                  prevBackslash := false;
                } else if (c == backslashChar) {
                  prevBackslash := true;
                } else if (c == quoteChar) {
                  done := true;
                } else {
                  result := result # Text.fromChar(c);
                  prevBackslash := false;
                };
              };
            };
            if (result == "") { "Unable to extract AI answer from response." } else { result };
          };
        };
      };
    };
  };

  public func chatToInfo(chat : Types.Chat) : Types.ChatInfo {
    {
      id = chat.id;
      userId = chat.userId;
      title = chat.title;
      subject = chat.subject;
      createdAt = chat.createdAt;
      updatedAt = chat.updatedAt;
    };
  };

  public func messageToInfo(msg : Types.Message) : Types.MessageInfo {
    {
      id = msg.id;
      chatId = msg.chatId;
      role = msg.role;
      content = msg.content;
      inputType = msg.inputType;
      timestamp = msg.timestamp;
    };
  };
};
