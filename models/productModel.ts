import { type InferSchemaType, Schema, model } from 'mongoose';

const productSchema = new Schema(
  {
    name: { type: String, required: [true, 'A name is required'] },
    description: { type: String, required: [true, 'A description is required'] },
    price: {
      fullPrice: { type: Number, required: [true, 'A product must have a price'] },
      discountPercentage: { type: Number, default: 0 },
      //discountPrice: { type: Number, required: false, default: 0 },
    },
    images: { type: [String], default: ['/placeholder.svg'] },
    categories: { type: [String], required: [true, 'Categories are required'] },
    //sku: { type: String, required: true, unique: true },
    stock: { type: Number, default: 0 },
    __v: { type: Number, select: false },
  },
  {
    timestamps: true,
  },
);

// Ensure virtual fields are serializable
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

productSchema.virtual('price.discountPrice').get(function (this: Product) {
  if (!this.price) return 0;
  return this.price.fullPrice - this.price.fullPrice * (this.price.discountPercentage / 100);
});

export type Product = InferSchemaType<typeof productSchema>;
export const ProductModel = model('Product', productSchema);
