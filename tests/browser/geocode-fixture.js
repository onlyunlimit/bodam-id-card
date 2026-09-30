export async function mockGeocode(page){
 await page.route('**/geocode?**',route=>{
  const u=new URL(route.request().url()),q=u.searchParams.get('q');
  const lat=q?48.8566:Number(u.searchParams.get('lat')),lon=q?2.3522:Number(u.searchParams.get('lon'));
  return route.fulfill({json:{results:[{name:q==='없음'?q:q||'현장 <b>표지</b>',zone:'현장',lat,lon,area:{type:'Polygon',coordinates:[[[lon-.01,lat-.01],[lon+.01,lat-.01],[lon+.01,lat+.01],[lon-.01,lat-.01]]]}}]}});
 });
}
