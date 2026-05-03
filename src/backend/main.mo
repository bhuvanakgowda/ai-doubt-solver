import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import CoreMixin "mixins/core-api";
import Types "types/core";
import Common "types/common";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let chats = Map.empty<Common.ChatId, Types.Chat>();
  let nextChatId = [var 1 : Nat];
  let nextMessageId = [var 1 : Nat];

  include CoreMixin(accessControlState, chats, nextChatId, nextMessageId);
};
