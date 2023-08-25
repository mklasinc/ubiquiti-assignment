import { useStore } from '@/store'
import cx from 'clsx'
import { TrashIcon, PencilIcon, EyeSlashIcon, FlagIcon, LightBulbIcon, PlusIcon } from '@heroicons/react/24/outline'

export const UI = () => {
  const hovered = useStore((state) => state.hovered)
  const storeSet = useStore((state) => state.set)
  const removeDevice = useStore((state) => state.removeDevice)
  const devices = useStore((state) => state.devices)
  const isPlacementToolActive = useStore((state) => state.isPlacementToolActive)

  return (
    <div className="overlay p-4 w-full h-full absolute top-0 left-0">
      <div
        className="side-panel p-4 top-0 left-0 h-full w-[300px] bg-white rounded-lg"
        style={{
          boxShadow: '0px 4px 30px 0px rgba(170, 166, 166, 0.25)',
        }}
      >
        <div className="w-full flex justify-between items-center border-b border-white/10">
          <h2 className="uppercase font-bold text-s tracking-wides">Devices</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between my-2">
              <div className="flex items-center justify-center overflow-hidden">
                <div className="font-medium text-sm mr-2">{device.name}</div>
                <div className="font-medium text-xs text-gray-300 truncate mt-[2px]">{device.id}</div>
              </div>
              <div className="pl-2">
                <button
                  className="item-delete-btn rounded p-1 hover:bg-red-500 transition-colors"
                  onClick={() => removeDevice(device.id)}
                >
                  <TrashIcon className="w-4 h-4 text-red-500 opacity-80 hover:opacity-100 hover:text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-3xl font-bold underline absolute right-0 top-0 m-4">
        {hovered ? hovered?.name : 'Nothing hovered'}
      </div>
      <div
        className="placement-tool cursor-pointer absolute bottom-4 left-[50%] translate-x-[-50%] w-[80px] h-[80px] bg-white rounded-2xl p-2"
        style={{
          boxShadow: '0px 4px 30px 0px rgba(170, 166, 166, 0.25)',
        }}
      >
        <div
          className={cx('opacity-[0.5] w-full h-full rounded-lg', {
            'bg-active': isPlacementToolActive,
            'bg-gray-200': !isPlacementToolActive,
          })}
          onClick={() => storeSet({ isPlacementToolActive: !isPlacementToolActive })}
        >
          <img className="placement-tool-icon" src="/device-icon.png" />
        </div>
      </div>
    </div>
  )
}
