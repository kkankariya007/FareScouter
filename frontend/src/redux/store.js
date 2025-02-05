import { configureStore } from '@reduxjs/toolkit';

// Example dummy reducer
const dummyReducer = (state = { message: 'Redux is working!' }, action) => state;

const store = configureStore({
  reducer: {
    dummy: dummyReducer,
  },
});

export default store;
