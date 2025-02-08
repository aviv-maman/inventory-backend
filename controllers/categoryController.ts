import { CategoryModel } from '../models/categoryModel.ts';
import AppError from '../utils/AppError.ts';
import genericHandler from '../utils/genericHandler.ts';
import helpers from '../utils/helpers.ts';

const createCategory = genericHandler.createOne(CategoryModel);
const getAllCategories = genericHandler.getAll(CategoryModel);

const getCategories = helpers.catchAsync(async (req, res, next) => {
  if (req.query.withAncestors && req.query.parent) {
    const categories = await CategoryModel.find({ parent: req.query.parent });
    if (categories) {
      return getAllCategories(req, res, next);
    } else {
      return next(new AppError('category was not found', 404));
    }
  } else {
    return getAllCategories(req, res, next);
  }
});

const categoryController = { createCategory, getCategories };

export default categoryController;
