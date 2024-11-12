'use client'

import type { TFunction } from '@payloadcms/translations'
import type { FieldPermissions, LoginWithUsernameOptions } from 'payload'

import { email, username } from 'payload/shared'
import React, { Fragment } from 'react'

import { EmailField } from '../../fields/Email/index.js'
import { TextField } from '../../fields/Text/index.js'

type RenderEmailAndUsernameFieldsProps = {
  className?: string
  loginWithUsername?: false | LoginWithUsernameOptions
  operation?: 'create' | 'update'
  permissions?: {
    [fieldName: string]: FieldPermissions
  }
  readOnly: boolean
  t: TFunction
}

export function EmailAndUsernameFields(props: RenderEmailAndUsernameFieldsProps) {
  const { className, loginWithUsername, t } = props

  const showEmailField =
    !loginWithUsername || loginWithUsername?.requireEmail || loginWithUsername?.allowEmailLogin

  const showUsernameField = Boolean(loginWithUsername)

  return (
    <Fragment>
      {showEmailField ? (
        <EmailField
          field={{
            name: 'email',
            admin: {
              autoComplete: 'off',
            },
            label: t('general:email'),
            required: !loginWithUsername || (loginWithUsername && loginWithUsername.requireEmail),
          }}
          indexPath=""
          parentPath=""
          parentSchemaPath=""
          path="email"
          schemaPath="email"
          validate={email}
        />
      ) : null}
      {showUsernameField && (
        <TextField
          field={{
            name: 'username',
            label: t('authentication:username'),
            required: loginWithUsername && loginWithUsername.requireUsername,
          }}
          indexPath=""
          parentPath=""
          parentSchemaPath=""
          path="username"
          schemaPath="username"
          validate={username}
        />
      )}
    </Fragment>
  )
}
