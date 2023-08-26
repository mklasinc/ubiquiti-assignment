import { useStore } from '@/store'
import cx from 'clsx'
import { TrashIcon } from '@heroicons/react/24/outline'
import { Leva } from 'leva'
import { noop } from '@/utils/noop'
import type { DeviceData } from '@/store'

export const UI = ({ debug = false }: { debug: boolean }) => {
  const devices = useStore((state) => state.devices)
  const activeDevice = useStore((state) => state.activeDevice)
  const removeDevice = useStore((state) => state.removeDevice)
  const setActiveDevice = useStore((state) => state.setActiveDevice)
  const raycasterTarget = useStore((state) => state.raycasterTarget)
  const isDraggingToolActive = useStore((state) => state.isDraggingToolActive)
  const isPlacementToolActive = useStore((state) => state.isPlacementToolActive)
  const hasInteractedWithPlacementTool = useStore((state) => state.hasInteractedWithPlacementTool)
  const setIsPlacementToolActive = useStore((state) => state.setIsPlacementToolActive)

  return (
    <div className="overlay p-4 w-full h-full absolute top-0 left-0">
      <div
        className="side-panel p-4 top-0 left-0 h-full w-[300px] bg-white rounded-lg"
        style={{
          boxShadow: '0px 4px 30px 0px rgba(170, 166, 166, 0.25)',
        }}
      >
        <div className="settings-container relative min-h-[250px] w-full">
          <div className="py-2 w-full flex justify-between items-center border-b border-black/10">
            <h2 className="uppercase font-bold text-s tracking-wides">Settings</h2>
          </div>
          <Leva
            neverHide
            fill
            flat
            titleBar={false}
            collapsed={false}
            theme={{
              colors: {
                elevation1: 'transparent',
                elevation2: 'transparent',
                elevation3: 'rgba(255, 255, 255, 0.1)',
                highlight1: 'black',
                highlight2: 'black',
                highlight3: 'black',
              },
              sizes: {
                rootWidth: '100%',
              },
            }}
          />
        </div>

        <div className="py-2 w-full flex justify-between items-center border-b border-black/10">
          <h2 className="uppercase font-bold text-s tracking-wides">Devices</h2>
        </div>
        <div className=" overflow-y-auto h-[calc(100%-4rem)]">
          {devices.length === 0 && <div className="font-normal text-xs text-gray-400 truncate mt-2">No devices</div>}
          {devices.map((device) => (
            <DeviceItem
              key={device.id}
              data={device}
              onClick={() => {
                setActiveDevice(device)
              }}
              isActive={activeDevice?.id === device.id}
              onRemove={(e) => {
                removeDevice(device.id)
                e.stopPropagation()
              }}
            />
          ))}
        </div>
      </div>

      {debug && (
        <div className="debug-ui text-3xl font-bold underline absolute right-0 top-0 m-4">
          <div>{raycasterTarget ? raycasterTarget?.name : 'Nothing hovered'}</div>
          <div>Dragging tool: {isDraggingToolActive ? 'yes' : 'no'}</div>
        </div>
      )}

      <div className="absolute bottom-4 left-[50%] translate-x-[-50%] flex flex-col items-center">
        <div
          className={cx(
            'bg-white rounded-lg p-3 text-black font-normal text-xs text-gray-400 pointer-events-none transition-opacity',
            hasInteractedWithPlacementTool && 'opacity-0'
          )}
        >
          TIP: Click on placement tool below to start adding devices
        </div>
        <div
          className="placement-tool mt-2 cursor-pointer h-[64px] w-[64px] bg-white rounded-2xl p-2"
          style={{
            boxShadow: '0px 4px 30px 0px rgba(170, 166, 166, 0.25)',
          }}
        >
          <div
            className={cx('opacity-[0.5] w-full h-full rounded-lg', {
              'bg-active': isPlacementToolActive,
              'bg-gray-200': !isPlacementToolActive,
            })}
            onClick={() => {
              setIsPlacementToolActive(!isPlacementToolActive)
            }}
          >
            <img className="placement-tool-icon" src="/device-icon.png" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function DeviceItem({
  data,
  isActive = false,
  onClick = noop,
  onRemove = noop,
  style = {},
  className = '',
}: {
  data: DeviceData
  onClick: () => void
  isActive: boolean
  onRemove: (event: any) => void
  style?: React.CSSProperties
  className?: string
}) {
  return (
    <div
      onClick={onClick}
      className={cx(
        'flex items-center justify-between my-2 p-2 rounded-md cursor-pointer transition-colors ',
        className,
        isActive && 'bg-[#9e9e9e]/20'
      )}
      style={style}
    >
      <div className="flex items-center justify-center overflow-hidden">
        <div className="capitalize font-bold text-xs mr-2">{data.name}</div>
        <div className="font-normal text-xs text-gray-400 truncate mt-[1px]">{data.id}</div>
      </div>
      <div className="pl-2">
        <button className="item-delete-btn rounded p-1 hover:bg-red-500 transition-colors" onClick={onRemove}>
          <TrashIcon className="item-delete-btn-icon w-4 h-4 text-red-500 opacity-80" />
        </button>
      </div>
    </div>
  )
}
