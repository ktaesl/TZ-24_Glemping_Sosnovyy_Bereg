document.querySelectorAll('.gal button').forEach(function (b) {
  b.addEventListener('click', function () {
    var i = document.getElementById(b.dataset.target);
    i.src = b.dataset.src;
    i.alt = b.dataset.alt;
  });
});
var pc = document.getElementById('promo');
if (pc)
  pc.addEventListener('click', function () {
    if (navigator.clipboard)
      navigator.clipboard.writeText('WINTER20');
    pc.textContent = 'Скопировано';
  });
var th = document.getElementById('lead');
if (th) {
  try {
    var l = JSON.parse(sessionStorage.getItem('sb_last') || 'null');
    if (l)
      th.innerHTML = '<p>Номер брони: <b>' + l.id + '</b></p><p>Заезд: ' + l.in + ', ночей: ' + l.nights + '</p><p>Сумма: <b>' + SB.fmt(l.total) + '</b>, предоплата 30 %: <b>' + SB.fmt(Math.round(l.total * 0.3)) + '</b></p>';
    else
      th.textContent = 'Данные заявки не найдены. Позвоните: +7 (900) 424-24-42.';
  } catch (e) {
  }
}
