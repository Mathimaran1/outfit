# How to Run Almari

This guide details how to start both the Python backend and the Expo frontend.

## Prerequisites
- **Python**: Installed on your system (tested with Python 3.10+).
- **Node.js & npm**: Installed on your system.
- **Expo Go App**: Downloaded on your mobile device (to test the frontend).
- **NVIDIA API Key**: Ensure a valid key is set in `Backend/config.yaml`.

---

## 1. Start the Backend
1. Open a terminal in the project root.
2. Change directory to the Backend folder:
   ```powershell
   cd Backend
   ```
3. Activate the virtual environment:
   ```powershell
   .\venv\Scripts\activate
   ```
4. Run the Flask server:
   ```powershell
   python main.py
   ```
   *The backend will run on `http://127.0.0.1:5000`.*

---

## 2. Start the Frontend
1. Open a new terminal in the project root.
2. Change directory to the Frontend folder:
   ```powershell
   cd Frontend/SoW
   ```
3. Start the Expo development server:
   ```bash
   npx expo start --tunnel
   ```
3. **Scan the QR Code**: Once the server starts, a QR code will appear in the terminal. Scan this using the **Expo Go** app on your phone.

---

## Troubleshooting
- **API Errors**: If the backend fails to analyze images, check your API key in `Backend/config.yaml`.
- **Connection Issues**: Ensure your phone and computer are on the same network if using regular start, or use `--tunnel` (as shown above) for easier remote connection.
