'use client'

import { Icon } from '@iconify/react'
import React, { useCallback } from 'react'
import { Bounce, type ToastOptions, toast } from 'react-toastify'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default' | 'loading'

interface ToastContentProps {
  type: ToastType
  title?: string
  message?: string
  icon?: string
  component?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
  closeToast?: () => void
}

const TOAST_ICONS = {
  success: {
    icon: 'mdi:success',
    color: 'text-green-400',
    className: 'text-green-400',
    bgGradient: 'bg-[#14181df2]',
    gradientColor: '#389726',
    borderGradient: 'border-[#389726]',
    borderGradientColor: '#389726',
  },
  error: {
    icon: 'ic:outline-close',
    color: 'text-red-400',
    className: 'text-red-400',
    bgGradient: 'bg-[#14181df2]',
    gradientColor: '#ef4444',
    borderGradient: 'border-[#ef4444]',
    borderGradientColor: '#ef4444',
  },
  warning: {
    icon: 'mi:warning',
    color: 'text-yellow-400',
    className: 'text-yellow-400',
    bgGradient: 'bg-[#14181df2]',
    gradientColor: '#facc15',
    borderGradient: 'border-[#facc15]',
    borderGradientColor: '#facc15',
  },
  info: {
    icon: 'ic:outline-info',
    color: 'text-blue-400',
    className: 'text-blue-400',
    bgGradient: 'bg-[#14181df2]',
    gradientColor: '#60a5fa',
    borderGradient: 'border-[#60a5fa]',
    borderGradientColor: '#f0f0f0',
  },
  loading: {
    icon: 'line-md:uploading-loop',
    color: 'text-blue-400 animate-spin',
    className: 'text-blue-400',
    bgGradient: 'bg-[#14181df2]',
    gradientColor: '#60a5fa',
    borderGradient: 'border-[#60a5fa]',
    borderGradientColor: '#f0f0f0',
  },
  default: {
    icon: 'ic:round-notifications',
    color: 'text-gray-400',
    className: 'text-gray-400',
    bgGradient: 'bg-[#14181df2]',
    gradientColor: '#9ca3af',
    borderGradient: 'border-[#9ca3af]',
    borderGradientColor: '#9ca3af',
  },
}

const CloseButton = React.memo(({ closeToast }: { closeToast?: () => void }) => {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      closeToast?.()
    },
    [closeToast],
  )

  return (
    <Icon
      icon="vaadin:close"
      className="flex items-center justify-center rounded-full relative z-10 flex-shrink-0 cursor-pointer 
                    text-[#b4b4b4] hover:text-white transition-colors duration-200 drop-shadow-sm"
      onClick={handleClick}
      width={14}
      height={14}
    />
  )
})

CloseButton.displayName = 'CloseButton'

// 内容组件
const ToastContent: React.FC<ToastContentProps> = ({
  type,
  title,
  message,
  component,
  closeToast,
  icon,
  actionLabel,
  onAction,
}) => {
  const iconConfig = TOAST_ICONS[type]

  // 使用 useCallback 确保 closeToast 函数引用稳定
  const handleClose = useCallback(() => {
    closeToast?.()
  }, [closeToast])

  return (
    <div
      className={cn(
        'flex items-start gap-3 min-h-[60px] w-full backdrop-blur-md rounded-xl p-4 shadow-2xl relative overflow-hidden',
        iconConfig.bgGradient,
      )}
    >
      <div
        className="absolute left-0 top-0 w-full h-full rounded-xl"
        style={{
          background: '#0f1419',
          zIndex: -2,
        }}
      />
      <div
        className="absolute left-0 top-0 w-full h-full pointer-events-none rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${iconConfig.gradientColor}30 0%, ${iconConfig.gradientColor}20 15%, #14181df2 30%)`,
          zIndex: -1,
        }}
      />

      {/* 渐变边框层 */}
      <div
        className="absolute left-0 top-0 w-[600px] h-full pointer-events-none rounded-xl"
        style={{
          border: '2px solid transparent',
          backgroundImage: `linear-gradient(135deg, ${iconConfig.borderGradientColor}60 0%, ${iconConfig.borderGradientColor}40 5%, transparent 22%)`,
          backgroundOrigin: 'border-box',
          backgroundClip: 'border-box',
          WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
        }}
      />

      <div className="flex-shrink-0 mt-0.5 relative z-10 ">
        <div className="w-7 h-7 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
          <Icon
            icon={icon || iconConfig.icon}
            width={16}
            height={16}
            className={iconConfig.color}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1 flex-1 relative z-10">
        {component ?? (
          <>
            {title && (
              <div className="text-[16px] font-semibold leading-tight text-white/95 drop-shadow-sm">
                {title}
              </div>
            )}
            {message && (
              <div className="text-[13px] font-normal leading-relaxed text-white/75 drop-shadow-sm">
                {message}
              </div>
            )}
          </>
        )}
        {actionLabel && (
          <button
            type="button"
            className="mt-2 inline-flex items-center justify-center self-start rounded-md bg-white/10 px-3 py-1 text-xs font-medium text-white hover:bg-white/20 transition"
            onClick={() => {
              onAction?.()
              handleClose()
            }}
          >
            {actionLabel}
          </button>
        )}
      </div>
      <div className="relative z-10">
        <CloseButton closeToast={handleClose} />
      </div>
    </div>
  )
}

// 默认配置
const defaultToastOptions: ToastOptions = {
  position: 'bottom-right',
  autoClose: 30000,
  hideProgressBar: true,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: true,
  pauseOnFocusLoss: false,
  theme: 'dark',
  transition: Bounce,
}

interface ToastParams {
  title?: string
  message?: string
  icon?: string
  component?: React.ReactNode
  width?: string
  actionLabel?: string
  onAction?: () => void
  render?: (closeToast: () => void) => React.ReactNode
  options?: Partial<ToastOptions>
}

const createToast = (type: ToastType) => {
  return (params: ToastParams) => {
    const { title, message, component, options, icon, width } = params

    const toastStyle: React.CSSProperties = {
      background: 'transparent',
      padding: 0,
    }

    if (width) {
      toastStyle.width = width
      toastStyle.maxWidth = '90vw'
    }

    if (options?.style) {
      Object.assign(toastStyle, options.style)
    }

    return toast(
      ({ closeToast }) => {
        if (params.render) {
          return params.render(closeToast)
        }

        return (
          <ToastContent
            type={type}
            title={title}
            message={message || ''}
            icon={icon}
            component={component}
            actionLabel={params.actionLabel}
            onAction={params.onAction}
            closeToast={closeToast}
          />
        )
      },
      {
        ...defaultToastOptions,
        ...options,
        className: '!bg-transparent !p-0 !shadow-none',
        style: toastStyle,
      },
    )
  }
}

export const Toast = {
  success: createToast('success'),
  error: createToast('error'),
  warning: createToast('warning'),
  info: createToast('info'),
  loading: createToast('loading'),
  default: createToast('default'),
  dismiss: toast.dismiss,
}
