const title = document.querySelector('.title')
const text1 = 'Hai Kamu!!, Happy Birthday!!'.split('')
const text2 = 'I Have Something For You<3'.split('')

// Membuat elemen div untuk baris pertama
const line1 = document.createElement('div');
text1.forEach(char => {
  if (char !== ' ') {
    line1.innerHTML += `<span>${char}</span>`
  } else {
    line1.innerHTML += `<span style='margin-right: 20px;'></span>`
  }
})
title.appendChild(line1);

// Membuat elemen div untuk baris kedua
const line2 = document.createElement('div');
text2.forEach(char => {
  if (char !== ' ') {
    line2.innerHTML += `<span>${char}</span>`
  } else {
    line2.innerHTML += `<span style='margin-right: 20px;'></span>`
  }
})
title.appendChild(line2);

// Menambahkan animasi dengan delay acak
const textElements = document.querySelectorAll('.title span');
textElements.forEach((element) => {
  const randomDelay = Math.random() * 3; // Menghasilkan delay acak antara 0 hingga 3 detik
  element.style.animationDelay = `${randomDelay}s`;
});