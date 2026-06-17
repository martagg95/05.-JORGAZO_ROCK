import instaloader
import shutil
import os
import glob

# Initialize instaloader
L = instaloader.Instaloader()

profiles = {
    "losliposomaspatujeto": "liposo",
    "las_moskas_retrompeteras": "las_moskas",
    "kalerizo": "kalerizo",
    "elmuerto_oficial": "el_muerto",
    "extorsionrock": "extorsion",
    "barracuda_oficial": "barracuda"
}

output_dir = "assets/gallery/full/bandas"
os.makedirs(output_dir, exist_ok=True)

for ig_username, local_name in profiles.items():
    try:
        print(f"Downloading profile for {ig_username}...")
        L.download_profile(ig_username, profile_pic_only=True)
        
        # Instaloader downloads to a folder named `ig_username`
        # Find the .jpg file in that folder
        jpg_files = glob.glob(f"{ig_username}/*.jpg")
        if jpg_files:
            # Copy to target destination
            target_path = os.path.join(output_dir, f"{local_name}_2026.png")
            shutil.copy(jpg_files[0], target_path)
            print(f"Saved {target_path}")
        else:
            print(f"No jpg found for {ig_username}")
            
    except Exception as e:
        print(f"Error downloading {ig_username}: {e}")

