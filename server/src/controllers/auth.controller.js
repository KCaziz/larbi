import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/httpError.js';
import { clearSessionCookie, setSessionCookie } from '../services/token.service.js';
import { isSelectableAccountType } from '../services/accountTypes.service.js';

const BCRYPT_COST = 12;
// Compared against when the email is unknown so login timing does not reveal
// whether an account exists.
const DUMMY_HASH = bcrypt.hashSync('dummy-password', BCRYPT_COST);

// Explicit allow-list: never return passwordHash.
export function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    accountType: user.accountType,
    accessLevel: user.accessLevel,
    role: user.role,
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, password, accountType } = req.body;
    if (!(await isSelectableAccountType(accountType))) throw new HttpError(400, 'Unknown account type');
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

    let user;
    try {
      // role / accessLevel are deliberately NOT taken from the request.
      user = await prisma.user.create({ data: { name, email, passwordHash, accountType } });
    } catch (err) {
      if (err.code === 'P2002') throw new HttpError(409, 'Email already registered');
      throw err;
    }

    setSessionCookie(res, user.id);
    res.status(201).json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !ok) throw new HttpError(401, 'Invalid email or password');
    // Checked after the password (never before): a wrong password must never
    // reveal that the account exists and is merely suspended.
    if (user.status === 'suspended') throw new HttpError(403, 'Account suspended');

    setSessionCookie(res, user.id);
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req, res, next) {
  try {
    if (!(await isSelectableAccountType(req.body.accountType))) throw new HttpError(400, 'Unknown account type');
    // Scoped to req.user.id: a user can only ever modify their own account.
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { accountType: req.body.accountType },
    });
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  clearSessionCookie(res);
  res.status(204).end();
}

export function me(req, res) {
  res.json({ user: toPublicUser(req.user) });
}
