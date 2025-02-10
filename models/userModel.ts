import { hash } from 'bcrypt';
import { type InferSchemaType, Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    firstName: { type: String, required: [true, 'First name is required'] },
    lastName: { type: String, required: [true, 'Last name is required'] },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true },
    role: { type: String, enum: ['customer', 'employee', 'admin'], default: 'customer' },
    address: { type: String, required: [true, 'Address is required'] },
    password: { type: String, required: [true, 'Password is required'], minlength: 8, select: false },
    passwordConfirmation: {
      type: String,
      required: [true, 'Password confirmation is required'],
      //   validate: {
      //     // This only works on CREATE and SAVE!!! So on updating a user, we need to use Save as well and not findOneAndUpdate
      //     validator: function (this: IUser, element: string) {
      //       return element === this.password;
      //     },
      //     message: 'Passwords are not the same!',
      //   },
    },
    passwordChangedAt: { type: Date, select: false },
    __v: { type: Number, select: false },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true, // add updatedAt
  },
);

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 16
  this.password = await hash(this.password, 16);

  // Delete passwordConfirmation field
  this.set('passwordConfirmation', undefined);
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = new Date(Date.now() - 1000); //Subtract 1 second to make sure the token is created before the password was changed
  next();
});

export const UserModel = model('User', userSchema);
export type User = InferSchemaType<typeof userSchema>;
