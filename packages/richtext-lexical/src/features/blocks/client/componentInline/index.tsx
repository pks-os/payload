'use client'

import React, { useCallback, useEffect, useRef } from 'react'
const baseClass = 'inline-block'

import type { BlocksFieldClient } from 'payload'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { mergeRegister } from '@lexical/utils'
import { getTranslation } from '@payloadcms/translations'
import { Button, useTranslation } from '@payloadcms/ui'
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from 'lexical'

import type { InlineBlockFields } from '../nodes/InlineBlocksNode.js'

import { useEditorConfigContext } from '../../../../lexical/config/client/EditorConfigProvider.js'
import { $isInlineBlockNode } from '../nodes/InlineBlocksNode.js'
import { OPEN_INLINE_BLOCK_DRAWER_COMMAND } from '../plugin/commands.js'
import './index.scss'

type Props = {
  readonly formData: InlineBlockFields
  readonly nodeKey: string
}

export const InlineBlockComponent: React.FC<Props> = (props) => {
  const { formData, nodeKey } = props
  const [editor] = useLexicalComposerContext()
  const { i18n, t } = useTranslation<object, string>()
  const {
    fieldProps: { featureClientSchemaMap, readOnly, schemaPath },
  } = useEditorConfigContext()
  const inlineBlockElemElemRef = useRef<HTMLDivElement | null>(null)
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)

  const componentMapRenderedBlockPath = `${schemaPath}.lexical_internal_feature.blocks.lexical_inline_blocks.${formData.blockType}`

  const clientSchemaMap = featureClientSchemaMap['blocks']

  const blocksField: BlocksFieldClient = clientSchemaMap[
    componentMapRenderedBlockPath
  ][0] as BlocksFieldClient

  const clientBlock = blocksField.blocks[0]

  const removeInlineBlock = useCallback(() => {
    editor.update(() => {
      $getNodeByKey(nodeKey)?.remove()
    })
  }, [editor, nodeKey])

  const $onDelete = useCallback(
    (event: KeyboardEvent) => {
      const deleteSelection = $getSelection()
      if (isSelected && $isNodeSelection(deleteSelection)) {
        event.preventDefault()
        editor.update(() => {
          deleteSelection.getNodes().forEach((node) => {
            if ($isInlineBlockNode(node)) {
              node.remove()
            }
          })
        })
      }
      return false
    },
    [editor, isSelected],
  )
  const onClick = useCallback(
    (payload: MouseEvent) => {
      const event = payload
      // Check if inlineBlockElemElemRef.target or anything WITHIN inlineBlockElemElemRef.target was clicked
      if (
        event.target === inlineBlockElemElemRef.current ||
        inlineBlockElemElemRef.current?.contains(event.target as Node)
      ) {
        if (event.shiftKey) {
          setSelected(!isSelected)
        } else {
          if (!isSelected) {
            clearSelection()
            setSelected(true)
          }
        }
        return true
      }

      return false
    },
    [isSelected, setSelected, clearSelection],
  )

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand<MouseEvent>(CLICK_COMMAND, onClick, COMMAND_PRIORITY_LOW),

      editor.registerCommand(KEY_DELETE_COMMAND, $onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, $onDelete, COMMAND_PRIORITY_LOW),
    )
  }, [clearSelection, editor, isSelected, nodeKey, $onDelete, setSelected, onClick])

  const blockDisplayName = clientBlock?.labels?.singular
    ? getTranslation(clientBlock.labels.singular, i18n)
    : clientBlock?.slug

  const Label = clientBlock?.admin?.components?.Label

  return (
    <div
      className={[
        baseClass,
        baseClass + '-' + formData.blockType,
        isSelected && `${baseClass}--selected`,
      ]
        .filter(Boolean)
        .join(' ')}
      ref={inlineBlockElemElemRef}
    >
      {Label ? Label : <div>{getTranslation(clientBlock.labels!.singular, i18n)}</div>}
      {editor.isEditable() && (
        <div className={`${baseClass}__actions`}>
          <Button
            buttonStyle="icon-label"
            className={`${baseClass}__editButton`}
            disabled={readOnly}
            el="div"
            icon="edit"
            onClick={() => {
              editor.dispatchCommand(OPEN_INLINE_BLOCK_DRAWER_COMMAND, {
                fields: formData,
                nodeKey,
              })
            }}
            round
            size="small"
            tooltip={t('lexical:blocks:inlineBlocks:edit', { label: blockDisplayName })}
          />
          <Button
            buttonStyle="icon-label"
            className={`${baseClass}__removeButton`}
            disabled={readOnly}
            icon="x"
            onClick={(e) => {
              e.preventDefault()
              removeInlineBlock()
            }}
            round
            size="small"
            tooltip={t('lexical:blocks:inlineBlocks:remove', { label: blockDisplayName })}
          />
        </div>
      )}
    </div>
  )
}
