import * as Yup from 'yup';

export const loginValidationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

export const registerValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const projectValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(1, 'Project name is required')
    .required('Project name is required'),
  description: Yup.string()
    .trim()
    .optional(),
});

export const userInviteValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  role: Yup.string()
    .oneOf(['member', 'manager'], 'Invalid role')
    .required('Role is required'),
});

export const reportValidationSchema = Yup.object({
  project: Yup.string()
    .required('Please select a project'),
});

export const reviewValidationSchema = Yup.object({
  action: Yup.string()
    .oneOf(['approve', 'request_changes'])
    .required('Action is required'),
  comment: Yup.string().when('action', {
    is: 'request_changes',
    then: (schema) => schema.trim().required('A comment is required when requesting changes'),
    otherwise: (schema) => schema.optional(),
  }),
});

export const profileValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  currentPassword: Yup.string().when('newPassword', {
    is: (value) => Boolean(value && value.length > 0),
    then: (schema) => schema.required('Current password is required to set a new password'),
    otherwise: (schema) => schema.optional(),
  }),
  newPassword: Yup.string().test(
    'len',
    'New password must be at least 6 characters',
    (value) => !value || value.length >= 6
  ),
  confirmPassword: Yup.string().when('newPassword', {
    is: (value) => Boolean(value && value.length > 0),
    then: (schema) =>
      schema
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Please confirm your new password'),
    otherwise: (schema) => schema.optional(),
  }),
});

