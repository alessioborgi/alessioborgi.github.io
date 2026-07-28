// Wrap wide article tables in a horizontally scrollable container.
//
// Markdown tables are emitted bare, so a wide row forces the whole page to
// scroll sideways on a phone. The common CSS-only fix (display: block on the
// <table>) drops the implicit ARIA table/row/cell roles in Firefox and Safari,
// which costs screen-reader users row and column navigation. Wrapping keeps the
// table element untouched, so its semantics survive.
(function () {
  function wrapTables() {
    var tables = document.querySelectorAll('.page__content table');
    for (var i = 0; i < tables.length; i++) {
      var table = tables[i];
      if (table.parentNode && table.parentNode.classList.contains('table-scroll')) continue;
      var wrap = document.createElement('div');
      wrap.className = 'table-scroll';
      // Only reachable by keyboard when it can actually scroll, so we don't
      // add empty tab stops for tables that fit.
      if (table.scrollWidth > table.clientWidth) {
        wrap.setAttribute('tabindex', '0');
        wrap.setAttribute('role', 'region');
        wrap.setAttribute('aria-label', 'Scrollable table');
      }
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wrapTables);
  } else {
    wrapTables();
  }
})();
