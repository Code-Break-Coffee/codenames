import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import cardsReducer from './slices/cardsSlice';
import uiReducer from './slices/uiSlice';
import scoreReducer from "./slices/scoreSlice";
import playersReducer from "./slices/playersSlice";
import gameReducer from "./slices/gameSlice";

const rootReducer = combineReducers({
  cards: cardsReducer,
  ui: uiReducer,
  scores: scoreReducer,
  players: playersReducer,
  game: gameReducer
});

const persistConfig = {
  key: 'root',
  storage,
  // whitelist the slices you want persisted, or omit to persist all
  whitelist: ['cards', 'ui'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // redux-persist actions must be ignored in serializable checks
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
