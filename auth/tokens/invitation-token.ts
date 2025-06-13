'use server';

import db from '@/resource/db/user';
import { hash } from 'bcryptjs';
import { ObjectId } from 'bson';
import { getInvitationToken } from './verification-token';
import { RegisterUserWithTokenValues } from '@/resource/schemas/user/token/invitation-token';
import { generateRefId } from '@/resource/db/user/generate-refId';
import { getUserByEmail } from '@/resource/db/user/get-accounts';
import { getTime } from '@/resource/const/times-helper';
import { getNameParts } from '@/resource/const/get-from-user';

export async function invitationToken(values: RegisterUserWithTokenValues) {
  try {
    const { token, name, email, password } = values;

    const [existingToken] = await Promise.all([getInvitationToken(token)]);

    const [firstName, lastName] = getNameParts(name);

    if (!existingToken) return { error: 'Token not registered' };

    if (existingToken.isUsed) return { error: 'Token already used' };

    if (new Date(existingToken.expires) < new Date()) return { error: 'Token has expired' };

    if (existingToken.usageCount >= existingToken.maxUsageCount) return { error: 'Token reached maximum usage limit' };

    const existingUser = await db.user.findUnique({
      where: { id: existingToken.usedById || undefined },
      select: { id: true, email: true }
    });

    if (existingUser) return { error: 'Token already used' };

    const refId = await generateRefId(existingToken?.assignedRole);

    const hashedPassword = await hash(password, 10);

    await db.user?.create({
      data: {
        refId,
        username: refId,
        email,
        name,
        firstName,
        lastName,
        role: existingToken?.assignedRole,
        password: hashedPassword
      }
    });

    await db.invitationToken.update({
      where: { id: existingToken?.id },
      data: {
        isUsed: true,
        used: new Date(),
        usedById: existingToken?.id
      }
    });

    await db.invitationToken.delete({
      where: { id: existingToken.id }
    });

    return { success: 'Email verified!' };
  } catch (error) {
    console.error('[ERROR]:', error);
    return { error: 'Token Error!' };
  }
}

export async function registerWithToken(values: RegisterUserWithTokenValues) {
  const { token, name = '', email, password, phone = '+62000-0000-0000' } = values;

  try {
    const invitation = await db.invitationToken.findUnique({
      where: { token, isUsed: false }
      // include: { usedBy: true }
    });

    if (!invitation) return { error: 'Token not registered' };

    if (invitation.isUsed) return { error: 'Token already used' };

    if (new Date(invitation?.expires) < new Date()) return { error: 'Token has expired' };

    if (invitation?.usageCount >= invitation?.maxUsageCount) return { error: 'Token reached maximum usage limit' };

    const existingUser = await getUserByEmail(email);

    if (existingUser) return { error: 'Email already registered' };

    const [firstName, lastName] = getNameParts(name);

    const getRefId = await generateRefId(invitation?.assignedRole);
    const objectId = new ObjectId().toHexString();

    let refId: string = objectId;

    if (process.env.NODE_ENV === 'production') {
      refId = getRefId;
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Buat user baru
    const newUser = await db.user.create({
      data: {
        refId,
        username: refId,
        email,
        name,
        firstName,
        lastName,
        phone,
        role: invitation?.assignedRole,
        password: hashedPassword,
        status: 'ACTIVE'
      }
    });

    /** Tandai token sebagai used */
    await db.invitationToken.update({
      where: { token },
      data: {
        isUsed: true,
        used: new Date(),
        usedById: newUser.id
      }
    });

    await db.invitationToken.update({
      where: { token },
      data: {
        usageCount: { increment: 1 },
        ...(invitation.usageCount + 1 >= invitation.maxUsageCount ? { isUsed: true, used: new Date(), usedById: newUser.id } : {})
      }
    });

    return {
      success: 'Account creation successful',
      data: {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role
      }
    };
  } catch (error) {
    console.error('[REGISTER WITH TOKEN ERROR]:', error);
    return { error: 'Error' };
  }
}

export async function getInvitationHandler(token: string) {
  try {
    const invitation = await db.invitationToken.findUnique({
      where: { token, isUsed: false }
    });

    if (!invitation) return { error: 'Token not registered', description: 'Make sure the token is entered correctly' };

    if (invitation.isUsed) return { error: 'Token already used', description: 'Make sure the registration token has not been used before' };

    if (new Date(invitation?.expires) < new Date()) return { error: 'Token has expired', description: `Token validity period is up to ${getTime(invitation?.expires)}` };

    if (invitation?.usageCount >= invitation?.maxUsageCount)
      return { error: 'Token reached maximum usage limit', description: `Registration token is valid for ${invitation.maxUsageCount} times` };

    return { success: 'Token verified', description: 'Page will redirect soon, complete all required data' };
  } catch (error) {
    console.error('[GET_INVITATION_TOKEN]:', error);
    return { error: 'Error', description: 'An error occurred' };
  }
}
