import { eventBus } from "./eventBus";
import { registerNotificationHandlers } from "../handlers/notification.handler";

export const registerHandlers = (): void => {
  registerNotificationHandlers((event, handler) => {
    eventBus.on(event, handler);
  });
};
