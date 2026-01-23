let linkerText = null;
export let vectorins = [ "vaadd.vv", "vaadd.vx", "vaaddu.vv", 
  "vaaddu.vx", "vadc.vim", "vadc.vvm", "vadc.vxm", "vadd.vi", "vadd.vv", 
  "vadd.vx", "vand.vi", "vand.vv", "vand.vx", "vasub.vv", "vasub.vx",
  "vasubu.vv", "vasubu.vx", "vcompress.vm", "vcpop.m", "vdiv.vv", "vdiv.vx",
  "vdivu.vv", "vdivu.vx", "vfadd.vf", "vfadd.vv", "vfclass.v", "vfcvt.f.x.v", 
  "vfcvt.f.xu.v", "vfcvt.rtz.x.f.v", "vfcvt.rtz.xu.f.v", "vfcvt.x.f.v", 
  "vfcvt.xu.f.v", "vfdiv.vf", "vfdiv.vv", "vfirst.m", "vfmacc.vf", "vfmacc.vv", 
  "vfmadd.vf", "vfmadd.vv", "vfmax.vf", "vfmax.vv", "vfmerge.vfm", "vfmin.vf", 
  "vfmin.vv", "vfmsac.vf", "vfmsac.vv", "vfmsub.vf", "vfmsub.vv", "vfmul.vf", "vfmul.vv", 
  "vfmv.f.s", "vfmv.s.f", "vfmv.v.f", "vfncvt.f.f.w", "vfncvt.f.x.w", "vfncvt.f.xu.w", 
  "vfncvt.rod.f.f.w", "vfncvt.rtz.x.f.w", "vfncvt.rtz.xu.f.w", "vfncvt.x.f.w", 
  "vfncvt.xu.f.w", "vfnmacc.vf", "vfnmacc.vv", "vfnmadd.vf", "vfnmadd.vv", "vfnmsac.vf", 
  "vfnmsac.vv", "vfnmsub.vf", "vfnmsub.vv", "vfrdiv.vf", "vfrec7.v", "vfredmax.vs", 
  "vfredmin.vs", "vfredosum.vs", "vfredusum.vs", "vfrsqrt7.v", "vfrsub.vf", "vfsgnj.vf",
   "vfsgnj.vv", "vfsgnjn.vf", "vfsgnjn.vv", "vfsgnjx.vf", "vfsgnjx.vv", "vfslide1down.vf", 
   "vfslide1up.vf", "vfsqrt.v", "vfsub.vf", "vfsub.vv", "vfwadd.vf", "vfwadd.vv", 
   "vfwadd.wf", "vfwadd.wv", "vfwcvt.f.f.v", "vfwcvt.f.x.v", "vfwcvt.f.xu.v", 
   "vfwcvt.rtz.x.f.v", "vfwcvt.rtz.xu.f.v", "vfwcvt.x.f.v", "vfwcvt.xu.f.v", 
   "vfwmacc.vf", "vfwmacc.vv", "vfwmsac.vf", "vfwmsac.vv", "vfwmul.vf", "vfwmul.vv", 
   "vfwnmacc.vf", "vfwnmacc.vv", "vfwnmsac.vf", "vfwnmsac.vv", "vfwredosum.vs", 
   "vfwredusum.vs", "vfwsub.vf", "vfwsub.vv", "vfwsub.wf", "vfwsub.wv", "vid.v", 
   "viota.m", "vl1re16.v", "vl1re32.v", "vl1re64.v", "vl1re8.v", "vl2re16.v", 
   "vl2re32.v", "vl2re64.v", "vl2re8.v", "vl4re16.v", "vl4re32.v", "vl4re64.v", 
   "vl4re8.v", "vl8re16.v", "vl8re32.v", "vl8re64.v", "vl8re8.v", "vle16.v", 
   "vle16ff.v", "vle32.v", "vle32ff.v", "vle64.v", "vle64ff.v", "vle8.v", 
   "vle8ff.v", "vlm.v", "vloxei16.v", "vloxei32.v", "vloxei64.v", "vloxei8.v", 
   "vlse16.v", "vlse32.v", "vlse64.v", "vlse8.v", "vluxei16.v", "vluxei32.v", 
   "vluxei64.v", "vluxei8.v", "vmacc.vv", "vmacc.vx", "vmadc.vi", "vmadc.vim", 
   "vmadc.vv", "vmadc.vvm", "vmadc.vx", "vmadc.vxm", "vmadd.vv", "vmadd.vx", 
   "vmand.mm", "vmandn.mm", "vmax.vv", "vmax.vx", "vmaxu.vv", "vmaxu.vx", "vmerge.vim", 
   "vmerge.vvm", "vmerge.vxm", "vmfeq.vf", "vmfeq.vv", "vmfge.vf", "vmfgt.vf", 
   "vmfle.vf", "vmfle.vv", "vmflt.vf", "vmflt.vv", "vmfne.vf", "vmfne.vv", "vmin.vv", 
   "vmin.vx", "vminu.vv", "vminu.vx", "vmnand.mm", "vmnor.mm", "vmor.mm", "vmorn.mm", 
   "vmsbc.vv", "vmsbc.vvm", "vmsbc.vx", "vmsbc.vxm", "vmsbf.m", "vmseq.vi", "vmseq.vv", 
   "vmseq.vx", "vmsgt.vi", "vmsgt.vx", "vmsgtu.vi", "vmsgtu.vx", "vmsif.m", "vmsle.vi", 
   "vmsle.vv", "vmsle.vx", "vmsleu.vi", "vmsleu.vv", "vmsleu.vx", "vmslt.vv", "vmslt.vx", 
   "vmsltu.vv", "vmsltu.vx", "vmsne.vi", "vmsne.vv", "vmsne.vx", "vmsof.m", "vmul.vv", 
   "vmul.vx", "vmulh.vv", "vmulh.vx", "vmulhsu.vv", "vmulhsu.vx", "vmulhu.vv", "vmulhu.vx", 
   "vmv.s.x", "vmv.v.i", "vmv.v.v", "vmv.v.x", "vmv.x.s", "vmv1r.v", "vmv2r.v", "vmv4r.v", 
   "vmv8r.v", "vmxnor.mm", "vmxor.mm", "vnclip.wi", "vnclip.wv", "vnclip.wx", "vnclipu.wi", 
   "vnclipu.wv", "vnclipu.wx", "vnmsac.vv", "vnmsac.vx", "vnmsub.vv", "vnmsub.vx", 
   "vnsra.wi", "vnsra.wv", "vnsra.wx", "vnsrl.wi", "vnsrl.wv", "vnsrl.wx", "vor.vi", 
   "vor.vv", "vor.vx", "vredand.vs", "vredmax.vs", "vredmaxu.vs", "vredmin.vs", 
   "vredminu.vs", "vredor.vs", "vredsum.vs", "vredxor.vs", "vrem.vv", "vrem.vx", 
   "vremu.vv", "vremu.vx", "vrgather.vi", "vrgather.vv", "vrgather.vx", "vrgatherei16.vv", 
   "vrsub.vi", "vrsub.vx", "vs1r.v", "vs2r.v", "vs4r.v", "vs8r.v", "vsadd.vi", "vsadd.vv", 
   "vsadd.vx", "vsaddu.vi", "vsaddu.vv", "vsaddu.vx", "vsbc.vvm", "vsbc.vxm", "vse16.v", 
   "vse32.v", "vse64.v", "vse8.v", "vsetivli", "vsetvl", "vsetvli", "vsext.vf2", 
   "vsext.vf4", "vsext.vf8", "vslide1down.vx", "vslide1up.vx", "vslidedown.vi", 
   "vslidedown.vx", "vslideup.vi", "vslideup.vx", "vsll.vi", "vsll.vv", "vsll.vx", 
   "vsm.v", "vsmul.vv", "vsmul.vx", "vsoxei16.v", "vsoxei32.v", "vsoxei64.v", 
   "vsoxei8.v", "vsra.vi", "vsra.vv", "vsra.vx", "vsrl.vi", "vsrl.vv", "vsrl.vx", 
   "vsse16.v", "vsse32.v", "vsse64.v", "vsse8.v", "vssra.vi", "vssra.vv", 
   "vssra.vx", "vssrl.vi", "vssrl.vv", "vssrl.vx", "vssub.vv", "vssub.vx", 
   "vssubu.vv", "vssubu.vx", "vsub.vv", "vsub.vx", "vsuxei16.v", "vsuxei32.v", 
   "vsuxei64.v", "vsuxei8.v", "vwadd.vv", "vwadd.vx", "vwadd.wv", "vwadd.wx", 
   "vwaddu.vv", "vwaddu.vx", "vwaddu.wv", "vwaddu.wx", "vwmacc.vv", "vwmacc.vx", 
   "vwmaccsu.vv", "vwmaccsu.vx", "vwmaccu.vv", "vwmaccu.vx", "vwmaccus.vx", 
   "vwmul.vv", "vwmul.vx", "vwmulsu.vv", "vwmulsu.vx", "vwmulu.vv", "vwmulu.vx", 
   "vwredsum.vs", "vwredsumu.vs", "vwsub.vv", "vwsub.vx", "vwsub.wv", "vwsub.wx",
   "vwsubu.vv", "vwsubu.vx", "vwsubu.wv", "vwsubu.wx", "vxor.vi", "vxor.vv", 
   "vxor.vx", "vzext.vf2", "vzext.vf4", "vzext.vf8"];

export async function loadlinker(is32b) {
  const file = is32b ? 'linker32.ld' : 'linker64.ld';

  // Resuelve la ruta relativa al propio módulo (no a la página)
  const url = new URL(`./linkers/${file}`, import.meta.url);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`No se pudo cargar ${file}: ${res.status} ${res.statusText}`);
  }

  linkerText = await res.text(); // <-- aquí sí con await
//   console.log('Linker cargado:', file, '\n----\n', linkerText, '\n----');
  return linkerText;
}