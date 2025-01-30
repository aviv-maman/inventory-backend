import { ProductModel } from '../models/productModel.ts';
import genericHandler from '../utils/genericHandler.ts';
import helpers from '../utils/helpers.ts';

const getAllProducts = genericHandler.getAll(ProductModel);
const createProduct = genericHandler.createOne(ProductModel);

const prepareBodyProduct = helpers.catchAsync(async (req, res, next) => {
  req.body.price = { fullPrice: Number(req.body.fullPrice), discountPercentage: Number(req.body.discountPercentage) };

  next();
});

const productController = {
  createProduct,
  getAllProducts,
  prepareBodyProduct,
};

export default productController;
