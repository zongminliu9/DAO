# CAD

`generate_cad.py` produces an engineering carrier rather than pretending the final jewelry industrial design is frozen.

Nominal envelope: 18 × 26 mm front face, with a 2 mm optical aperture. Internal placeholders include a 3.1 × 2.0 × 1.0 mm spectral sensor, compact PCB, battery volume, 3.0 × 3.2 mm MCU envelope, antenna keep-out and charge contacts.

The **antenna keep-out is not a physical block**; it is a volume that should remain RF-friendly in the final metal/jewelry design.

Files generated:

- `dao_engineering_assembly.step`
- `dao_exploded.step`
- front/back STEP + STL
- component envelope STEP files

Dimensions must be updated after selecting the actual battery, flex stackup, clip mechanics, diffuser and antenna implementation.
