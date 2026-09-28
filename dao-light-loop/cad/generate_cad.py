from pathlib import Path
import cadquery as cq
from cadquery import exporters

OUT=Path(__file__).resolve().parent
# Engineering placeholder envelope, mm. Not a frozen industrial-design surface.
W,H=18.0,26.0
FRONT_T=2.2
BACK_T=1.2
CAVITY_DEPTH=3.8
OPTICAL_D=2.0

def ellipse_plate(w,h,t):
    return cq.Workplane("XY").ellipse(w/2,h/2).extrude(t)

# Front jewelry shell with a controlled optical aperture near the upper outer face.
front=ellipse_plate(W,H,FRONT_T)
front=front.faces(">Z").workplane().center(0,7.0).hole(OPTICAL_D)
# Back cover is thinner and closes the component volume.
back=ellipse_plate(W-0.5,H-0.5,BACK_T).translate((0,0,-CAVITY_DEPTH-BACK_T))
# Internal component envelopes, intentionally conservative.
sensor=cq.Workplane("XY").box(3.1,2.0,1.0).translate((0,7.0,-0.55))
pcb=cq.Workplane("XY").box(12.0,16.0,0.8).translate((0,-1.0,-1.55))
battery=cq.Workplane("XY").box(10.0,15.0,2.6).edges("|Z").fillet(1.2).translate((0,-2.0,-3.0))
mcu=cq.Workplane("XY").box(3.0,3.2,0.4).translate((-3.0,-2.0,-0.95))
antenna_keepout=cq.Workplane("XY").box(5.0,8.0,0.6).translate((4.5,-4.0,-0.9))
charge_l=cq.Workplane("XY").cylinder(0.5,0.8).translate((-2.0,-9.0,-4.6))
charge_r=cq.Workplane("XY").cylinder(0.5,0.8).translate((2.0,-9.0,-4.6))

for name,obj in {
    'front_shell.step':front,'back_cover.step':back,'sensor_envelope.step':sensor,
    'pcb_envelope.step':pcb,'battery_envelope.step':battery,'mcu_envelope.step':mcu,
    'antenna_keepout.step':antenna_keepout
}.items(): exporters.export(obj,str(OUT/name))
exporters.export(front,str(OUT/'front_shell.stl'))
exporters.export(back,str(OUT/'back_cover.stl'))

assembled=cq.Compound.makeCompound([x.val() for x in [front,back,sensor,pcb,battery,mcu,antenna_keepout,charge_l,charge_r]])
exporters.export(assembled,str(OUT/'dao_engineering_assembly.step'))

exploded_parts=[
    front.translate((0,0,10)),
    sensor.translate((0,0,6)),
    pcb.translate((0,0,2)),
    mcu.translate((0,0,-1)),
    antenna_keepout.translate((0,0,-2)),
    battery.translate((0,0,-5)),
    back.translate((0,0,-9)),
    charge_l.translate((0,0,-10)),charge_r.translate((0,0,-10))
]
exploded=cq.Compound.makeCompound([x.val() for x in exploded_parts])
exporters.export(exploded,str(OUT/'dao_exploded.step'))
print('CAD exported to',OUT)
