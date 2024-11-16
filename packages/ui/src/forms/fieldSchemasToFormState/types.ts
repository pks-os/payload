import type {
  Data,
  Field,
  FieldSchemaMap,
  FieldState,
  FormState,
  Operation,
  PayloadRequest,
  SanitizedFieldPermissions,
} from 'payload'

export type RenderFieldArgs = {
  data: Data
  fieldConfig: Field
  fieldSchemaMap: FieldSchemaMap
  fieldState: FieldState
  formState: FormState
  indexPath: string
  operation: Operation
  parentPath: string
  parentSchemaPath: string
  path: string
  permissions:
    | {
        [fieldName: string]: SanitizedFieldPermissions
      }
    | null
    | SanitizedFieldPermissions
  previousFieldState: FieldState
  req: PayloadRequest
  schemaPath: string
  siblingData: Data
}

export type RenderFieldMethod = (args: RenderFieldArgs) => void
