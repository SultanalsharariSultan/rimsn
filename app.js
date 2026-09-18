const toast = document.querySelector('.toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

document.querySelectorAll('.pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.pill').forEach((item) => item.classList.remove('active'));
    pill.classList.add('active');
    const filter = pill.dataset.filter;
    document.querySelectorAll('.product-card').forEach((card) => {
      card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter);
    });
  });
});

let cartItems = 0;
document.querySelectorAll('.add-cart').forEach((button) => {
  button.addEventListener('click', () => {
    cartItems += 1;
    const count = document.querySelector('.cart-count');
    count.textContent = cartItems;
    count.style.display = 'flex';
    button.innerHTML = 'تمت الإضافة ✓';
    button.style.background = 'rgba(98,230,224,.12)';
    button.style.color = 'var(--cyan)';
    showToast('تمت إضافة المنتج إلى سلتك');
  });
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target && link.getAttribute('href') !== '#top') {
      event.preventDefault();
      showToast('هذه الصفحة ستكون متاحة قريباً');
    }
  });
});

document.querySelector('.icon-button[aria-label="تبديل اللغة"]').addEventListener('click', () => showToast('English experience is coming soon'));
document.querySelector('.menu-button').addEventListener('click', () => showToast('القائمة المتنقلة قيد التجهيز'));
