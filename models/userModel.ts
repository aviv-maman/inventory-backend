import { hash } from 'bcrypt';
import { Schema, model } from 'mongoose';
import type { InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please enter your first name!'],
    },
    lastName: {
      type: String,
      required: [true, 'Please enter your last name!'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ['customer', 'employee', 'admin'],
      default: 'customer',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },
    passwordConfirmation: {
      type: String,
      required: [true, 'Please confirm your password'],
      //   validate: {
      //     // This only works on CREATE and SAVE!!! So on updating a user, we need to use Save as well and not findOneAndUpdate
      //     validator: function (this: IUser, element: string) {
      //       return element === this.password;
      //     },
      //     message: 'Passwords are not the same!',
      //   },
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    __v: {
      type: Number,
      select: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
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

// userSchema.pre(/^find/, function (next) {
//   // this points to the current query
//   this.find({ active: { $ne: false } });
//   next();
// });

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model('User', userSchema);
