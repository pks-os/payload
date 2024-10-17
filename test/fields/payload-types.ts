/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated by Payload.
 * DO NOT MODIFY IT BY HAND. Instead, modify your source Payload config,
 * and re-run `payload generate:types` to regenerate this file.
 */

export interface Config {
  auth: {
    users: UserAuthOperations;
  };
  collections: {
    users: User;
    'array-fields': ArrayField;
    'block-fields': BlockField;
    'row-fields': RowField;
    'payload-locked-documents': PayloadLockedDocument;
    'payload-preferences': PayloadPreference;
    'payload-migrations': PayloadMigration;
  };
  db: {
    defaultIDType: string;
  };
  globals: {};
  locale: 'en' | 'es';
  user: User & {
    collection: 'users';
  };
}
export interface UserAuthOperations {
  forgotPassword: {
    email: string;
    password: string;
  };
  login: {
    email: string;
    password: string;
  };
  registerFirstUser: {
    email: string;
    password: string;
  };
  unlock: {
    email: string;
    password: string;
  };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "users".
 */
export interface User {
  id: string;
  canViewConditionalField?: boolean | null;
  updatedAt: string;
  createdAt: string;
  email: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiration?: string | null;
  salt?: string | null;
  hash?: string | null;
  loginAttempts?: number | null;
  lockUntil?: string | null;
  password?: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "array-fields".
 */
export interface ArrayField {
  id: string;
  title?: string | null;
  items: {
    text: string;
    subArray?:
      | {
          text?: string | null;
          id?: string | null;
        }[]
      | null;
    id?: string | null;
  }[];
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "block-fields".
 */
export interface BlockField {
  id: string;
  blocks: (
    | {
        text: string;
        id?: string | null;
        blockName?: string | null;
        blockType: 'content';
      }
    | {
        number: number;
        id?: string | null;
        blockName?: string | null;
        blockType: 'number';
      }
  )[];
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "row-fields".
 */
export interface RowField {
  id: string;
  title: string;
  field_with_width_a?: string | null;
  field_with_width_b?: string | null;
  field_with_width_30_percent?: string | null;
  field_with_width_60_percent?: string | null;
  field_with_width_20_percent?: string | null;
  field_within_collapsible_a?: string | null;
  field_within_collapsible_b?: string | null;
  field_20_percent_width_within_row_a?: string | null;
  no_set_width_within_row_b?: string | null;
  no_set_width_within_row_c?: string | null;
  field_20_percent_width_within_row_d?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-locked-documents".
 */
export interface PayloadLockedDocument {
  id: string;
  document?:
    | ({
        relationTo: 'users';
        value: string | User;
      } | null)
    | ({
        relationTo: 'array-fields';
        value: string | ArrayField;
      } | null)
    | ({
        relationTo: 'block-fields';
        value: string | BlockField;
      } | null)
    | ({
        relationTo: 'row-fields';
        value: string | RowField;
      } | null);
  globalSlug?: string | null;
  user: {
    relationTo: 'users';
    value: string | User;
  };
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-preferences".
 */
export interface PayloadPreference {
  id: string;
  user: {
    relationTo: 'users';
    value: string | User;
  };
  key?: string | null;
  value?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-migrations".
 */
export interface PayloadMigration {
  id: string;
  name?: string | null;
  batch?: number | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "auth".
 */
export interface Auth {
  [k: string]: unknown;
}


declare module 'payload' {
  // @ts-ignore 
  export interface GeneratedTypes extends Config {}
}