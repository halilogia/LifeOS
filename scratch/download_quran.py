import os
import requests
import time

pages = [2, 42, 49] + list(range(440, 446)) + [548] + [562, 563, 564] + [582, 583] + list(range(596, 605))
base_url = "https://surahquran.com/img/pages-quran/mushaf/s{}.png"
output_dir = "src/data/quran_images"

os.makedirs(output_dir, exist_ok=True)

print(f"Starting download of {len(pages)} pages...")

for p in pages:
    url = base_url.format(p)
    path = os.path.join(output_dir, f"sayfa_{p:03d}.png")
    
    if os.path.exists(path):
        print(f"Page {p} already exists, skipping.")
        continue
        
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            with open(path, "wb") as f:
                f.write(response.content)
            print(f"Downloaded page {p} ({len(response.content)} bytes)")
        else:
            print(f"Failed to download page {p}: HTTP {response.status_code}")
        
        # Respect the server
        time.sleep(0.5)
    except Exception as e:
        print(f"Error downloading page {p}: {str(e)}")

print("Finished download.")
