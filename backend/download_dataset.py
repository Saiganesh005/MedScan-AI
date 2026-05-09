import kagglehub
import os
import shutil

# 🔹 Base directory
BASE_DIR = r"D:\PulmoVision\datasets"
os.makedirs(BASE_DIR, exist_ok=True)

# 📦 FULL DATASET LIST (FINAL)
datasets = [
    # 🫁 CT DATASETS
    ("mehradaria/covid19-lung-ct-scans", "covid19_lung_ct_scans"),
    ("plameneduardo/sarscov2-ctscan-dataset", "sarscov2_ctscan"),
    ("kmader/finding-lungs-in-ct-data", "finding_lungs_ct"),
    ("andrewmvd/mosmed-covid19-ct-scans", "mosmed_ct_scans"),
    ("programmer3/lung-ct-and-histopathological-images-dataset", "lung_ct_histopath"),

    # 🩻 X-RAY DATASETS
    ("nih-chest-xrays/data", "nih_chest_xrays"),
    ("tawsifurrahman/covid19-radiography-database", "covid19_radiography"),
    ("yazanqiblawey/sars-mers-xray-images-dataset", "sars_mers_xray"),
    ("subhankarsen/novel-covid19-chestxray-repository", "novel_covid_xray"),
    ("nikhilpandey360/chest-xray-masks-and-labels", "xray_masks_labels")
]

def download_and_store(dataset_name, folder_name):
    print(f"\n⬇️ Downloading: {dataset_name}")
    
    try:
        path = kagglehub.dataset_download(dataset_name)
    except Exception as e:
        print(f"❌ Failed: {dataset_name} → {e}")
        return

    dest_path = os.path.join(BASE_DIR, folder_name)

    # Remove existing
    if os.path.exists(dest_path):
        print(f"⚠️ Removing existing: {dest_path}")
        shutil.rmtree(dest_path)

    # Copy
    shutil.copytree(path, dest_path)

    print(f"✅ Stored at: {dest_path}")


# 🚀 Run all downloads
for dataset, folder in datasets:
    download_and_store(dataset, folder)

print("\n🎉 ALL DATASETS DOWNLOADED SUCCESSFULLY!")
