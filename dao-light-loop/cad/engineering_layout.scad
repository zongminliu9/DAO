// DAO engineering layout preview — not final industrial design
$fn=96;
module ellipse3d(w,h,t){scale([w/2,h/2,1]) cylinder(h=t,r=1,center=true);}
module part(z,labeltxt){translate([0,0,z]) children();}
color([0.8,0.76,0.68]) part(10) difference(){ellipse3d(18,26,2.2);translate([0,7,0])cylinder(h=4,r=1,center=true);}
color([0.85,0.92,0.95]) part(6) translate([0,7,0]) cube([3.1,2,1],center=true);
color([0.3,0.45,0.35]) part(2) translate([0,-1,0]) cube([12,16,.8],center=true);
color([0.25,0.3,0.28]) part(-1) translate([-3,-2,0]) cube([3,3.2,.4],center=true);
color([0.9,0.7,0.45,0.35]) part(-2) translate([4.5,-4,0]) cube([5,8,.6],center=true);
color([0.65,0.7,0.75]) part(-5) translate([0,-2,0]) cube([10,15,2.6],center=true);
color([0.72,0.7,0.65]) part(-10) ellipse3d(17.5,25.5,1.2);
