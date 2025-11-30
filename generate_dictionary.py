from wordfreq import top_n_list, word_frequency

# 1. Pull top ~50,000 modern English words
words = top_n_list("en", 50000)

# 2. Filter to 5-letter alphabetic words
five_letter = [w.lower() for w in words if len(w) == 5 and w.isalpha()]

# 3. Keep only words above a reasonable frequency threshold
curated = [w for w in five_letter if word_frequency(w, "en") > 1e-6]

# 4. Write the output to words.js
with open("words.js", "w") as f:
    f.write("export const VALID_WORDS = [\n")
    for w in curated:
        f.write(f'  "{w}",\n')
    f.write("];\n")

print("Generated", len(curated), "words.")
