import requests

url = "https://outfit-4f83.onrender.com/api/analyze-face"
image_path = r"c:\Users\ASUS\OneDrive\Desktop\new outfit - Copy\Frontend\SoW\assets\Almari_logo.jpg"

try:
    with open(image_path, "rb") as image_file:
        files = {"image": ("test.jpg", image_file, "image/jpeg")}
        print("Sending request to backend...")
        response = requests.post(url, files=files, timeout=120)
        print("Status Code:", response.status_code)
        print("Response:", response.text)
except Exception as e:
    print("Error:", e)
