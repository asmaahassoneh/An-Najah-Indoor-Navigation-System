import re
import json
import cv2
import pytesseract
import requests
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

IMAGE_PATH = "../client/public/maps/EngB1.jpg" 
FLOOR_ID = 1            
API_BASE = "http://localhost:3000/api"
TOKEN = None              

ROOM_RE = re.compile(r"^(B\d{3,4}|F\d{1,2}\d{2,4}|\d{5,6})$")

SCALE_X = 1.0
SCALE_Y = 1.0

def preprocess(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (3, 3), 0)
    th = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    return th

def detect_pins(img):
    th = preprocess(img)

    data = pytesseract.image_to_data(th, output_type=pytesseract.Output.DICT)

    pins = []
    seen = set()

    for i in range(len(data["text"])):
        txt = (data["text"][i] or "").strip().upper()
        if not txt:
            continue

        txt = txt.replace(" ", "").replace("-", "")

        if not ROOM_RE.match(txt):
            continue

        x = data["left"][i]
        y = data["top"][i]
        w = data["width"][i]
        h = data["height"][i]

        cx = (x + w / 2.0) * SCALE_X
        cy = (y + h / 2.0) * SCALE_Y

        key = (txt, int(cx), int(cy))
        if key in seen:
            continue
        seen.add(key)

        pins.append({"roomCode": txt, "x": cx, "y": cy})

    return pins

def upload(pins):
    url = f"{API_BASE}/maps/floors/{FLOOR_ID}/rooms/bulk"
    headers = {"Content-Type": "application/json"}
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"

    payload = {"rooms": pins}
    r = requests.post(url, headers=headers, data=json.dumps(payload), timeout=60)
    print("STATUS:", r.status_code)
    print("RESPONSE:", r.text)

def main():
    img = cv2.imread(IMAGE_PATH)
    if img is None:
        raise RuntimeError(f"Cannot read image: {IMAGE_PATH}")

    pins = detect_pins(img)
    print(f"Detected {len(pins)} room labels")
    for p in pins[:10]:
        print(p)

    if not pins:
        print("No pins detected. Try higher resolution image or adjust ROOM_RE.")
        return
    
    h, w = img.shape[:2]
    print("image w,h:", w, h)

    upload(pins)

if __name__ == "__main__":
    main()