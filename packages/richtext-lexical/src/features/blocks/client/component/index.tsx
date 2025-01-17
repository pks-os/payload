'use client'

import {
  Button,
  Collapsible,
  Drawer,
  EditDepthProvider,
  ErrorPill,
  Form,
  formatDrawerSlug,
  FormSubmit,
  Pill,
  RenderFields,
  SectionTitle,
  useDocumentInfo,
  useEditDepth,
  useFormSubmitted,
  useServerFunctions,
  useTranslation,
} from '@payloadcms/ui'
import { abortAndIgnore } from '@payloadcms/ui/shared'
import { reduceFieldsToValues } from 'payload/shared'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const baseClass = 'lexical-block'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { getTranslation } from '@payloadcms/translations'
import { $getNodeByKey } from 'lexical'
import { type BlocksFieldClient, type CollapsedPreferences, type FormState } from 'payload'
import { v4 as uuid } from 'uuid'

import type { BlockFields } from '../../server/nodes/BlocksNode.js'

import { useEditorConfigContext } from '../../../../lexical/config/client/EditorConfigProvider.js'
import { useLexicalDrawer } from '../../../../utilities/fieldsDrawer/useLexicalDrawer.js'
import { $isBlockNode } from '../nodes/BlocksNode.js'
import { BlockContent } from './BlockContent.js'
import './index.scss'

type Props = {
  readonly children?: React.ReactNode
  readonly formData: BlockFields
  readonly nodeKey: string
}

export const BlockComponent: React.FC<Props> = (props) => {
  const { formData, nodeKey } = props
  const submitted = useFormSubmitted()
  const { id, collectionSlug, globalSlug } = useDocumentInfo()
  const {
    fieldProps: {
      featureClientSchemaMap,
      field: parentLexicalRichTextField,
      permissions,
      readOnly,
      schemaPath,
    },
    uuid: uuidFromContext,
  } = useEditorConfigContext()
  const onChangeAbortControllerRef = useRef(new AbortController())
  const editDepth = useEditDepth()

  const drawerSlug = formatDrawerSlug({
    slug: `lexical-blocks-create-${uuidFromContext}-${formData.id}`,
    depth: editDepth,
  })
  const { toggleDrawer } = useLexicalDrawer(drawerSlug, true)

  // Used for saving collapsed to preferences (and gettin' it from there again)
  // Remember, these preferences are scoped to the whole document, not just this form. This
  // is important to consider for the data path used in setDocFieldPreferences
  const { docPermissions, getDocPreferences, setDocFieldPreferences } = useDocumentInfo()
  const [editor] = useLexicalComposerContext()

  const { getFormState } = useServerFunctions()

  const [initialState, setInitialState] = useState<false | FormState | undefined>(false)

  const schemaFieldsPath = `${schemaPath}.lexical_internal_feature.blocks.lexical_blocks.${formData.blockType}.fields`

  const componentMapRenderedBlockPath = `${schemaPath}.lexical_internal_feature.blocks.lexical_blocks.${formData.blockType}`

  const clientSchemaMap = featureClientSchemaMap['blocks']

  const blocksField: BlocksFieldClient = clientSchemaMap[
    componentMapRenderedBlockPath
  ][0] as BlocksFieldClient

  const clientBlock = blocksField.blocks[0]

  const { i18n, t } = useTranslation<object, string>()

  // Field Schema
  useEffect(() => {
    const abortController = new AbortController()

    const awaitInitialState = async () => {
      const { state } = await getFormState({
        id,
        collectionSlug,
        data: formData,
        docPermissions: { fields: true },
        docPreferences: await getDocPreferences(),
        globalSlug,
        operation: 'update',
        renderAllFields: true,
        schemaPath: schemaFieldsPath,
        signal: abortController.signal,
      })

      if (state) {
        state.blockName = {
          initialValue: '',
          passesCondition: true,
          valid: true,
          value: formData.blockName,
        }

        setInitialState(state)
      }
    }

    if (formData) {
      void awaitInitialState()
    }

    return () => {
      abortAndIgnore(abortController)
    }
  }, [
    getFormState,
    schemaFieldsPath,
    id,
    collectionSlug,
    globalSlug,
    getDocPreferences,
    // DO NOT ADD FORMDATA HERE! Adding formData will kick you out of sub block editors while writing.
  ])

  const onChange = useCallback(
    async ({ formState: prevFormState }) => {
      abortAndIgnore(onChangeAbortControllerRef.current)

      const controller = new AbortController()
      onChangeAbortControllerRef.current = controller

      const { state: newFormState } = await getFormState({
        id,
        collectionSlug,
        docPermissions,
        docPreferences: await getDocPreferences(),
        formState: prevFormState,
        globalSlug,
        operation: 'update',
        schemaPath: schemaFieldsPath,
        signal: controller.signal,
      })

      if (!newFormState) {
        return prevFormState
      }

      newFormState.blockName = {
        initialValue: '',
        passesCondition: true,
        valid: true,
        value: formData.blockName,
      }

      return newFormState
    },

    [
      getFormState,
      id,
      collectionSlug,
      docPermissions,
      getDocPreferences,
      globalSlug,
      schemaFieldsPath,
      formData.blockName,
    ],
  )

  useEffect(() => {
    return () => {
      abortAndIgnore(onChangeAbortControllerRef.current)
    }
  }, [])

  const removeBlock = useCallback(() => {
    editor.update(() => {
      $getNodeByKey(nodeKey)?.remove()
    })
  }, [editor, nodeKey])

  const CustomLabel = initialState?.['_components']?.customComponents?.BlockLabel
  const CustomBlock = initialState?.['_components']?.customComponents?.Block

  const blockDisplayName = clientBlock?.labels?.singular
    ? getTranslation(clientBlock.labels.singular, i18n)
    : clientBlock?.slug

  const [isCollapsed, setIsCollapsed] = React.useState<boolean>()

  // TODO: Load collapsed preferences in RSC Field component
  useEffect(() => {
    void getDocPreferences().then((currentDocPreferences) => {
      const currentFieldPreferences = currentDocPreferences?.fields[parentLexicalRichTextField.name]
      const collapsedArray = currentFieldPreferences?.collapsed
      setIsCollapsed(collapsedArray ? collapsedArray.includes(formData.id) : false)
    })
  }, [parentLexicalRichTextField.name, formData.id, getDocPreferences])

  const onCollapsedChange = useCallback(
    (changedCollapsed: boolean) => {
      void getDocPreferences().then((currentDocPreferences) => {
        const currentFieldPreferences =
          currentDocPreferences?.fields[parentLexicalRichTextField.name]

        const collapsedArray = currentFieldPreferences?.collapsed

        const newCollapsed: CollapsedPreferences =
          collapsedArray && collapsedArray?.length ? collapsedArray : []

        if (changedCollapsed) {
          if (!newCollapsed.includes(formData.id)) {
            newCollapsed.push(formData.id)
          }
        } else {
          if (newCollapsed.includes(formData.id)) {
            newCollapsed.splice(newCollapsed.indexOf(formData.id), 1)
          }
        }

        setDocFieldPreferences(parentLexicalRichTextField.name, {
          collapsed: newCollapsed,
          hello: 'hi',
        })
      })
    },
    [getDocPreferences, parentLexicalRichTextField.name, setDocFieldPreferences, formData.id],
  )

  const EditButton = useMemo(
    () => () => (
      <Button
        buttonStyle="icon-label"
        className={`${baseClass}__editButton`}
        disabled={readOnly}
        el="div"
        icon="edit"
        onClick={() => {
          toggleDrawer()
        }}
        round
        size="small"
        tooltip={t('lexical:blocks:inlineBlocks:edit', { label: blockDisplayName })}
      />
    ),
    [blockDisplayName, readOnly, t, toggleDrawer],
  )

  const RemoveButton = useMemo(
    () => () => (
      <Button
        buttonStyle="icon-label"
        className={`${baseClass}__removeButton`}
        disabled={parentLexicalRichTextField?.admin?.readOnly || false}
        icon="x"
        onClick={(e) => {
          e.preventDefault()
          removeBlock()
        }}
        round
        tooltip="Remove Block"
      />
    ),
    [parentLexicalRichTextField?.admin?.readOnly, removeBlock],
  )

  const BlockCollapsible = useMemo(
    () =>
      ({
        children,
        editButton,
        errorCount,
        fieldHasErrors,
        Label,
        removeButton,
      }: {
        children?: React.ReactNode
        editButton?: boolean
        errorCount?: number
        fieldHasErrors?: boolean
        /**
         * Override the default label with a custom label
         */
        Label?: React.ReactNode
        removeButton?: boolean
      }) => (
        <div className={baseClass + ' ' + baseClass + '-' + formData.blockType}>
          <Collapsible
            className={[
              `${baseClass}__row`,
              fieldHasErrors ? `${baseClass}__row--has-errors` : `${baseClass}__row--no-errors`,
            ].join(' ')}
            collapsibleStyle={fieldHasErrors ? 'error' : 'default'}
            header={
              <div className={`${baseClass}__block-header`}>
                {(Label ?? CustomLabel) ? (
                  (Label ?? CustomLabel)
                ) : (
                  <div>
                    <Pill
                      className={`${baseClass}__block-pill ${baseClass}__block-pill-${formData?.blockType}`}
                      pillStyle="white"
                    >
                      {blockDisplayName}
                    </Pill>
                    <SectionTitle
                      path="blockName"
                      readOnly={parentLexicalRichTextField?.admin?.readOnly || false}
                    />
                    {fieldHasErrors && (
                      <ErrorPill count={errorCount ?? 0} i18n={i18n} withMessage />
                    )}
                  </div>
                )}

                <div>
                  {(CustomBlock && editButton !== false) || (!CustomBlock && editButton) ? (
                    <EditButton />
                  ) : null}
                  {removeButton !== false && editor.isEditable() ? <RemoveButton /> : null}
                </div>
              </div>
            }
            isCollapsed={isCollapsed}
            key={0}
            onToggle={(incomingCollapsedState) => {
              onCollapsedChange(incomingCollapsedState)
              setIsCollapsed(incomingCollapsedState)
            }}
          >
            {children}
          </Collapsible>
        </div>
      ),
    [
      CustomBlock,
      CustomLabel,
      EditButton,
      RemoveButton,
      blockDisplayName,
      editor,
      formData.blockType,
      i18n,
      isCollapsed,
      onCollapsedChange,
      parentLexicalRichTextField?.admin?.readOnly,
    ],
  )

  const BlockDrawer = useMemo(
    () => () => (
      <EditDepthProvider>
        <Drawer
          className={''}
          slug={drawerSlug}
          title={t(`lexical:blocks:inlineBlocks:${formData?.id ? 'edit' : 'create'}`, {
            label: blockDisplayName ?? t('lexical:blocks:inlineBlocks:label'),
          })}
        >
          {initialState ? (
            <>
              <RenderFields
                fields={clientBlock.fields}
                forceRender
                parentIndexPath=""
                parentPath="" // See Blocks feature path for details as for why this is empty
                parentSchemaPath={schemaFieldsPath}
                permissions={permissions}
                readOnly={false}
              />
              <FormSubmit>{t('fields:saveChanges')}</FormSubmit>
            </>
          ) : null}
        </Drawer>
      </EditDepthProvider>
    ),
    [
      initialState,
      drawerSlug,
      blockDisplayName,
      t,
      clientBlock.fields,
      schemaFieldsPath,
      permissions,
      // DO NOT ADD FORMDATA HERE! Adding formData will kick you out of sub block editors while writing.
    ],
  )

  // Memoized Form JSX
  const Block = useMemo(() => {
    if (!initialState) {
      return null
    }
    return (
      <Form
        beforeSubmit={[onChange]}
        fields={clientBlock.fields}
        initialState={initialState}
        onChange={[onChange]}
        onSubmit={(formState) => {
          // THis is only called when form is submitted from drawer - usually only the case if the block has a custom Block component
          const newData: any = reduceFieldsToValues(formState)
          newData.blockType = formData.blockType
          editor.update(() => {
            const node = $getNodeByKey(nodeKey)
            if (node && $isBlockNode(node)) {
              node.setFields(newData)
            }
          })
          toggleDrawer()
        }}
        submitted={submitted}
        uuid={uuid()}
      >
        <BlockContent
          baseClass={baseClass}
          BlockDrawer={BlockDrawer}
          Collapsible={BlockCollapsible}
          CustomBlock={CustomBlock}
          EditButton={EditButton}
          formData={formData}
          formSchema={clientBlock.fields}
          initialState={initialState}
          nodeKey={nodeKey}
          RemoveButton={RemoveButton}
        />
      </Form>
    )
  }, [
    BlockCollapsible,
    BlockDrawer,
    CustomBlock,
    RemoveButton,
    EditButton,
    editor,
    toggleDrawer,
    clientBlock.fields,
    // DO NOT ADD FORMDATA HERE! Adding formData will kick you out of sub block editors while writing.
    initialState,
    nodeKey,
    onChange,
    submitted,
  ])

  return Block
}
