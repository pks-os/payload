'use client'
import type { FormProps, UserWithToken } from '@payloadcms/ui'
import type {
  ClientCollectionConfig,
  DocumentPermissions,
  DocumentPreferences,
  FormState,
  LoginWithUsernameOptions,
} from 'payload'

import {
  ConfirmPasswordField,
  EmailAndUsernameFields,
  Form,
  FormSubmit,
  PasswordField,
  RenderFields,
  useAuth,
  useConfig,
  useServerFunctions,
  useTranslation,
} from '@payloadcms/ui'
import React from 'react'

export const CreateFirstUserClient: React.FC<{
  docPermissions: DocumentPermissions
  docPreferences: DocumentPreferences
  initialState: FormState
  loginWithUsername?: false | LoginWithUsernameOptions
  userSlug: string
}> = ({ docPermissions, docPreferences, initialState, loginWithUsername, userSlug }) => {
  const {
    config: {
      routes: { admin, api: apiRoute },
      serverURL,
    },
    getEntityConfig,
  } = useConfig()

  const { getFormState } = useServerFunctions()

  const { t } = useTranslation()
  const { setUser } = useAuth()

  const collectionConfig = getEntityConfig({ collectionSlug: userSlug }) as ClientCollectionConfig

  const onChange: FormProps['onChange'][0] = React.useCallback(
    async ({ formState: prevFormState }) => {
      const { state } = await getFormState({
        collectionSlug: userSlug,
        docPermissions,
        docPreferences,
        formState: prevFormState,
        operation: 'create',
        schemaPath: `_${userSlug}.auth`,
      })

      return state
    },
    [userSlug, getFormState, docPermissions, docPreferences],
  )

  const handleFirstRegister = (data: UserWithToken) => {
    setUser(data)
  }

  return (
    <Form
      action={`${serverURL}${apiRoute}/${userSlug}/first-register`}
      initialState={initialState}
      method="POST"
      onChange={[onChange]}
      onSuccess={handleFirstRegister}
      redirect={admin}
      validationOperation="create"
    >
      <EmailAndUsernameFields
        className="emailAndUsername"
        loginWithUsername={loginWithUsername}
        operation="create"
        readOnly={false}
        t={t}
      />
      <PasswordField
        autoComplete="off"
        field={{
          name: 'password',
          label: t('authentication:newPassword'),
          required: true,
        }}
      />
      <ConfirmPasswordField />
      <RenderFields
        fields={collectionConfig.fields}
        forceRender
        parentIndexPath=""
        parentPath=""
        parentSchemaPath={userSlug}
        permissions={null}
        readOnly={false}
      />
      <FormSubmit size="large">{t('general:create')}</FormSubmit>
    </Form>
  )
}
