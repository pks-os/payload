'use client'

import type { UploadFieldClientProps } from 'payload'

import React from 'react'

import { useField } from '../../forms/useField/index.js'
import { withCondition } from '../../forms/withCondition/index.js'
import { useConfig } from '../../providers/Config/index.js'
import './index.scss'
import { UploadInput } from './Input.js'

export { UploadInput } from './Input.js'
export type { UploadInputProps } from './Input.js'

export const baseClass = 'upload'

export function UploadComponent(props: UploadFieldClientProps) {
  const {
    field: {
      name,
      admin: { allowCreate, className, description, isSortable, style, width } = {},
      hasMany,
      label,
      localized,
      maxRows,
      relationTo,
      required,
    },
    path,
    readOnly,
    validate,
  } = props

  const { config } = useConfig()

  const memoizedValidate = React.useCallback(
    (value, options) => {
      if (typeof validate === 'function') {
        return validate(value, { ...options, required })
      }
    },
    [validate, required],
  )

  const {
    customComponents: { AfterInput, BeforeInput, Description, Error, Label } = {},
    filterOptions,
    setValue,
    showError,
    value,
  } = useField<string | string[]>({
    path,
    validate: memoizedValidate,
  })

  return (
    <UploadInput
      AfterInput={AfterInput}
      allowCreate={allowCreate !== false}
      api={config.routes.api}
      BeforeInput={BeforeInput}
      className={className}
      Description={Description}
      description={description}
      Error={Error}
      filterOptions={filterOptions}
      hasMany={hasMany}
      isSortable={isSortable}
      label={label}
      Label={Label}
      localized={localized}
      maxRows={maxRows}
      onChange={setValue}
      path={path}
      readOnly={readOnly}
      relationTo={relationTo}
      required={required}
      serverURL={config.serverURL}
      showError={showError}
      style={style}
      value={value}
      width={width}
    />
  )
}

export const UploadField = withCondition(UploadComponent)
