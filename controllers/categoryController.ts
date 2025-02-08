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

const getCategoriesByParentId = async (parentId: string | null) => {
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

const getCategoriesByCategoryId = async (categoryId: string) => {
  try {
    const parent = await CategoryModel.findById(categoryId).select('_id name parent').exec();
    if (parent) {
      const ancestors = await populateAncestors(parent);
      const categories = [
        {
          ...parent.toObject(),
          ancestors: ancestors.map((a) => ({ _id: a._id, name: a.name })),
        },
      ];
      return categories;
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

const getCategoriesWithAncestors = helpers.catchAsync(async (req, res, next) => {
  if (req.query.parent && typeof req.query.parent === 'string') {
    const categories = await getCategoriesByParentId(req.query.parent);
    if (categories.length) {
      res.status(200).json({ success: true, data: categories, currentCount: categories.length });
    } else {
      //Last Child
      const categories = await getCategoriesByCategoryId(req.query.parent);

      res.status(200).json({ success: true, data: categories, currentCount: 0 });
    }
  } else {
    const categories = await getCategoriesByParentId(null);
    if (categories) {
      res.status(200).json({ success: true, data: categories, currentCount: categories.length });
    } else {
      return next(new AppError('category was not found', 404));
    }
  }
});

const categoryController = { createCategory, getAllCategories, getCategoriesWithAncestors };

export default categoryController;
