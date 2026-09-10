import { createMessageHandler } from '../server/message-handler.js';
import { reserveMessageAttempt } from '../server/survey-store.js';

export default createMessageHandler({ reserveMessageAttempt });
