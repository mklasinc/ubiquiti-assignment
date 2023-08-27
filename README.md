# Ubiquiti: test assignment

This repository contains the code for Ubiquiti's 3D Fullstack Web Developer assignment.

## Features

The project features a 3D view of an office floorplan, a Wi-Fi device placement tool docked in the bottom of the screen, and a side panel with settings and a list of Wi-Fi devices placed around the 3D scene.

### Navigation

Drag to rotate the camera around the floorplan model, pinch to zoom, and drag with two fingers to pan.
You can also use camera control buttons in the side panel to zoom or reset the camera to it's original position.

### Adding a device

Use the placement tool (dock in the bottom center of the screen) to place Wi-Fi device models in the 3D scene. Click on the placement tool to activate it, move cursor to the desired spot in the scene, and click again to place the model. A placement indicator will tell you whether placement is allowed or not - red indicator communicates placement is not allowed (e.g. on the floor), and bright blue indicator communicates movement is allowed (e.g. on walls). Currently, only placing on walls is allowed. Once you have placed a device in the scene, it will also appear in the list of devices in the side panel.

### Focusing on placed device

To focus the camera on a particular Wi-Fi device, click on the placed device either in the 3D scene or in the device list in the side panel.

### Changing device position

Once the device model has been placed in the scene, it is possible to change its position through dragging\*. <br/>

_\*see [Limitations](#limitations)_

### Removing a device

To remove a given Wi-Fi device from the scene, there are two options: either click on the trash icon next to the device item in the side panel, or focus on the device in the 3D scene by clicking on it, which will show an info tooltip above the target device, and then click on the trash icon inside the tooltip to trigger device removal.

### Changing scene settings

The side panel includes several sliders for adjusting visual settings for the 3D scene.

## Limitations

Dragging behavior is currently limited. I wanted to constrain device placement to walls in order to mimic real-world scenarios, but I refrained from storing and ussing device-to-wall relationships due to time constraints. That means dragging a placed device around the scene has no awareness of the wall on which it has been originally placed, so it is, for instance, possible to drag and drop a device into thin air, or behind a wall etc. The next iteration of the project should store device-wall references, and that information should in turn be used to constrain dragging only to wall surfaces.
