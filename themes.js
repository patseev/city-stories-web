(() => {
  document.documentElement.dataset.theme = 'cover';
  document.querySelector('meta[name="theme-color"]').content = '#faf9f6';
  const url = new URL(location.href);
  url.searchParams.delete('style');
  if (url.hash === '#styles') url.hash = '';
  history.replaceState(null, '', url);
})();
