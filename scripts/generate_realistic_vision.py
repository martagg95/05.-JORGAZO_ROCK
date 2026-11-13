#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador local de fotografía con Realistic Vision V5.1 (Apple Silicon MPS)
para "El Altavoz del Jorgazo".

Requisitos (en entorno virtual local .venv, ignorado por Git):
  python3 -m venv .venv
  .venv/bin/pip install torch diffusers transformers accelerate safetensors
"""

import argparse
import gc
import os
import sys


def generar_foto_realistic_vision(prompt_imagen, archivo_salida="portada_blog.png"):
    from diffusers import DPMSolverMultistepScheduler, StableDiffusionPipeline
    import torch

    # 1. Descarga Realistic Vision (~2 GB en formato ligero fp16)
    device = "mps" if torch.backends.mps.is_available() else "cpu"
    dtype = torch.float16 if device == "mps" else torch.float32

    pipe = StableDiffusionPipeline.from_pretrained(
        "SG161222/Realistic_Vision_V5.1_noVAE",
        torch_dtype=dtype,
        use_safetensors=True,
    )

    # 2. Configura el scheduler recomendado por los creadores para máximo fotorrealismo
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(
        pipe.scheduler.config, use_karras_sigmas=True
    )

    # 3. Activa la GPU Metal del Mac y desactiva el filtro NSFW (evita falsos positivos negros)
    pipe.to(device)
    pipe.safety_checker = None

    # 4. Palabras clave que activan el estilo fotográfico de Realistic Vision
    prompt_completo = (
        f"RAW photo, {prompt_imagen}, 8k uhd, dslr, soft lighting, "
        "high quality, film grain, Fujifilm XT3"
    )
    prompt_negativo = (
        "(deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, "
        "cartoon, drawing, anime), text, watermark, logo, letters, cropped, out of frame, "
        "worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, "
        "extra fingers, mutated hands, blurry"
    )

    # 5. Genera la imagen en formato panorámico nativo (16:9 ligero)
    imagen = pipe(
        prompt=prompt_completo,
        negative_prompt=prompt_negativo,
        num_inference_steps=25,
        guidance_scale=5.5,
        width=768,
        height=432,
    ).images[0]

    os.makedirs(os.path.dirname(os.path.abspath(archivo_salida)), exist_ok=True)
    imagen.save(archivo_salida)

    # 6. Limpia la memoria del Mac al terminar
    del pipe
    gc.collect()
    if device == "mps":
        torch.mps.empty_cache()


def main():
    parser = argparse.ArgumentParser(description="Generador Realistic Vision para El Altavoz")
    parser.add_argument("--prompt", required=True, help="Descripción fotográfica en inglés")
    parser.add_argument("--output", required=True, help="Ruta de salida dentro de assets/gallery/blog/")
    args = parser.parse_args()

    # Validación de seguridad: solo permitir escritura dentro de assets/gallery/blog
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    allowed_dir = os.path.abspath(os.path.join(repo_root, "assets", "gallery", "blog"))
    out_abs = os.path.abspath(args.output)

    if not out_abs.startswith(allowed_dir + os.sep) or not out_abs.endswith(".png"):
        sys.stderr.write("Error de seguridad: ruta de salida fuera de assets/gallery/blog o extensión no permitida.\n")
        sys.exit(2)

    prompt_clean = " ".join(str(args.prompt).split())[:320]
    generar_foto_realistic_vision(prompt_clean, out_abs)
    print(f"OK:{out_abs}")


if __name__ == "__main__":
    main()

