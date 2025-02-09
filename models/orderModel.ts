import { type InferSchemaType, Schema, model } from 'mongoose';

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    address: { type: String, required: [true, 'An address is required'] },
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        store: { type: Schema.Types.ObjectId, ref: 'Store' },
        amount: { type: Number, default: 1 },
        price: { type: Number, required: [true, 'An address is required'] },
        _id: false,
      },
    ],
    totalPrice: { type: Number, required: [true, 'A price is required'] },
    status: { type: String, enum: ['pending', 'in progress', 'delivered', 'canceled'], default: 'pending' },
    __v: { type: Number, select: false },
  },
  {
    timestamps: true,
  },
);

export const OrderModel = model('Order', orderSchema);
export type Order = InferSchemaType<typeof orderSchema>;
