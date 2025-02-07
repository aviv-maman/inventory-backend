import { CategoryModel } from '../models/categoryModel.ts';
import AppError from '../utils/AppError.ts';
import genericHandler from '../utils/genericHandler.ts';
import helpers from '../utils/helpers.ts';

const createCategory = genericHandler.createOne(CategoryModel);
const getAllCategories = genericHandler.getAll(CategoryModel);

const categoryController = { createCategory, getAllCategories };

export default categoryController;
