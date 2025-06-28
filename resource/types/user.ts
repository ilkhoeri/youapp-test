import * as db from '@prisma/client';
import { UserGender } from '../schemas/user';

export type ElaboratedUserX = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  /** Reference ID / External ID / Public ID */
  refId: string;
  username: string;
  firstName: string;
  lastName?: string | null;
  name: string;
  email: string;
  emailVerified: Date | null;
  password: string | null;
  image: string | null;
  phone: string | null;
  isTwoFactorEnabled: boolean;
  role: db.$Enums.UserRole;
  status: db.$Enums.AccountStatus;
  /** Nomor KTP / SIM */
  nationalId?: string | null;
  /** NPWP */
  taxId?: string | null;
  /**  */
  likeIds?: string[] | null;
  /**  */
  favoriteIds?: string[] | null;
  /**  */
  saveIds?: string[] | null;
  lastOnline?: Date | null;
  lastSeen?: Date | null;
};

export type ElaboratedUser = db.User;

type UserAbout = Omit<db.About, 'gender'> & { gender?: UserGender };

export type ExtendededCurrentlyActiveUser = {
  about?: UserAbout | null;
  chats?: db.Chat[] | null;
  seenMessages?: db.Message[] | null;
  messages?: db.Message[] | null;
  educations?: db.Education[] | null;
  /** Referensi profesional */
  references?: db.Reference[] | null;
  /** Karir yang pernah dilalui user */
  careers?: db.Career[] | null;
  /** Perusahaan tempat user bekerja saat ini */
  currentCompanyId?: string | null;
  currentCompany?: db.Company | null;
  /**  */
  address?: db.Address | null;
  /**  */
  links?: db.Link[] | null;
  /**  */
  testimony?: db.Testimony[] | null;
  /**  */
  ownedTeams?: db.Team[] | null;
  teamIDs?: string[];
  /**  */
  teams?: db.Team[] | null;
  followedByIDs?: string[];
  /**  */
  followedBy?: db.User[] | null;
  followingIDs?: string[] | null;
  /**  */
  following?: db.User[] | null;
  /**  */
  notifications?: db.Notification[] | null;
  /**  */
  notificationSettings?: db.UserNotificationSetting | null;
  /**  */
  transactionAccount?: db.TransactionAccount[] | null;
  /** Relasi untuk token yang dibuat oleh user */
  createdTokens?: db.InvitationToken[] | null;
  /** Relasi untuk token yang digunakan oleh user */
  usedToken?: db.InvitationToken[] | null;
  // isOAuth: boolean;
};

declare global {
  namespace PrismaJson {
    type UserIdentifiersType = {
      nationalId?: string;
      taxId?: string;
    };
  }
}

// export type Account = Nullable<db.User> | null;
export type Account = (ElaboratedUser & ExtendededCurrentlyActiveUser) | null;

export type IsRole = ElaboratedUser['role'];
// export const IsRole = Object.values(db.$Enums.UserRole);
export const IsRole = ['SUPERADMIN', 'ADMIN', 'USER'];

export type IsAccountStatus = ElaboratedUser['status'];
export const IsAccountStatus = Object.values(db.$Enums.AccountStatus);

export interface Session {
  session: Account;
}

export interface ElaboratedSession {
  session: (ElaboratedUser & { isOAuth: boolean }) | null;
}

export namespace USER {
  export type TEAM = db.Team & {};
  export type ADDRESS = db.Address & {};
  export type LINK = db.Link & {};
  export type LINKS = db.Link[] | null;
}

export namespace FORM_USER {
  export interface FORM_ADDRESS {
    data: AddressProps | null | undefined;
  }
  export interface FORM_LINK {
    data: db.Link | null;
  }
}

export type AddressProps = {
  country?: string | null;
  state?: string | null;
  postalcode?: string | null;
  street?: string | null;
  city?: string | null;
  regency?: string | null;
  district?: string | null;
  subdistrict?: string | null;
  village?: string | null;
  // optional fo user schema
  id?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  notes?: string[];
  visibility?: db.$Enums.Visibility | null;
  userId?: string | null;
};

type SecureFromOtherUser = keyof typeof pickFromOtherUser;

export type MinimalAccount = Pick<NonNullable<Account>, SecureFromOtherUser>;

export const pickFromOtherUser = {
  id: true,
  // refId: true,
  email: true,
  image: true,
  // name: true,
  username: true,
  // firstName: true,
  // lastName: true,
  // lastOnline: true,
  lastSeen: true
  // chatIds: true,
  // createdAt: true
}; // as db.Prisma.UserSelect;
