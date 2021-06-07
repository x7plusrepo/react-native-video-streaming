import {handleActions} from 'redux-actions';
import {SET_PRODUCTS, UPDATE_PRODUCT} from './types';

const INITIAL_STATE = {
  products: [],
};

const actionMap = {};

actionMap[SET_PRODUCTS] = (state, { payload }) => ({
  ...state,
  products: payload,
});

actionMap[UPDATE_PRODUCT] = (state, { payload }) => {
  const products = state.products || [];
  const newProducts = [...products];
  const productId = payload?.productId;
  const productIndex = products.findIndex((p) => p.id === productId);
  if (productIndex > -1) {
    newProducts[productIndex] = payload.updatedProduct || {};
  }
  return {
    ...state,
    products: newProducts,
  };
};

export default handleActions(actionMap, INITIAL_STATE);
