export function generateSecureId(length = 10): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  // const specialChars = "!@#$%^&*()-_=+[]{}|;:',.<>?/";
  const specialChars = '$&+=?@#*%!-';

  // Pastikan setidaknya satu dari masing-masing kategori
  const requiredChars = [
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    specialChars[Math.floor(Math.random() * specialChars.length)]
  ];

  // Gabungkan semua karakter yang memungkinkan
  const allChars = lowercase + uppercase + numbers + specialChars;
  const remainingLength = length - requiredChars.length;

  // Tambahkan karakter acak hingga panjang terpenuhi
  for (let i = 0; i < remainingLength; i++) {
    requiredChars.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Acak kembali hasilnya agar tidak berurutan
  return requiredChars.sort(() => Math.random() - 0.5).join('');
}
