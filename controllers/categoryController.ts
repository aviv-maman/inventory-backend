import { type Category, CategoryModel } from '../models/categoryModel.ts';
import AppError from '../utils/AppError.ts';
import genericHandler from '../utils/genericHandler.ts';
import helpers from '../utils/helpers.ts';

const createCategory = genericHandler.createOne(CategoryModel);
const getAllCategories = genericHandler.getAll(CategoryModel);

const populateAncestors = async (category: Category): Promise<Category[]> => {
  const result: Category[] = [];
  let currentCategory = category;

  while (currentCategory && currentCategory.parent) {
    const parent = await CategoryModel.findById(currentCategory.parent).select('_id name parent').exec();
    if (parent) {
      result.push(parent);
      currentCategory = parent;
    } else {
      break;
    }
  }
  return result;
};

const getCategoriesByParentId = async (parentId: string) => {
  try {
    const categories = await CategoryModel.find({ parent: parentId }).exec();
    const populatedCategories = await Promise.all(
      categories.map(async (category) => {
        const ancestors = await populateAncestors(category);
        return {
          ...category.toObject(),
          ancestors: ancestors.map((a) => ({ _id: a._id, name: a.name })),
        };
      }),
    );

    return populatedCategories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

const getCategories = helpers.catchAsync(async (req, res, next) => {
  if (req.query.withAncestors && req.query.parent && typeof req.query.parent === 'string') {
    const categories = await getCategoriesByParentId(req.query.parent);
    if (categories) {
      res.status(200).json({ success: true, data: categories, currentCount: categories.length });
    } else {
      return next(new AppError('category was not found', 404));
    }
  } else {
    return getAllCategories(req, res, next);
  }
});

const categoryController = { createCategory, getCategories };

export default categoryController;
