import urllib.request, json, base64, time, sys, os

API_KEY = "AIzaSyDfm3Rev7jwpulQPRkdRmYyyWzljZ3_qU0"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key={API_KEY}"
OUT_DIR = os.path.dirname(os.path.abspath(__file__))

images = [
    ("mt-cover.jpg", "Professional sports photography of Korean middle school student performing forward roll on blue gymnastics mat in school gymnasium, dynamic motion, editorial magazine style"),
    ("mt-roll.jpg", "Korean middle school student demonstrating proper forward roll technique on gymnastics mat, tucked chin and rounded back, gymnasium setting, instructional sports photography"),
    ("mt-handstand.jpg", "Korean middle school student performing handstand on gymnastics mat in school gymnasium, straight body alignment, spotter nearby for safety, bright indoor lighting, sports photography"),
    ("mt-flip.jpg", "Korean middle school student performing cartwheel on gymnastics mat in school gymnasium, mid-rotation with arms and legs extended, dynamic freeze-frame photography"),
    ("mt-team.jpg", "Korean middle school PE class on gymnastics mats in gymnasium, students practicing various mat exercises together, supportive atmosphere, teacher guiding, warm lighting"),
]

for i, (filename, prompt) in enumerate(images):
    if i > 0:
        print(f"  Waiting 30 seconds before next request...")
        sys.stdout.flush()
        time.sleep(30)

    print(f"=== [{i+1}/5] Generating {filename} ===")
    sys.stdout.flush()

    payload = json.dumps({
        "instances": [{"prompt": prompt}],
        "parameters": {"sampleCount": 1, "aspectRatio": "16:9", "personGeneration": "allow_all"}
    }).encode()

    req = urllib.request.Request(URL, data=payload, headers={"Content-Type": "application/json"})

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read())

        img_bytes = base64.b64decode(data["predictions"][0]["bytesBase64Encoded"])
        path = os.path.join(OUT_DIR, filename)
        with open(path, "wb") as f:
            f.write(img_bytes)
        print(f"  Saved {filename} ({len(img_bytes):,} bytes)")
        sys.stdout.flush()
    except Exception as e:
        print(f"  ERROR generating {filename}: {e}")
        sys.stdout.flush()

print("\n=== All done! ===")
