// Decode and re-encode uploads so orientation is applied and source metadata is removed.
export async function compressImage(file) {
  if (
    !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
    file.size > 12 * 1024 * 1024
  )
    throw Error('JPG·PNG·WebP, 원본 12MB 이하 이미지를 선택해 주세요.');
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const q of [0.85, 0.7, 0.5, 0.3]) {
      const data = canvas.toDataURL('image/webp', q);
      if (data.length < 540000) return data;
    }
    throw Error('이미지 용량을 줄인 뒤 다시 선택해 주세요.');
  } finally {
    bitmap.close();
  }
}
export function attachmentPicker(form, initial = [], urlFor = (id) => id) {
  let images = initial.map((x) => ({ id: x.id })),
    busy = false;
  const input = form.querySelector('[data-images]'),
    preview = form.querySelector('.upload-preview'),
    status = form.querySelector('.upload-status');
  function render() {
    preview.replaceChildren();
    images.forEach((x, i) => {
      const wrap = document.createElement('div'),
        picture = document.createElement('div'),
        remove = document.createElement('button');
      picture.className = 'upload-image';
      picture.style.backgroundImage = `url(${JSON.stringify(typeof x === 'string' ? x : urlFor(x.id))})`;
      picture.setAttribute('role', 'img');
      picture.setAttribute('aria-label', '첨부 사진 ' + (i + 1));
      remove.type = 'button';
      remove.textContent = '삭제 ×';
      remove.onclick = () => {
        images.splice(i, 1);
        render();
      };
      wrap.append(picture, remove);
      preview.append(wrap);
    });
  }
  input.onchange = async () => {
    busy = true;
    input.disabled = true;
    status.textContent = '사진을 준비하고 있습니다…';
    try {
      const files = [...input.files];
      if (files.length + images.length > 2) throw Error('사진은 두 장까지 첨부할 수 있습니다.');
      const converted = await Promise.all(files.map(compressImage));
      images.push(...converted);
      render();
      status.textContent = '사진 준비 완료';
    } catch (e) {
      status.textContent = e.message;
    } finally {
      busy = false;
      input.disabled = false;
      input.value = '';
    }
  };
  render();
  return () => {
    if (busy) throw Error('사진 준비가 끝난 뒤 등록해 주세요.');
    return images;
  };
}
export const uploadMarkup =
  '<div class="upload-field"><label>사진 첨부 · 최대 2장<input type="file" data-images accept="image/jpeg,image/png,image/webp" multiple></label><small>JPG·PNG·WebP · 사진은 자동 압축됩니다.</small><div class="upload-preview"></div><p class="upload-status" role="status"></p></div>';
