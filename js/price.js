var SB = function () {
  var H = {
      dome: 6,
      aframe: 4
    }, P = {
      dome: [
        7900,
        9900
      ],
      aframe: [
        11900,
        14900
      ]
    }, BUSY = {};
  function ds(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function pd(s) {
    var a = s.split('-');
    return new Date(+a[0], a[1] - 1, +a[2]);
  }
  var t = new Date(), id, k, i;
  [
    'dome',
    'aframe'
  ].forEach(function (ty) {
    for (i = 1; i <= H[ty]; i++) {
      id = ty + i;
      BUSY[id] = [];
      for (k = 0; k < 120; k++)
        if ((k * 7 + i * 13 + (ty === 'dome' ? 0 : 5)) % 11 < 3)
          BUSY[id].push(ds(new Date(t.getFullYear(), t.getMonth(), t.getDate() + k)));
    }
  });
  for (i = 1; i <= 4; i++)
    BUSY['aframe' + i].push('2027-01-08', '2027-01-09');
  function free(ty, s) {
    for (var i = 1; i <= H[ty]; i++)
      if (BUSY[ty + i].indexOf(s) < 0)
        return true;
    return false;
  }
  function fmt(n) {
    return n.toLocaleString('ru-RU') + ' ₽';
  }
  function calc(ty, inS, n, o) {
    o = o || {};
    var rows = [], tot = 0, ny = false, d = pd(inS), i, dt, dw, m, dd, wk, b, l;
    for (i = 0; i < n; i++) {
      dt = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
      dw = dt.getDay();
      m = dt.getMonth() + 1;
      dd = dt.getDate();
      wk = dw === 5 || dw === 6;
      b = P[ty][wk ? 1 : 0];
      l = wk ? 'выходные' : 'будни';
      if (m === 12 && dd >= 30 || m === 1 && dd <= 2) {
        b = b * 1.5;
        l = 'новогодняя ночь ×1,5';
        ny = true;
      } else if (!wk && (m >= 11 || m <= 2)) {
        b = b * 0.8;
        l = 'будни со скидкой 20 %';
      }
      b = Math.round(b);
      tot += b;
      rows.push(ds(dt).slice(5).split('-').reverse().join('.') + ' · ' + [
        'вс',
        'пн',
        'вт',
        'ср',
        'чт',
        'пт',
        'сб'
      ][dw] + ' · ' + l + ' — ' + fmt(b));
    }
    function add(c, s) {
      tot += c;
      rows.push(s + ' — ' + fmt(c));
    }
    if (o.bath)
      add(4500, 'Баня на 3 часа');
    if (o.breakfast)
      add(800 * o.guests * n, 'Завтрак: ' + o.guests + ' гост. × ' + n + ' ноч.');
    if (+o.skis)
      add(600 * o.skis * n, 'Прокат лыж: ' + o.skis + ' × ' + n + ' дн.');
    if (+o.transfer)
      add(3000 * o.transfer, 'Трансфер: ' + o.transfer + ' × 3 000 ₽');
    if (o.pet && ty === 'aframe')
      add(1500, 'Проживание с животным');
    return {
      rows: rows,
      total: tot,
      ny: ny,
      fmt: fmt
    };
  }
  return {
    ds: ds,
    pd: pd,
    free: free,
    calc: calc,
    fmt: fmt
  };
}();
