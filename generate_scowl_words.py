import urllib.request
import zipfile
import os

# -----------------------------
# Step 1: Download SCOWL GitHub ZIP
# -----------------------------
scowl_url = "https://github.com/en-wl/wordlist/archive/refs/heads/master.zip"
file_name = "scowl.zip"

if not os.path.exists(file_name):
    print("Downloading SCOWL wordlist from GitHub...")
    urllib.request.urlretrieve(scowl_url, file_name)
else:
    print("SCOWL archive already downloaded.")

# -----------------------------
# Step 2: Extract ZIP
# -----------------------------
extract_path = "scowl"

if not os.path.exists(extract_path):
    print("Extracting...")
    with zipfile.ZipFile(file_name, "r") as z:
        z.extractall(extract_path)
else:
    print("SCOWL already extracted.")

# New base directory (GitHub mirror structure)
base_dir = "scowl/wordlist-master/final/english/"

# -----------------------------
# Step 3: Load valid wordlists
# -----------------------------
valid_levels = ["10", "20", "35", "40"]
wordlists = []

for level in valid_levels:
    fname = f"english-words.{level}"

    full_path = os.path.join(base_dir, fname)
    if not os.path.exists(full_path):
        continue

    with open(full_path, "r") as f:
        for w in f.read().splitlines():
            w = w.lower()
            if w.isalpha() and 4 <= len(w) <= 6:
                wordlists.append(w)

# -----------------------------
# Step 4: Deduplicate + sort
# -----------------------------
final_words = sorted(set(wordlists))

print(f"Loaded {len(final_words)} clean SCOWL words (4–6 letters).")

# -----------------------------
# Step 5: Output to words.js
# -----------------------------
with open("words.js", "w") as f:
    f.write("export const VALID_WORDS = [\n")
    for w in final_words:
        f.write(f'  "{w}",\n')
    f.write("];\n")

print("words.js written successfully!")
