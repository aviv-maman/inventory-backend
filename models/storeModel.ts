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
  },
  {
    timestamps: true, // add updatedAt
  },
);

export type Store = InferSchemaType<typeof storeSchema>;
export const StoreModel = model('Store', storeSchema);
