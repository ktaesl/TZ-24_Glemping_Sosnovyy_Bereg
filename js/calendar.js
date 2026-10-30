(function () {
  var S = {
      type: 'dome',
      in: null,
      out: null
    }, c = document.getElementById('cal'), msg = document.getElementById('msg'), $ = function (i) {
      return document.getElementById(i);
    };
  var DN = [
    'вс',
    'пн',
    'вт',
    'ср',
    'чт',
    'пт',
    'сб'
  ];
  function nights() {
    return Math.round((SB.pd(S.out) - SB.pd(S.in)) / 86400000);
  }
  function render() {
    var t = new Date(), y = t.getFullYear(), m = t.getMonth(), h = '', k, d, n, f, off, dt, s, cl;
    for (k = 0; k < 3; k++) {
      f = new Date(y, m + k, 1);
      n = new Date(y, m + k + 1, 0).getDate();
      off = (f.getDay() + 6) % 7;
      h += '<h3>' + f.toLocaleDateString('ru-RU', {
        month: 'long',
        year: 'numeric'
      }) + '</h3><div class="cal">' + [
        'пн',
        'вт',
        'ср',
        'чт',
        'пт',
        'сб',
        'вс'
      ].map(function (x) {
        return '<b>' + x + '</b>';
      }).join('') + '<span></span>'.repeat(off);
      for (d = 1; d <= n; d++) {
        dt = new Date(y, m + k, d);
        s = SB.ds(dt);
        cl = (SB.free(S.type, s) ? '' : 'busy ') + (S.in && s >= S.in && s <= (S.out || S.in) ? 'in' : '');
        h += '<button type="button" data-d="' + s + '" class="' + cl + '"' + (dt < new Date(y, m, t.getDate()) ? ' disabled' : '') + '>' + d + '</button>';
      }
      h += '</div>';
    }
    c.innerHTML = h;
  }
  function bad(t) {
    msg.textContent = t;
    S.out = null;
    render();
    update();
  }
  c.addEventListener('click', function (e) {
    var s = e.target.dataset.d;
    if (!s)
      return;
    msg.textContent = '';
    if (!S.in || S.out) {
      if (!SB.free(S.type, s))
        return bad('Эта ночь занята у всех домиков выбранного типа.');
      S.in = s;
      S.out = null;
      render();
      update();
      return;
    }
    if (s <= S.in) {
      if (!SB.free(S.type, s))
        return bad('Эта ночь занята.');
      S.in = s;
      render();
      update();
      return;
    }
    S.out = s;
    var n = nights(), i, dt;
    if (n > 14)
      return bad('Не больше 14 ночей.');
    for (i = 0; i < n; i++) {
      dt = SB.ds(new Date(SB.pd(S.in).getFullYear(), SB.pd(S.in).getMonth(), SB.pd(S.in).getDate() + i));
      if (!SB.free(S.type, dt))
        return bad('В этом периоде есть ночь, занятая у всех домиков типа.');
    }
    if (SB.calc(S.type, S.in, n).ny && n < 2)
      return bad('На новогодние ночи — минимум 2 ночи.');
    sbTrack('date_range_select', {
      check_in: S.in,
      nights: n,
      weekday_in: DN[SB.pd(S.in).getDay()]
    });
    render();
    update();
  });
  function opts() {
    var g = +$('guests').value;
    return {
      guests: g,
      bath: $('bath').checked,
      breakfast: $('bf').checked,
      skis: +$('skis').value || 0,
      transfer: +$('tr').value,
      pet: $('pet').checked
    };
  }
  function update() {
    var max = S.type === 'dome' ? 2 : 4, g = $('guests');
    g.max = max;
    if (+g.value > max)
      g.value = max;
    $('petw').hidden = S.type !== 'aframe';
    var b = $('book');
    if (!S.in || !S.out) {
      $('tot').textContent = 'Выберите даты';
      $('rows').innerHTML = '';
      b.disabled = true;
      return;
    }
    var n = nights(), r = SB.calc(S.type, S.in, n, opts());
    $('tot').textContent = SB.fmt(r.total);
    $('rows').innerHTML = r.rows.map(function (x) {
      return '<li>' + x + '</li>';
    }).join('');
    b.disabled = false;
    sbTrack('stay_calc', {
      house_type: S.type,
      nights: n,
      guests: +g.value,
      total_price: r.total
    });
    sessionStorage.setItem('sb_sel', JSON.stringify({
      type: S.type,
      in: S.in,
      nights: n,
      guests: +g.value,
      o: opts(),
      total: r.total
    }));
  }
  $('type').addEventListener('change', function () {
    S.type = this.value;
    S.in = S.out = null;
    msg.textContent = '';
    render();
    update();
  });
  document.querySelectorAll('#opts input,#opts select').forEach(function (el) {
    el.addEventListener('change', update);
  });
  $('book').addEventListener('click', function () {
    location.href = 'contacts.html';
  });
  render();
  update();
}());
