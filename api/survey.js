import { createSurveyHandler } from '../server/survey-handler.js';
import * as store from '../server/survey-store.js';

export default createSurveyHandler(store);
