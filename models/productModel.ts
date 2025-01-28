import { type Document, type InferSchemaType, Schema, model } from 'mongoose';

interface IPrice extends Document {
  fullPrice: number;
  discountPercentage: number;
  discountPrice?: number;
}

const PriceSchema: Schema<IPrice> = new Schema({
  fullPrice: { type: Number, required: true },
  discountPercentage: { type: Number, required: true },
});

PriceSchema.virtual('discountPrice').get(function (this: IPrice) {
  return this.fullPrice - this.fullPrice * (this.discountPercentage / 100);
});

interface IProduct extends Document {
  name: string;
  description: string;
  price: IPrice;
  images: string[];
  categories: string[];
  __v: number;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    name: { type: String, required: [true, 'A name is required'] },
    description: { type: String, required: [true, 'A description is required'] },
    price: { type: PriceSchema, required: true },
    images: { type: [String], required: false, default: ['/placeholder.svg'] },
    categories: { type: [String], required: false }, //categories: { type: [String], required: [true, 'Categories are required'] },
    __v: { type: Number, select: false },
  },
  {
    timestamps: true,
  },
);
// Ensure virtual fields are serializable
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

// const productSchema = new Schema(
//   {
//     name: {
//       type: String,
//       required: [true, 'A name is required'],
//     },
//     description: {
//       type: String,
//       required: [true, 'A description is required'],
//     },
//     price: {
//       fullPrice: { type: Number, required: [true, 'A product must have a price'] },
//       discountPrice: { type: Number, required: false, default: 0 },
//       discountPercentage: { type: Number, required: false, default: 0 },
//     },
//     images: {
//       type: [String],
//       required: false,
//       default: ['/placeholder.svg'],
//     },
//     categories: {
//       type: [String],
//       required: [true, 'Categories are required'],
//     },
//     __v: {
//       type: Number,
//       select: false,
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// export type Product = InferSchemaType<typeof productSchema>;
// export const ProductModel = model('Product', productSchema);

const ProductModel = model<IProduct>('Product', ProductSchema);
export default ProductModel;
