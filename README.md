# Dual Camera Card

A custom card for Home Assistant that displays two camera feeds side by side with responsive scaling.

## Features

- Display two camera feeds side by side
- Responsive design (stacks vertically on mobile)
- Configurable camera entities
- Maintains aspect ratio
- Click to show more info
- Error handling for unavailable cameras

## Installation

### HACS (Recommended)

1. Make sure you have HACS installed
2. Add this repository through HACS
3. Install the "Dual Camera Card"
4. Add the following to your Lovelace configuration:

```yaml
type: custom:dual-camera-card
camera1: camera.your_first_camera
camera2: camera.your_second_camera
```
