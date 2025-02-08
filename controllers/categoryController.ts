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

const getAncestorsByCategoryId = async (categoryId: string | null) => {
  try {
    if (categoryId) {
      const category = await CategoryModel.findById(categoryId);
      if (category) {
        const ancestors = await populateAncestors(category);
        return [...ancestors, category];
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

const getChildrenByCategoryId = async (categoryId: string | null) => {
  try {
    const children = await CategoryModel.find({ parent: categoryId }).exec();
    const populatedCategories = await Promise.all(
      children.map(async (category) => {
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

const getCategoriesWithAncestors = helpers.catchAsync(async (req, res, next) => {
  if (req.query.categoryId && typeof req.query.categoryId === 'string') {
    const [children, ancestors] = await Promise.all([
      getChildrenByCategoryId(req.query.categoryId),
      getAncestorsByCategoryId(req.query.categoryId),
    ]);
    res.status(200).json({ success: true, data: { children, ancestors }, count: children.length });
  } else {
    //No start ID => root/no ancestors
    const children = await getChildrenByCategoryId(null);
    if (children) {
      res.status(200).json({ success: true, data: { children, ancestors: null }, count: children.length });
    } else {
      return next(new AppError('category was not found', 404));
    }
  }
});

const categoryController = { createCategory, getAllCategories, getCategoriesWithAncestors };

export default categoryController;
