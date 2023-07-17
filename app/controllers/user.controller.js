const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/default.json');
const ClientError = require('../../shared/client-error');
const handleResponse = require('../../shared/responsehandler');
const ServerError = require('../../shared/server-error');
const {StatusCodes} = require('http-status-codes');
const userValidator = require('../validators/user.validator');

const jwtSecretKey = config.JWTPrivateKey;
const INVALID_REQUEST_BODY_FORMAT = 'Invalid Request Body Format';

exports.adminRegistration = async (req, res, next) => {
  try {
    const { username, email, phone, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const {error} = userValidator.validateCreateUser(req.body);
    if (error) {
        throw new ClientError(StatusCodes.BAD_REQUEST, INVALID_REQUEST_BODY_FORMAT, error.message);
    }

    // Check if the email is already registered, only if it is provided
    if(email){
      const existingEmailUser = await User.findOne({ email });
      if (existingEmailUser) {
        throw new ClientError(StatusCodes.BAD_REQUEST, 'Email already registered.', '');
      }
    }

    // Check if the phone number is already registered, only if it is provided
    if (phone) {
      const existingPhoneUser = await User.findOne({ phone });
      if (existingPhoneUser) {
        throw new ClientError(StatusCodes.BAD_REQUEST, 'Phone number already registered.', '');
      }
    }
    const admin = new User({
      username,
      email,
      phone,
      password: hashedPassword,
      role: 'admin',
    });

    const result = await admin.save();
    return handleResponse(req, res, next, StatusCodes.OK, {id:result._id, email: result.email, phone: result.phone}, 'Admin registered successfully!', '', null);   
  } catch (error) {
    if (error instanceof ClientError) {
      return next(error)
    }
    next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred during registration.', error.message));
    }
};

exports.customerRegistration = async (req, res, next) => {
  try {
    const { username, email, phone, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const {error} = userValidator.validateCreateUser(req.body);
    if (error) {
        throw new ClientError(StatusCodes.BAD_REQUEST, INVALID_REQUEST_BODY_FORMAT, error.message);
    }

    if(email){
      const existingEmailUser = await User.findOne({ email });
      if (existingEmailUser) {
        throw new ClientError(StatusCodes.BAD_REQUEST, 'Email already registered.', '');
      }
    }

    if (phone) {
      const existingPhoneUser = await User.findOne({ phone });
      if (existingPhoneUser) {
        throw new ClientError(StatusCodes.BAD_REQUEST, 'Phone number already registered.', '');
      }
    }

    const customer = new User({
      username,
      email,
      phone,
      password: hashedPassword,
      role: 'customer',
    });

    const result = await customer.save();

    return handleResponse(req, res, next, StatusCodes.OK, {id:result._id, email: result.email, phone: result.phone}, 'User registered successfully!', '', null); 
  } catch (error) {
    if (error instanceof ClientError) {
      return next(error)
    }
    next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred during registration.', error.message));
    }
};

exports.login = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;
    let user;

    const {error} = userValidator.validateLoginUser(req.body);
    if (error) {
        throw new ClientError(StatusCodes.BAD_REQUEST, INVALID_REQUEST_BODY_FORMAT, error.message);
    }

    if(email){
      user = await User.findOne({ email });
    } else if (phone) {
      user = await User.findOne({ phone });
    }

    if (!user) {
      throw new ClientError(StatusCodes.BAD_REQUEST, 'User not found.', '');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ClientError(StatusCodes.BAD_REQUEST, 'Invalid credentials.', '');
    }

    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecretKey, { expiresIn: '1h' });

    return handleResponse(req, res, next, StatusCodes.OK, token, '', '', null); 
  } catch (error)  {
    if (error instanceof ClientError) {
      return next(error)
    }
    next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred during login.', error.message));
    }
};
