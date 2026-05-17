import type { HttpRequest } from '@azure/functions';
import type { SwaUser } from '../types';

const ANON_USER: SwaUser = {
  userId: 'prototype-user',
  userDetails: 'Consultant',
  identityProvider: 'none',
  userRoles: ['anonymous'],
};

export function getUser(_request: HttpRequest): SwaUser {
  return ANON_USER;
}

export function requireUser(_request: HttpRequest): SwaUser {
  return ANON_USER;
}

export class AuthError extends Error {}
