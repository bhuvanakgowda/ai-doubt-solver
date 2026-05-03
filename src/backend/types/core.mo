import Principal "mo:core/Principal";
import List "mo:core/List";
import Common "common";

module {
  public type Message = {
    id : Common.MessageId;
    chatId : Common.ChatId;
    role : Common.MessageRole;
    content : Text;
    inputType : Common.InputType;
    timestamp : Common.Timestamp;
  };

  public type Chat = {
    id : Common.ChatId;
    userId : Principal;
    var title : Text;
    var subject : Common.Subject;
    messages : List.List<Message>;
    createdAt : Common.Timestamp;
    var updatedAt : Common.Timestamp;
  };

  // Shared (immutable) version for API boundary
  public type MessageInfo = {
    id : Common.MessageId;
    chatId : Common.ChatId;
    role : Common.MessageRole;
    content : Text;
    inputType : Common.InputType;
    timestamp : Common.Timestamp;
  };

  public type ChatInfo = {
    id : Common.ChatId;
    userId : Principal;
    title : Text;
    subject : Common.Subject;
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
  };

  public type ChatWithMessages = {
    chat : ChatInfo;
    messages : [MessageInfo];
  };

  public type SubmitDoubtResult = {
    userMessageId : Common.MessageId;
    aiMessageId : Common.MessageId;
    aiResponse : Text;
    subject : Common.Subject;
  };
};
