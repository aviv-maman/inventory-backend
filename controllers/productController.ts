import { ProductModel } from '../models/productModel.ts';
import genericHandler from '../utils/genericHandler.ts';
import helpers from '../utils/helpers.ts';

//const createProduct = genericHandler.createOne(ProductModel);
const getAllProducts = genericHandler.getAll(ProductModel);

const createProduct = helpers.catchAsync(async (req, res, next) => {
  const newProduct = await ProductModel.create({
    name: req.body.name,
    description: req.body.description,
    price: { fullPrice: Number(req.body.fullPrice), discountPercentage: Number(req.body.discountPercentage) },
  });

  res.status(201).json({ success: true, data: newProduct });
});

const productController = {
  createProduct,
  getAllProducts,
};

export default productController;
