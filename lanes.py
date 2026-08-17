import cv2
import sys

def click_event(event, x, y, flags, params):
    if event == cv2.EVENT_LBUTTONDOWN:
        print(f"[{x}, {y}],", end=" ")
        cv2.circle(img, (x, y), 5, (0, 0, 255), -1)
        cv2.imshow('Map Lanes', img)

# 1. Use the absolute path (make sure the 'r' is in front of the string)
video_path = r"d:\Hackathon_projects\VIKSIT_NAGPUR\traffic.mp4"
cap = cv2.VideoCapture(video_path)

ret, img = cap.read()

# 2. Add a safety check to prevent the resize error
if not ret or img is None:
    print(f"❌ ERROR: Could not find or read video at: {video_path}")
    print("Please make sure the video is exactly named 'traffic.mp4' and placed in that folder.")
    sys.exit()

img = cv2.resize(img, (1280, 720)) # Resize for easier viewing

print("Click 4 corners of a lane. Copy the coordinates printed in the terminal.")
print("Press any key to close the window when done.")

cv2.imshow('Map Lanes', img)
cv2.setMouseCallback('Map Lanes', click_event)
cv2.waitKey(0)
cv2.destroyAllWindows()