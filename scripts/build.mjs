import {copyFile,mkdir,cp,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const out=path.join(root,'dist');
// dist is generated output only. Source data and application files remain untouched.
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
for(const file of ['index.html','deliverables.html'])await copyFile(path.join(root,file),path.join(out,file));
for(const dir of ['css','js','media'])await cp(path.join(root,dir),path.join(out,dir),{recursive:true});
await mkdir(path.join(out,'data'),{recursive:true});
await copyFile(path.join(root,'data/cambridge_crashes.csv'),path.join(out,'data/cambridge_crashes.csv'));
await copyFile(path.join(root,'data/cambridge_neighborhoods.geojson'),path.join(out,'data/cambridge_neighborhoods.geojson'));
console.log('Static website ready in dist/');
