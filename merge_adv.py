import re, os, glob

SPORTS_DIR = r"C:\Users\USER\pe-textbook\sports"

# Map adv files to their base files
adv_files = glob.glob(os.path.join(SPORTS_DIR, "*-adv.html"))

for adv_path in adv_files:
    base_name = os.path.basename(adv_path).replace("-adv.html", ".html")
    base_path = os.path.join(SPORTS_DIR, base_name)
    
    if not os.path.exists(base_path):
        print(f"SKIP {base_name} - base file not found")
        continue
    
    with open(base_path, "r", encoding="utf-8") as f:
        base_html = f.read()
    with open(adv_path, "r", encoding="utf-8") as f:
        adv_html = f.read()
    
    # Extract slides from base (between <div class="deck"> and </div> before <div class="nav">)
    base_deck = re.search(r'<div class="deck">(.*?)</div>\s*<div class="nav">', base_html, re.DOTALL)
    adv_deck = re.search(r'<div class="deck">(.*?)</div>\s*<div class="nav">', adv_html, re.DOTALL)
    
    if not base_deck or not adv_deck:
        print(f"SKIP {base_name} - could not parse deck")
        continue
    
    base_slides_raw = base_deck.group(1)
    adv_slides_raw = adv_deck.group(1)
    
    # Split into individual slides
    base_slides = re.findall(r'(  <!-- .*?-->.*?</section>)', base_slides_raw, re.DOTALL)
    adv_slides = re.findall(r'(  <!-- .*?-->.*?</section>)', adv_slides_raw, re.DOTALL)
    
    if not base_slides or not adv_slides:
        # Try alternate pattern
        base_slides = re.findall(r'(\s*<section class="slide.*?</section>)', base_slides_raw, re.DOTALL)
        adv_slides = re.findall(r'(\s*<section class="slide.*?</section>)', adv_slides_raw, re.DOTALL)
    
    if not base_slides or not adv_slides:
        print(f"SKIP {base_name} - could not parse slides (base:{len(base_slides)}, adv:{len(adv_slides)})")
        continue
    
    # Remove first cover and last cover from adv (keep only middle slides)
    adv_middle = adv_slides[1:-1] if len(adv_slides) > 2 else adv_slides
    
    # Remove last cover from base
    base_without_last = base_slides[:-1]
    last_cover = base_slides[-1]  # Use base's closing cover
    
    # Create divider slide
    divider = '''
  <!-- 심화 학습 구분 -->
  <section class="slide cover">
    <div class="cover-shade" style="background:linear-gradient(135deg,rgba(232,89,12,.9) 0%,rgba(0,0,0,.85) 100%)"></div>
    <div class="kicker" style="position:relative;z-index:2">ADVANCED LEVEL</div>
    <div class="emoji" style="position:relative;z-index:2">🎓</div>
    <h1 style="position:relative;z-index:2">심화 학습</h1>
    <p class="lead" style="position:relative;z-index:2">스포츠 과학 · 전술 분석 · 스포츠 심리 · 훈련 과학</p>
  </section>'''
    
    # Combine: base slides + divider + adv middle slides + closing cover
    combined_slides = base_without_last + [divider] + adv_middle + [last_cover]
    combined_deck = "\n".join(combined_slides)
    
    # Use the adv file as template but replace the deck content
    # Actually, use the base file as template (it has correct topbar title etc)
    new_html = base_html.replace(base_deck.group(1), "\n" + combined_deck + "\n")
    
    # Update title to include 심화
    new_html = new_html.replace("체육 플레이북</title>", "체육 플레이북 · 심화</title>")
    
    with open(adv_path, "w", encoding="utf-8") as f:
        f.write(new_html)
    
    print(f"OK {os.path.basename(adv_path)} - {len(base_without_last)} base + {len(adv_middle)} adv + divider + closing = {len(combined_slides)} total slides")

