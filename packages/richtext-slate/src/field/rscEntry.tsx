import { RenderServerComponent } from '@payloadcms/ui/elements/RenderServerComponent'
import {
  type ClientComponentProps,
  type ClientField,
  createClientFields,
  deepCopyObjectSimple,
  type Field,
  type RichTextFieldClient,
  type ServerComponentProps,
} from 'payload'
import React from 'react'

import type { AdapterArguments, RichTextCustomElement, RichTextCustomLeaf } from '../types.js'

import { elements as elementTypes } from '../field/elements/index.js'
import { defaultLeaves as leafTypes } from '../field/leaves/index.js'
import { linkFieldsSchemaPath } from './elements/link/shared.js'
import { uploadFieldsSchemaPath } from './elements/upload/shared.js'
import { RichTextField } from './index.js'
export const RscEntrySlateField: React.FC<
  {
    args: AdapterArguments
  } & ClientComponentProps &
    ServerComponentProps
> = ({
  args,
  clientField,
  forceRender,
  i18n,
  indexPath,
  parentPath,
  parentSchemaPath,
  path,
  payload,
  readOnly,
  renderedBlocks,
  schemaPath,
}) => {
  const componentMap: Map<string, ClientField[] | React.ReactNode> = new Map()

  const clientProps = {
    schemaPath,
  }

  ;(args?.admin?.leaves || Object.values(leafTypes)).forEach((leaf) => {
    let leafObject: RichTextCustomLeaf

    if (typeof leaf === 'object' && leaf !== null) {
      leafObject = leaf
    } else if (typeof leaf === 'string' && leafTypes[leaf]) {
      leafObject = leafTypes[leaf]
    }

    if (leafObject) {
      const LeafButton = leafObject.Button
      const LeafComponent = leafObject.Leaf

      componentMap.set(
        `leaf.button.${leafObject.name}`,
        <RenderServerComponent
          clientProps={clientProps}
          Component={LeafButton}
          importMap={payload.importMap}
        />,
      )

      componentMap.set(
        `leaf.component.${leafObject.name}`,
        <RenderServerComponent
          clientProps={clientProps}
          Component={LeafComponent}
          importMap={payload.importMap}
        />,
      )

      if (Array.isArray(leafObject.plugins)) {
        leafObject.plugins.forEach((Plugin, i) => {
          componentMap.set(
            `leaf.plugin.${leafObject.name}.${i}`,
            <RenderServerComponent
              clientProps={clientProps}
              Component={Plugin}
              importMap={payload.importMap}
            />,
          )
        })
      }
    }
  })
  ;(args?.admin?.elements || Object.values(elementTypes)).forEach((el) => {
    let element: RichTextCustomElement

    if (typeof el === 'object' && el !== null) {
      element = el
    } else if (typeof el === 'string' && elementTypes[el]) {
      element = elementTypes[el]
    }

    if (element) {
      const ElementButton = element.Button
      const ElementComponent = element.Element

      if (ElementButton) {
        componentMap.set(
          `element.button.${element.name}`,
          <RenderServerComponent
            clientProps={clientProps}
            Component={ElementButton}
            importMap={payload.importMap}
          />,
        )
      }
      componentMap.set(
        `element.component.${element.name}`,
        <RenderServerComponent
          clientProps={clientProps}
          Component={ElementComponent}
          importMap={payload.importMap}
        />,
      )

      if (Array.isArray(element.plugins)) {
        element.plugins.forEach((Plugin, i) => {
          componentMap.set(
            `element.plugin.${element.name}.${i}`,
            <RenderServerComponent
              clientProps={clientProps}
              Component={Plugin}
              importMap={payload.importMap}
            />,
          )
        })
      }

      switch (element.name) {
        case 'link': {
          let clientFields = deepCopyObjectSimple(
            args.admin?.link?.fields,
          ) as unknown as ClientField[]
          clientFields = createClientFields({
            clientFields,
            defaultIDType: payload.config.db.defaultIDType,
            fields: args.admin?.link?.fields as Field[],
            i18n,
          })

          componentMap.set(linkFieldsSchemaPath, clientFields)

          break
        }

        case 'upload': {
          const uploadEnabledCollections = payload.config.collections.filter(
            ({ admin: { enableRichTextRelationship, hidden }, upload }) => {
              if (hidden === true) {
                return false
              }

              return enableRichTextRelationship && Boolean(upload) === true
            },
          )

          uploadEnabledCollections.forEach((collection) => {
            if (args?.admin?.upload?.collections[collection.slug]?.fields) {
              let clientFields = deepCopyObjectSimple(
                args?.admin?.upload?.collections[collection.slug]?.fields,
              ) as unknown as ClientField[]
              clientFields = createClientFields({
                clientFields,
                defaultIDType: payload.config.db.defaultIDType,
                fields: args?.admin?.upload?.collections[collection.slug]?.fields,
                i18n,
              })

              componentMap.set(`${uploadFieldsSchemaPath}.${collection.slug}`, clientFields)
            }
          })

          break
        }

        case 'relationship':
          break
      }
    }
  })

  return (
    <RichTextField
      componentMap={Object.fromEntries(componentMap)}
      field={clientField as RichTextFieldClient}
      forceRender={forceRender}
      indexPath={indexPath}
      parentPath={parentPath}
      parentSchemaPath={parentSchemaPath}
      path={path}
      readOnly={readOnly}
      renderedBlocks={renderedBlocks}
      schemaPath={schemaPath}
    />
  )
}