import { registerNotificationHandlers } from "../handlers/notification.handler";

import { eventBus } from "./eventBus";

export const registerHandlers = (): void => {
  registerNotificationHandlers((event, handler) => {
    eventBus.on(event, handler);
  });
};
