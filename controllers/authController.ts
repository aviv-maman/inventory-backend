import { UserModel } from '../models/userModel.ts';
import type { SessionPayload } from '../types/auth';
import AppError from '../utils/AppError.ts';
import { catchAsync } from '../utils/catchAsync.ts';
import { compare } from 'bcrypt';
import type { Response } from 'express';
import { SignJWT, jwtVerify } from 'jose';

const AUTH_SETTINGS = {
  secretKey: new TextEncoder().encode(process.env.AUTH_SECRET),
  issuer: process.env.JWT_ISSUER || '~',
  audience: 'Authentication',
  algorithm: 'HS256',
  expirationTime: '24hr',
};

//encryptToken
const signToken = async (payload: SessionPayload) => {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: AUTH_SETTINGS.algorithm })
    .setExpirationTime(AUTH_SETTINGS.expirationTime)
    .setIssuer(AUTH_SETTINGS.issuer)
    .setSubject(payload.userId)
    .setIssuedAt()
    .setAudience(AUTH_SETTINGS.audience)
    .sign(AUTH_SETTINGS.secretKey);
  return token;
};

//decryptToken
const verifyToken = async (session: string | undefined = '') => {
  try {
    const { payload } = await jwtVerify(session, AUTH_SETTINGS.secretKey, {
      maxTokenAge: AUTH_SETTINGS.expirationTime,
      algorithms: [AUTH_SETTINGS.algorithm],
      issuer: AUTH_SETTINGS.issuer,
      audience: AUTH_SETTINGS.audience,
    });
    return payload;
  } catch (error) {
    return null;
  }
};

//sendTokenToClient
const createSession = async (userId: string, statusCode: number, res: Response) => {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await signToken({ userId, expiresAt });

  res.cookie('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });

  res.status(statusCode).json({
    success: true,
  });
};

const changedPasswordAfter = (JWTTimestamp?: number, passwordChangedAt?: Date | null) => {
  if (passwordChangedAt) {
    const changedTimestamp = parseInt(
      (passwordChangedAt.getTime() / 1000).toString(), //convert to seconds
      10, //specify the radix (the base in mathematical numeral systems)
    );

    return Number(JWTTimestamp) < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

//protectResource
const verifySession = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
    : (req.cookies.session as string | undefined);

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return next(new AppError('Verification failed! Please log in to get access.', 401));
  }

  const currentUser = await UserModel.findById(decoded.sub);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  if (changedPasswordAfter(decoded.iat, currentUser.passwordChangedAt)) {
    return next(new AppError('User recently changed password! Please log in again.', 401));
  }

  req.body.user = currentUser;
  next();
});

const register = catchAsync(async (req, res, next) => {
  const newUser = await UserModel.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirmation: req.body.passwordConfirmation,
  });

  createSession(newUser.id, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await UserModel.findOne({ email }).select('+password');

  if (!user || !(await compare(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSession(user.id, 200, res);
});

const logout = catchAsync(async (req, res, next) => {
  res.clearCookie('session');
  res.status(200).json({ success: true });
});

const authController = { verifySession, register, login, logout };

export default authController;
