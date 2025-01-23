import type { FilterQuery, Model } from 'mongoose';
import APIFilterFunctions from './APIFilterFunctions.ts';
import AppError from './AppError.ts';
import { catchAsync } from './catchAsync.ts';

const deleteOne = (Model: Model<any>) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({ success: true });
  });

const updateOne = (Model: Model<any>) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // To send back the updated object
      runValidators: true, // To run validators in the schema
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({ success: true, data: doc });
  });

const createOne = (Model: Model<any>) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({ success: true, data: doc });
  });

const getOne = (
  Model: Model<any>,
  popOptions?: {
    path?: string; //children
    select?: string | any;
    model?: string;
    match?: any;
  },
) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions)
      query = query.populate({
        path: popOptions.path ?? '',
        select: popOptions.select ?? '',
        model: popOptions.model ?? '',
        match: popOptions.match ?? '',
      });
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({ success: true, data: doc });
  });

const getAll = (Model: Model<any>) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on product (hack)
    let filter = {} as FilterQuery<any>;
    if (req.params.productId) filter = { product: req.params.productId };

    const paginatedQuery = new APIFilterFunctions(Model.find(filter), req.query)
      .filter()
      .typeFilter()
      .roleFilter()
      .nameFilter()
      .emailFilter()
      .exactDateFilter()
      .fromDateFilter()
      .untilDateFilter()
      .exactPriceFilter()
      .minPriceFilter()
      .maxPriceFilter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();

    const countQuery = await new APIFilterFunctions(Model.find(filter), req.query)
      .filter()
      .typeFilter()
      .roleFilter()
      .nameFilter()
      .emailFilter()
      .exactDateFilter()
      .fromDateFilter()
      .untilDateFilter()
      .exactPriceFilter()
      .minPriceFilter()
      .maxPriceFilter()
      .sort()
      .limitFields()
      .aggregateCount();

    const paginatedDocs = await paginatedQuery.query;
    const totalCount = await countQuery.query.countDocuments();
    const totalPages = Math.ceil(totalCount / Number(req.query.limit));

    res
      .status(200)
      .json({ success: true, data: paginatedDocs, currentCount: paginatedDocs.length, totalCount, totalPages });
  });

const genericHandler = {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
};

export default genericHandler;
