import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store/store';
import Loading from './common/Loading';

const ReduxProvider = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={<Loading message="Loading..." />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};

export default ReduxProvider;
