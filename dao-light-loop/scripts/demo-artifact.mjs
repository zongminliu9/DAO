import { writeFile } from 'node:fs/promises';
import { createScenario } from '../core/simulator.mjs';
import { runClosedLoop } from '../core/controller.mjs';

const scenario=createScenario('DIM_OFFICE');
const result=await runClosedLoop({sensor:scenario.sensor,environment:scenario.environment,target:250,maxIterations:10,deadband:8});
const artifact={generatedAt:new Date().toISOString(),scenario:'DIM_OFFICE',target:250,result,environment:await scenario.environment.getState(),note:'Deterministic simulator artifact; not physical validation.'};
await writeFile(new URL('../artifacts/demo-run.json',import.meta.url),JSON.stringify(artifact,null,2));
const cols=['iteration','timestamp','measured','lux','cct','target','brightnessBefore','action','error','nextBrightness','delta'];
const csv=[cols.join(','),...result.log.map(r=>cols.map(c=>r[c]??'').join(','))].join('\n');
await writeFile(new URL('../artifacts/demo-run.csv',import.meta.url),csv);
console.log(`Generated ${result.status} artifact in ${result.log.length} iterations.`);
