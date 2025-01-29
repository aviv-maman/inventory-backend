import { type InferSchemaType, Schema, model } from 'mongoose';

const storeSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'A name is required'],
    },
    location: {
      type: String,
      required: [true, 'A location is required'],
    },
    active: {
      type: Boolean,
      required: [true, 'Activity status is required'],
    },
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        stock: { type: Number, default: 0 },
      },
    ],
    __v: {
      type: Number,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

export type Store = InferSchemaType<typeof storeSchema>;
export const StoreModel = model('Store', storeSchema);
