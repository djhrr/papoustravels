// Shared by the public site (applies the theme) and /admin/ (lists and previews them).
// "classic" is the original site look: it is the default and the fallback for anything unknown.
(function () {
  function t(name, type, banner, nav, muted, teal, bg, mission) {
    return { name: name, type: type, vars: { banner: banner, nav: nav, muted: muted, teal: teal, bg: bg, mission: mission || '#1b3b4f' } };
  }
  var THEMES = {
    classic:     t('Classic (default)', 'color', '#1E5020', '#666666', '#d9ead3', '#2b9aa3', '#f8f7f2'),
    ocean:       t('Ocean Blue',   'color', '#0b3d6b', '#1f4e79', '#d6e6f5', '#1e88c8', '#f5f9fc'),
    sunset:      t('Sunset Orange','color', '#b8470f', '#7a3b1c', '#fde6d0', '#d9731f', '#fdf8f3'),
    purple:      t('Royal Purple', 'color', '#4b2a7a', '#5b4a78', '#e6dcf3', '#7e57c2', '#f9f7fc'),
    cherry:      t('Cherry Red',   'color', '#9b1c2c', '#7a2a33', '#f6d9dc', '#c2384a', '#fcf7f7'),
    slate:       t('Slate Gray',   'color', '#263238', '#455a64', '#dfe5e8', '#546e7a', '#f6f7f8'),
    teal:        t('Teal',         'color', '#00695c', '#37615c', '#d3eeea', '#00897b', '#f4faf9'),
    rose:        t('Rose Pink',    'color', '#ad3a72', '#6d4a5d', '#f8dcea', '#d1568f', '#fdf6f9'),
    earth:       t('Earth Brown',  'color', '#5d4037', '#6d5a4c', '#eadfd2', '#a1704a', '#faf6f0'),

    newyear:     t("New Year's Day",  'holiday', '#1c1c1c', '#2b2b2b', '#f3e7b3', '#c9a227', '#fbf9f1'),
    mlk:         t('Martin Luther King Jr. Day', 'holiday', '#1f2a5a', '#3b3b3b', '#e3e6f3', '#5c6bc0', '#f8f8fb'),
    valentine:   t("Valentine's Day", 'holiday', '#c2185b', '#7b1f4a', '#fde0ec', '#e91e63', '#fff7fa'),
    presidents:  t("Presidents' Day", 'holiday', '#b22234', '#3c3b6e', '#e8ebf5', '#b22234', '#fafafd'),
    stpatrick:   t("St. Patrick's Day", 'holiday', '#1b7a2e', '#2e5e3a', '#d8f3dc', '#3aa655', '#f6fbf4'),
    easter:      t('Easter', 'holiday', '#8e6bbf', '#6f7fa8', '#fdf0c8', '#5bbfb0', '#fdf9fc'),
    mothers:     t("Mother's Day", 'holiday', '#c2527a', '#7a5a6a', '#fbe3ec', '#e07aa0', '#fff8fa'),
    memorial:    t('Memorial Day', 'holiday', '#1c3d7a', '#5a5a5a', '#e0e6f2', '#b22234', '#f9f9fb'),
    juneteenth:  t('Juneteenth', 'holiday', '#a61c1c', '#2b2b2b', '#f2e3b6', '#2e7d32', '#fbf8f2'),
    fathers:     t("Father's Day", 'holiday', '#1f4e79', '#4a5a66', '#d8e4ef', '#2e86ab', '#f6f9fb'),
    july4:       t('Independence Day', 'holiday', '#b22234', '#1f3a6e', '#dbe4f5', '#3c5fa8', '#fbfbfd'),
    labor:       t('Labor Day', 'holiday', '#1f3a5f', '#5a5f66', '#e1e6ec', '#d9822b', '#f8f8f6'),
    columbus:    t('Columbus Day', 'holiday', '#1f4e79', '#4a4a4a', '#dbe8f0', '#2b8aa3', '#f7f9fa'),
    halloween:   t('Halloween', 'holiday', '#e65100', '#1c1c1c', '#3b2a4a', '#e65100', '#fbf6ef', '#ffd9b3'),
    veterans:    t('Veterans Day', 'holiday', '#7a1f2b', '#25375f', '#e3e8f3', '#3c5a99', '#fafafc'),
    thanksgiving:t('Thanksgiving', 'holiday', '#a0522d', '#6b4423', '#f5dfbb', '#cc7722', '#fdf8ef'),
    christmas:   t('Christmas', 'holiday', '#b0201c', '#1f5a2c', '#dcefdc', '#2e7d32', '#fbf8f5'),
    nye:         t("New Year's Eve", 'holiday', '#0d1b3d', '#1a2a52', '#d9dcec', '#c9a227', '#f8f8fb')
  };

  function nth(y, m, dow, n) { var d = new Date(y, m, 1); d.setDate(1 + ((dow - d.getDay() + 7) % 7) + (n - 1) * 7); return d; }
  function last(y, m, dow) { var d = new Date(y, m + 1, 0); d.setDate(d.getDate() - ((d.getDay() - dow + 7) % 7)); return d; }
  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
        g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4,
        l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
        mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, mo - 1, da);
  }
  // date(y) = the holiday; the theme shows from `before` days ahead through `after` days past it.
  var HOLIDAYS = [
    { id: 'newyear',      before: 0,  after: 1, date: function (y) { return new Date(y, 0, 1); } },
    { id: 'mlk',          before: 1,  after: 0, date: function (y) { return nth(y, 0, 1, 3); } },
    { id: 'valentine',    before: 7,  after: 0, date: function (y) { return new Date(y, 1, 14); } },
    { id: 'presidents',   before: 2,  after: 0, date: function (y) { return nth(y, 1, 1, 3); } },
    { id: 'stpatrick',    before: 3,  after: 0, date: function (y) { return new Date(y, 2, 17); } },
    { id: 'easter',       before: 7,  after: 1, date: easter },
    { id: 'mothers',      before: 5,  after: 0, date: function (y) { return nth(y, 4, 0, 2); } },
    { id: 'memorial',     before: 3,  after: 0, date: function (y) { return last(y, 4, 1); } },
    { id: 'juneteenth',   before: 3,  after: 0, date: function (y) { return new Date(y, 5, 19); } },
    { id: 'fathers',      before: 5,  after: 0, date: function (y) { return nth(y, 5, 0, 3); } },
    { id: 'july4',        before: 7,  after: 0, date: function (y) { return new Date(y, 6, 4); } },
    { id: 'labor',        before: 3,  after: 0, date: function (y) { return nth(y, 8, 1, 1); } },
    { id: 'columbus',     before: 2,  after: 0, date: function (y) { return nth(y, 9, 1, 2); } },
    { id: 'halloween',    before: 14, after: 0, date: function (y) { return new Date(y, 9, 31); } },
    { id: 'veterans',     before: 3,  after: 0, date: function (y) { return new Date(y, 10, 11); } },
    { id: 'thanksgiving', before: 7,  after: 1, date: function (y) { return nth(y, 10, 4, 4); } },
    { id: 'christmas',    before: 24, after: 1, date: function (y) { return new Date(y, 11, 25); } },
    { id: 'nye',          before: 0,  after: 0, date: function (y) { return new Date(y, 11, 31); } }
  ];

  // Which holiday theme (if any) is active on `now`. Nearest holiday wins when windows overlap.
  function holidayFor(now) {
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()), best = null, bestDist = 1e9, DAY = 864e5;
    for (var y = today.getFullYear() - 1; y <= today.getFullYear() + 1; y++) {
      HOLIDAYS.forEach(function (h) {
        var diff = Math.round((today - h.date(y)) / DAY);
        if (diff >= -h.before && diff <= h.after && Math.abs(diff) < bestDist) { best = h.id; bestDist = Math.abs(diff); }
      });
    }
    return best;
  }

  // config: { theme: 'classic' | <id> | 'auto', base: <id used outside holidays when theme is 'auto'> }
  function resolve(config, now) {
    config = config || {};
    var pick = config.theme;
    if (pick === 'auto') pick = holidayFor(now || new Date()) || config.base;
    return THEMES[pick] ? pick : 'classic';
  }

  function apply(id) {
    var v = THEMES[id].vars, s = document.documentElement.style;
    s.setProperty('--banner', v.banner); s.setProperty('--nav', v.nav); s.setProperty('--muted', v.muted);
    s.setProperty('--teal', v.teal); s.setProperty('--bg', v.bg); s.setProperty('--mission-text', v.mission);
  }

  window.PAPOU_THEMES = { themes: THEMES, holidays: HOLIDAYS, resolve: resolve, holidayFor: holidayFor };
  if (window.PAPOU_THEME) { try { apply(resolve(window.PAPOU_THEME)); } catch (e) {} }
})();