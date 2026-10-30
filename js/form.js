(function () {
  var f = document.getElementById('booking');
  if (!f)
    return;
  var EP = 'PASTE_APPS_SCRIPT_URL', sel = null, T = new Date();
  try {
    sel = JSON.parse(sessionStorage.getItem('sb_sel') || 'null');
  } catch (e) {
  }
  if (sel) {
    f.house_type.value = sel.type;
    f.check_in.value = sel.in;
    f.nights.value = sel.nights;
    f.guests.value = sel.guests;
  }
  var sm = document.getElementById('sum');
  if (sel)
    sm.textContent = 'Ваш расчёт: ' + SB.fmt(sel.total);
  function setE(n, m, t) {
    var e = f.elements[n];
    e.classList.add('bad');
    document.getElementById('e_' + n).textContent = m;
    sbTrack('form_error', {
      field_name: n,
      error_type: t
    });
    return false;
  }
  function ok(n) {
    f.elements[n].classList.remove('bad');
    document.getElementById('e_' + n).textContent = '';
  }
  function val() {
    var r = true, v = function (n, c, m, t) {
        ok(n);
        if (!c) {
          r = setE(n, m, t) && r;
          r = false;
        }
      }, x = f.elements, ph = x.phone.value.replace(/[\s\-()]/g, ''), n = +x.nights.value;
    v('name', x.name.value.trim().length >= 2 && x.name.value.trim().length <= 60, 'Введите имя от 2 до 60 символов', 'format');
    v('phone', /^\+7\d{10}$/.test(ph), ph ? 'Телефон в формате +7 и 10 цифр' : 'Укажите телефон', 'format');
    v('email', !x.email.value || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x.email.value), 'Проверьте e-mail', 'format');
    v('check_in', !!x.check_in.value && SB.pd(x.check_in.value) >= new Date(T.getFullYear(), T.getMonth(), T.getDate()), 'Выберите дату заезда в календаре', 'range');
    v('nights', n >= 1 && n <= 14, 'От 1 до 14 ночей', 'range');
    if (x.check_in.value && n >= 1 && SB.calc(x.house_type.value, x.check_in.value, n).ny && n < 2)
      v('nights', false, 'На Новый год — от 2 ночей', 'range');
    v('guests', +x.guests.value >= 1 && +x.guests.value <= (x.house_type.value === 'dome' ? 2 : 4), 'Купол — 1–2 гостя, «А-фрейм» — 1–4', 'range');
    v('consent', x.consent.checked, 'Нужно согласие на обработку данных', 'consent');
    return r;
  }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!val())
      return;
    var b = f.querySelector('button[type=submit]');
    b.disabled = true;
    var u = {};
    try {
      u = JSON.parse(sessionStorage.getItem('sb_utm') || '{}');
    } catch (_) {
    }
    var x = f.elements, d = {
        request_id: 'REQ-' + crypto.randomUUID(),
        name: x.name.value.trim(),
        phone: x.phone.value.replace(/[\s\-()]/g, ''),
        email: x.email.value.trim(),
        house_type: x.house_type.value,
        check_in: x.check_in.value,
        nights: +x.nights.value,
        guests: +x.guests.value,
        utm_source: u.source || 'direct',
        utm_medium: u.medium || 'none',
        utm_campaign: u.campaign || 'not_set',
        utm_content: u.content || 'not_set'
      };
    var o = sel && sel.type === d.house_type && sel.in === d.check_in && sel.nights === d.nights ? Object.assign({}, sel.o, { guests: d.guests }) : { guests: d.guests };
    var tot = SB.calc(d.house_type, d.check_in, d.nights, o).total;
    function fail() {
      b.disabled = false;
      sbTrack('form_error', {
        field_name: 'form',
        error_type: 'server'
      });
      document.getElementById('e_form').textContent = 'Не удалось отправить заявку. Позвоните: +7 (900) 424-24-42';
    }
    fetch(EP, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(d)
    }).then(function (r) {
      return r.json();
    }).then(function (j) {
      if (!j.ok)
        return fail();
      sbTrack('generate_lead', {
        lead_house_type: d.house_type,
        nights: d.nights,
        value: tot,
        currency: 'RUB'
      });
      sessionStorage.setItem('sb_last', JSON.stringify({
        id: d.request_id,
        in: d.check_in,
        nights: d.nights,
        total: tot
      }));
      location.href = 'thanks.html';
    }).catch(fail);
  });
}());
