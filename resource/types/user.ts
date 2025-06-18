import * as user from '@prisma/client';
import { UserGender } from '../schemas/user';

export type ElaboratedUser = {
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
  role: user.$Enums.UserRole;
  status: user.$Enums.AccountStatus;
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
  lastOnline?: Date;
  lastSeen?: Date;
};

type UserAbout = Omit<user.About, 'gender'> & { gender?: UserGender };

export type ExtendededCurrentlyActiveUser = {
  about?: UserAbout | null;
  chats?: user.Chat[] | null;
  seenMessages?: user.Message[] | null;
  messages?: user.Message[] | null;
  educations?: user.Education[] | null;
  /** Referensi profesional */
  references?: user.Reference[] | null;
  /** Karir yang pernah dilalui user */
  careers?: user.Career[] | null;
  /** Perusahaan tempat user bekerja saat ini */
  currentCompanyId?: string | null;
  currentCompany?: user.Company | null;
  /**  */
  address?: user.Address | null;
  /**  */
  links?: user.Link[] | null;
  /**  */
  testimony?: user.Testimony[] | null;
  /**  */
  ownedTeams?: user.Team[] | null;
  teamIDs?: string[];
  /**  */
  teams?: user.Team[] | null;
  followedByIDs?: string[];
  /**  */
  followedBy?: user.User[] | null;
  followingIDs?: string[] | null;
  /**  */
  following?: user.User[] | null;
  /**  */
  notifications?: user.Notification[] | null;
  /**  */
  notificationSettings?: user.UserNotificationSetting | null;
  /**  */
  transactionAccount?: user.TransactionAccount[] | null;
  /** Relasi untuk token yang dibuat oleh user */
  createdTokens?: user.InvitationToken[] | null;
  /** Relasi untuk token yang digunakan oleh user */
  usedToken?: user.InvitationToken[] | null;
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

// export type Account = Nullable<user.User> | null;
export type Account = (ElaboratedUser & ExtendededCurrentlyActiveUser) | null;

export type IsRole = ElaboratedUser['role'];
// export const IsRole = Object.values(user.$Enums.UserRole);
export const IsRole = ['SUPERADMIN', 'ADMIN', 'USER'];

export type IsAccountStatus = ElaboratedUser['status'];
export const IsAccountStatus = Object.values(user.$Enums.AccountStatus);

export interface Session {
  session: Account;
}

export interface ElaboratedSession {
  session: (ElaboratedUser & { isOAuth: boolean }) | null;
}

export namespace USER {
  export type TEAM = user.Team & {};
  export type ADDRESS = user.Address & {};
  export type LINK = user.Link & {};
  export type LINKS = user.Link[] | null;
}

export namespace FORM_USER {
  export interface FORM_ADDRESS {
    data: AddressProps | null | undefined;
  }
  export interface FORM_LINK {
    data: user.Link | null;
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
  visibility?: user.$Enums.Visibility | null;
  userId?: string | null;
};

type SecureFromOtherUser = keyof typeof pickFromOtherUser;

export type MinimalAccount = Pick<NonNullable<Account>, SecureFromOtherUser>;

export interface MessageReaction extends user.Reaction {
  user: MinimalAccount | null | undefined;
}

export interface Message extends user.Message {
  sender: MinimalAccount;
  seen: MinimalAccount[];
  reactions?: MessageReaction[] | null | undefined;
}

export interface AllChatProps extends user.Chat {
  users: MinimalAccount[];
  messages: Message[];
}

export const pickFromOtherUser = {
  id: true,
  refId: true,
  email: true,
  image: true,
  name: true,
  username: true,
  firstName: true,
  lastName: true,
  createdAt: true
};
