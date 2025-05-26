const websiteURL = process.env.NEXT_PUBLIC_SITE_URL?.split('//')[1];

const subject = encodeURIComponent(`Permohonan Dukungan untuk Website ${websiteURL}`);

const body = encodeURIComponent(
  `Halo Ilkoeri,

Saya harap email ini Anda terima dalam keadaan baik. Saya ingin mengajukan permohonan bantuan terkait kendala yang saya alami pada website ${websiteURL}.

Berikut adalah detail kendala yang saya hadapi:

-------
Nama     :
Peran    :
Deskripsi Kendala :
Langkah yang telah dicoba :
-------

Saya sangat menghargai bantuan Anda dalam menyelesaikan masalah ini. Jika diperlukan, saya bersedia memberikan informasi tambahan atau melakukan troubleshooting lebih lanjut.

Terima kasih atas waktu dan perhatiannya. Saya menantikan tanggapan Anda.

Hormat saya,
[Nama Anda]`
);

export const mailto = `mailto:khoeriilham@gmail.com
?subject=${subject}
&cc=oeriginal@gmail.com
&body=${body}`;
