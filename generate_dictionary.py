from wordfreq import top_n_list, word_frequency
import re

# 1. Pull top 50,000 modern English words
words = top_n_list("en", 50000)

def looks_like_name(w):
    # remove obvious names without needing external datasets
    # heuristics tuned for English first names
    return (
        re.match(r"^[aeiou][a-z]{3,5}$", w) is None and   # most names start with consonants or vowel-name patterns
        not w.endswith("son") and                        # filter "Jackson", "Hanson"
        not w.endswith("ton") and                        # place/name endings common in names
        True
    )

# 2. Basic filtering: 4–6 letter alphabetic words
filtered = [
    w.lower()
    for w in words
    if w.isalpha() and 4 <= len(w) <= 6
]

# 3. Apply frequency threshold to remove rare junk/names
freq_filtered = [
    w for w in filtered
    if word_frequency(w, "en") > 1e-6
]

# 4. Simple name heuristic filter (non-strict, removes obvious names)
final_filtered = [
    w for w in freq_filtered
    if not re.match(r"^[A-Z][a-z]+$", w)    # remove proper nouns (capitalized)
    and not w in ("aaron", "abbas", "abdul", "abbey", "abbot", "abbott")  # blacklist most common ones
]

# Deduplicate + sort
final_words = sorted(set(final_filtered))

# Write output
with open("words.js", "w") as f:
    f.write("export const VALID_WORDS = [\n")
    for w in final_words:
        f.write(f'  "{w}",\n')
    f.write("];\n")

print(f"Generated {len(final_words)} words.")
