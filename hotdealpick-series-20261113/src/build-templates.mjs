import {writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {layout,sharp,root} from './layout.mjs';
import {malls,series,defaultTheme} from './config.mjs';
for(const dir of ['previews','templates','data'])await mkdir(path.join(root,dir),{recursive:true});
const entries=[];
for(const mode of Object.keys(series))for(const mall of Object.keys(malls))for(const count of [3,4,5]){
  const name=`${mode}-${mall}-${count}`;
  const opt={mall,mode,count,preview:true};
  const svg=await layout({...opt,embedded:false});
  await writeFile(path.join(root,'templates',name+'.svg'),svg);
  await sharp(Buffer.from(await layout(opt))).png({compressionLevel:9,palette:true,quality:100,colours:256,dither:0.25}).toFile(path.join(root,'previews',name+'.png'));
  const data={mall,title:series[mode],checked:'',items:Array.from({length:count},()=>({name:'',price:'',cond:'',unit:'',img:'',url:'',checked:''}))};
  await writeFile(path.join(root,'data',name+'.json'),JSON.stringify(data,null,2)+'\n');
  entries.push({name,mode,mall,count,theme:defaultTheme(mall,mode)});
}
await writeFile(path.join(root,'catalog.json'),JSON.stringify(entries,null,2)+'\n');
console.log(`18 independent templates rendered at 1080×1350.`);
