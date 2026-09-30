// Decode and re-encode uploads so orientation is applied and source metadata is removed.
export async function compressImage(file) {
  if (
    !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
    file.size > 20 * 1024 * 1024
  )
    throw Error('JPG·PNG·WebP, 원본 20MB 이하 이미지를 선택해 주세요.');
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    for (const edge of [1600, 1200, 900, 640, 480]) {
      const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.86, 0.72, 0.55]) {
        const data = canvas.toDataURL('image/webp', quality);
        if (data.length < 540000) return data;
      }
    }
    throw Error('사진을 처리하지 못했습니다. 다른 파일이나 이미지 URL을 사용해 주세요.');
  } finally {
    bitmap.close();
  }
}
export function attachmentPicker(form, initial = [], urlFor = (id) => id, limit = 2) {
  let images = initial.map((x) => ({ ...x })),
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
      picture.style.backgroundImage = `url(${JSON.stringify(typeof x === 'string' ? x : x.url || urlFor(x.id))})`;
      picture.setAttribute('role', 'img');
      picture.setAttribute('aria-label', '첨부 사진 ' + (i + 1));
      remove.type = 'button';
      remove.textContent = '×';
      remove.className = 'attachment-remove';
      remove.setAttribute('aria-label', '첨부 사진 ' + (i + 1) + ' 취소');
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
      if (files.length + images.length > limit)
        throw Error('사진은 ' + limit + '장까지 첨부할 수 있습니다.');
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
  form.querySelector('[data-add-image-url]').onclick = () => {
    const field = form.querySelector('[data-image-url]');
    try {
      if (busy) throw Error('사진 준비가 끝난 뒤 링크를 추가해 주세요.');
      const url = new URL(field.value.trim());
      if (url.protocol !== 'https:' || url.username || url.password)
        throw Error('HTTPS 이미지 주소를 입력해 주세요.');
      if (images.length >= limit) throw Error('사진은 ' + limit + '장까지 첨부할 수 있습니다.');
      images.push({ url: url.href });
      field.value = '';
      render();
      status.textContent = '이미지 링크 추가 완료';
    } catch (e) {
      status.textContent =
        e instanceof TypeError ? '올바른 HTTPS 이미지 주소를 입력해 주세요.' : e.message;
    }
  };
  render();
  return () => {
    if (busy) throw Error('사진 준비가 끝난 뒤 등록해 주세요.');
    return images;
  };
}
export const uploadMarkup =
  '<div class="upload-field"><label>사진 첨부 · 최대 2장<input type="file" data-images accept="image/jpeg,image/png,image/webp" multiple></label><small>원본 20MB 이하 · 자동 압축 · 또는 HTTPS 이미지 링크</small><div class="image-url-row"><input type="url" data-image-url aria-label="이미지 URL" placeholder="https://… 이미지 주소"><button type="button" data-add-image-url>링크 추가</button></div><div class="upload-preview"></div><p class="upload-status" role="status"></p></div>';
