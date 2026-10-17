/**
 * クライアントサイドでの画像リサイズ・Base64圧縮ユーティリティ
 * （ブラウザ保存容量の節約 ＆ SNSポスター画像書き出し時のCORSエラー防止）
 */

/**
 * FileまたはBlobを最大幅640pxのJPEGデータURLに圧縮変換する
 */
export async function compressImageBlob(blob: Blob, maxWidth = 640, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, maxWidth / img.width);
        const width = Math.round(img.width * ratio);
        const height = Math.round(img.height * ratio);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        // 白背景を敷いて透過PNGも綺麗に表示できるようにする
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('ファイルの読み取りに失敗しました'));
    reader.readAsDataURL(blob);
  });
}
