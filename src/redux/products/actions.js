import {createAction} from 'redux-actions';
import {SET_PRODUCTS, UPDATE_PRODUCT} from './types';

const setProductsAction = createAction(SET_PRODUCTS);
const updateProductAction = createAction(UPDATE_PRODUCT);
export const setProducts = (products) => (dispatch) => {
  dispatch(setProductsAction(products));
};

export const updateProduct = (productId, updatedProduct) => (dispatch) => {
  dispatch(updateProductAction({ productId, updatedProduct }));
};
