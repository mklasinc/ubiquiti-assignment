import { useStore } from '@/store'
import cx from 'clsx'

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
        <div className="text-3xl font-bold">Devices</div>
        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between my-2">
              <div className="flex items-center">
                <div className="w-[40px] h-[40px] bg-gray-200 rounded-lg mr-2"></div>
                <div className="text-lg">{device.name}</div>
              </div>
              <div onClick={() => removeDevice(device.id)} className="text-lg cursor-pointer hover:bg-red-500">
                🗑
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
