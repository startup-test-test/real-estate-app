const url = 'https://gtnzhnsbdmkadfawuzmc.supabase.co/auth/v1/verify?token=2ce0de006739b39c2f4c28cb72602d1dfcb0a072ae1fdbcff845185d&type=signup&redirect_to= https://laughing-space-giggle-jj7vv776jqj72jqvw-5173.app.github.dev';

const urlObj = new URL(url);
console.log('URL解析結果:');
console.log('Path:', urlObj.pathname);
console.log('Search params:');
urlObj.searchParams.forEach((value, key) => {
  console.log(`  ${key}: '${value}'`);
});

console.log('\nredirect_to パラメータの分析:');
const redirectTo = urlObj.searchParams.get('redirect_to');
console.log('redirect_to 値:', `'${redirectTo}'`);
console.log('redirect_to 長さ:', redirectTo ? redirectTo.length : 0);
console.log('redirect_to が空白文字のみ:', /^\s*$/.test(redirectTo || ''));
console.log('redirect_to をtrimした結果:', `'${(redirectTo || '').trim()}'`);
