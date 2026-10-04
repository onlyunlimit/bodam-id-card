import {characters} from './characters.js';
import {agencyGallery} from './agency-gallery.js';
// Add more publicly available studio photos here. Never add private source files.
export const extraPhotos = []; // {name: '사진 이름', url: 'https://…'}
export const studioPhotos = [...characters.flatMap(c => [{name:c.name,url:c.portrait},...(c.gallery||[]).map(p=>({name:p.label||c.name,url:p.url}))]), ...Object.values(agencyGallery).flat().map(p=>({name:p.caption,url:p.url})), ...extraPhotos].filter(p=>p.url);
