module {
  public type Timestamp = Int;
  public type ChatId = Nat;
  public type MessageId = Nat;

  public type Subject = {
    #math;
    #physics;
    #chemistry;
    #biology;
    #history;
    #language;
    #other;
  };

  public type InputType = {
    #text;
    #image;
    #voice;
  };

  public type MessageRole = {
    #user;
    #assistant;
  };
};
