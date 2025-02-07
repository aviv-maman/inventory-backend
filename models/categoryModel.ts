import { type InferSchemaType, Schema, model } from 'mongoose';

const categorySchema = new Schema(
  {
    name: { type: String, required: [true, 'A name is required'] },
    parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    __v: { type: Number, select: false },
  },
  {
    timestamps: true,
  },
);

export const CategoryModel = model('Category', categorySchema);
export type Category = InferSchemaType<typeof categorySchema>;
