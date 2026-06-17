import urllib.request
import re
import ssl
import sys

# disable ssl verification for ease
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = {
    "liposo": "https://www.instagram.com/losliposomaspatujeto/",
    "las_moskas": "https://www.instagram.com/las_moskas_retrompeteras/?hl=es",
    "kalerizo": "https://www.instagram.com/kalerizo/?hl=es",
    "ramoninos": "https://www.youtube.com/@ramoninosextremadura9081",
    "el_muerto": "https://www.instagram.com/elmuerto_oficial/",
    "extorsion": "https://www.instagram.com/extorsionrock/",
    "barracuda": "https://www.instagram.com/barracuda_oficial"
}

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

for name, url in urls.items():
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx) as response:
            html = response.read().decode('utf-8')
            
            # Find og:image
            match = re.search(r'<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"', html)
            if not match:
                match = re.search(r'<meta\s+content="([^"]+)"\s+(?:property|name)="og:image"', html)
            
            if match:
                img_url = match.group(1).replace("&amp;", "&")
                print(f"[{name}] Found image: {img_url}")
                
                # Download it
                req_img = urllib.request.Request(img_url, headers=headers)
                with urllib.request.urlopen(req_img, context=ctx) as img_resp:
                    with open(f"assets/gallery/full/bandas/{name}_2026.png", "wb") as f:
                        f.write(img_resp.read())
                print(f"[{name}] Downloaded.")
            else:
                print(f"[{name}] og:image not found.")
    except Exception as e:
        print(f"[{name}] Error: {e}")

